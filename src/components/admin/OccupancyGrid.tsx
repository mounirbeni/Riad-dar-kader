// Visual room-by-date occupancy matrix.
// Server component — fetches data, passes serialisable grid to client component.

import { prisma } from "@/lib/prisma";
import { todayUTC, toDateOnlyString, eachNight } from "@/lib/dates";
import { CalendarGrid } from "./CalendarGrid";

export type BookingCell = {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  reference: string;
  status: string;
  checkedIn: boolean;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  estimatedTotal: number;
  rooms: string[];
};

export type CellKind =
  | { type: "free" }
  | { type: "blocked"; reason?: string | null }
  | {
      type: "booking";
      bookingId: string;
      guestName: string;
      status: string;
      checkedIn: boolean;
      isFirst: boolean;
      isLast: boolean;
      actualStart: boolean;
      actualEnd: boolean;
    };

export async function OccupancyGrid({
  days = 14,
  offsetDays = 0,
  year,
}: {
  days?: number;
  offsetDays?: number;
  year?: number;
}) {
  const base = todayUTC();

  let windowStart: Date;
  let windowEnd: Date;

  if (year) {
    // Full-year mode: Jan 1 → Dec 31 (inclusive) of the requested year
    windowStart = new Date(Date.UTC(year, 0, 1));
    windowEnd   = new Date(Date.UTC(year + 1, 0, 1));
  } else {
    windowStart = new Date(base);
    windowStart.setUTCDate(windowStart.getUTCDate() + offsetDays);
    windowEnd = new Date(windowStart);
    windowEnd.setUTCDate(windowEnd.getUTCDate() + days);
  }

  // Total days in the window
  const totalDays = Math.round((windowEnd.getTime() - windowStart.getTime()) / 86400000);

  const dates: Date[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(windowStart);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d);
  }
  const dateStrs = dates.map(toDateOnlyString);

  const [rooms, bookings, blocked] = await Promise.all([
    prisma.room.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.booking.findMany({
      where: { status: { in: ["pending", "confirmed", "completed"] }, checkIn: { lt: windowEnd }, checkOut: { gt: windowStart } },
      include: { rooms: { include: { room: { select: { name: true } } } } },
    }),
    prisma.blockedDate.findMany({ where: { date: { gte: windowStart, lt: windowEnd } } }),
  ]);

  const blockedMap: Record<string, Set<string>> = { all: new Set() };
  for (const b of blocked) {
    const key = b.roomId ?? "all";
    if (!blockedMap[key]) blockedMap[key] = new Set();
    blockedMap[key].add(toDateOnlyString(b.date));
  }

  // Build occupancy grid (roomId → dateStr → CellKind)
  const grid: Record<string, Record<string, CellKind>> = {};
  for (const room of rooms) grid[room.id] = {};

  // Build booking lookup map
  const bookingMap: Record<string, BookingCell> = {};
  for (const booking of bookings) {
    const nights = eachNight(booking.checkIn, booking.checkOut);
    const nightCount = nights.length;
    const checkInStr = toDateOnlyString(booking.checkIn);
    bookingMap[booking.id] = {
      id: booking.id,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      guestEmail: booking.guestEmail,
      reference: booking.reference,
      status: booking.status,
      checkedIn: booking.checkedIn,
      checkIn: toDateOnlyString(booking.checkIn),
      checkOut: toDateOnlyString(booking.checkOut),
      guests: booking.guests,
      nights: nightCount,
      estimatedTotal: booking.estimatedTotal,
      rooms: booking.rooms.map(r => r.room.name),
    };

    for (const roomLink of booking.rooms) {
      const roomId = roomLink.roomId;
      if (!grid[roomId]) continue;
      const visibleNights = nights.filter(n => n >= windowStart && n < windowEnd);
      const lastNight = nights[nights.length - 1];
      for (let ni = 0; ni < visibleNights.length; ni++) {
        const night = visibleNights[ni];
        const dateStr = toDateOnlyString(night);
        grid[roomId][dateStr] = {
          type: "booking",
          bookingId: booking.id,
          guestName: booking.guestName,
          status: booking.status,
          checkedIn: booking.checkedIn,
          isFirst: ni === 0,
          isLast: ni === visibleNights.length - 1,
          actualStart: dateStr === checkInStr,
          actualEnd: toDateOnlyString(night) === toDateOnlyString(lastNight),
        };
      }
    }
  }

  function getCell(roomId: string, dateStr: string): CellKind {
    const b = grid[roomId]?.[dateStr];
    if (b) return b;
    if (blockedMap.all.has(dateStr) || blockedMap[roomId]?.has(dateStr)) return { type: "blocked" };
    return { type: "free" };
  }

  // Serialise grid for client component
  const serialisedGrid: Record<string, Record<string, CellKind>> = {};
  for (const room of rooms) {
    serialisedGrid[room.id] = {};
    for (const dateStr of dateStrs) {
      serialisedGrid[room.id][dateStr] = getCell(room.id, dateStr);
    }
  }

  return (
    <CalendarGrid
      rooms={rooms}
      dateStrs={dateStrs}
      grid={serialisedGrid}
      bookings={bookingMap}
      todayStr={toDateOnlyString(base)}
    />
  );
}
