import { prisma } from "@/lib/prisma";
import { eachNight, todayUTC, toDateOnlyString } from "@/lib/dates";

export type TodayArrival = {
  id: string;
  reference: string;
  guestName: string;
  guests: number;
  status: string;
  rooms: string[];
};

export type TodayDeparture = {
  id: string;
  reference: string;
  guestName: string;
  guests: number;
};

export type DashboardStats = {
  pending: number;
  confirmedUpcoming: number;
  bookingsThisMonth: number;
  estimatedRevenueMonth: number;
  occupancyRate: number;
  totalRooms: number;
  occupiedRoomsToday: number;
  availableRoomsToday: number;
  todayArrivals: TodayArrival[];
  todayDepartures: TodayDeparture[];
  upcomingArrivals: {
    id: string;
    reference: string;
    guestName: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    status: string;
  }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = todayUTC();
  const todayStr = toDateOnlyString(today);
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
  const daysInMonth = Math.round(
    (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  const [
    pending,
    activeRooms,
    bookingsThisMonth,
    confirmedThisMonth,
    upcoming,
    confirmedUpcoming,
    arrivalsToday,
    departuresToday,
    occupiedToday,
  ] = await Promise.all([
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.room.count({ where: { isActive: true } }),
    prisma.booking.count({
      where: { createdAt: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.booking.findMany({
      where: {
        status: "confirmed",
        checkIn: { lt: monthEnd },
        checkOut: { gt: monthStart },
      },
      select: {
        estimatedTotal: true,
        checkIn: true,
        checkOut: true,
        rooms: { select: { roomId: true } },
      },
    }),
    prisma.booking.findMany({
      where: { status: { in: ["confirmed", "pending"] }, checkIn: { gte: today } },
      orderBy: { checkIn: "asc" },
      take: 8,
      select: {
        id: true,
        reference: true,
        guestName: true,
        checkIn: true,
        checkOut: true,
        guests: true,
        status: true,
      },
    }),
    prisma.booking.count({
      where: { status: "confirmed", checkIn: { gte: today } },
    }),
    // Arrivals today = checkIn == today (pending OR confirmed)
    prisma.booking.findMany({
      where: {
        status: { in: ["pending", "confirmed"] },
        checkIn: today,
      },
      include: {
        rooms: { include: { room: { select: { name: true } } } },
      },
      orderBy: { guestName: "asc" },
    }),
    // Departures today = checkOut == today, confirmed
    prisma.booking.findMany({
      where: {
        status: { in: ["confirmed", "completed"] },
        checkOut: today,
      },
      select: { id: true, reference: true, guestName: true, guests: true },
      orderBy: { guestName: "asc" },
    }),
    // Occupied today = checkIn <= today < checkOut, confirmed
    prisma.booking.findMany({
      where: {
        status: "confirmed",
        checkIn: { lte: today },
        checkOut: { gt: today },
      },
      include: { rooms: { select: { roomId: true } } },
    }),
  ]);

  const estimatedRevenueMonth = confirmedThisMonth.reduce(
    (sum, b) => sum + b.estimatedTotal,
    0
  );

  const capacityRoomNights = activeRooms * daysInMonth;
  let bookedRoomNights = 0;
  for (const b of confirmedThisMonth) {
    const nights = eachNight(b.checkIn, b.checkOut).filter(
      (d) => d >= monthStart && d < monthEnd
    ).length;
    bookedRoomNights += nights * b.rooms.length;
  }
  const occupancyRate =
    capacityRoomNights > 0
      ? Math.min(100, Math.round((bookedRoomNights / capacityRoomNights) * 100))
      : 0;

  // Count unique occupied rooms today
  const occupiedRoomIds = new Set<string>();
  for (const b of occupiedToday) {
    for (const r of b.rooms) occupiedRoomIds.add(r.roomId);
  }
  const occupiedRoomsToday = occupiedRoomIds.size;

  return {
    pending,
    confirmedUpcoming,
    bookingsThisMonth,
    estimatedRevenueMonth,
    occupancyRate,
    totalRooms: activeRooms,
    occupiedRoomsToday,
    availableRoomsToday: Math.max(0, activeRooms - occupiedRoomsToday),
    todayArrivals: arrivalsToday.map((b) => ({
      id: b.id,
      reference: b.reference,
      guestName: b.guestName,
      guests: b.guests,
      status: b.status,
      rooms: b.rooms.map((r) => r.room.name),
    })),
    todayDepartures: departuresToday,
    upcomingArrivals: upcoming,
  };
}
