// Visual room-by-date occupancy matrix (Cloudbeds-style planning board).
// Server component — fetches its own data.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayUTC, toDateOnlyString, eachNight } from "@/lib/dates";

const DAY_SHORT = ["D", "L", "M", "M", "J", "V", "S"];
const MONTH_SHORT = [
  "Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc",
];

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: "bg-terracotta",   text: "text-white",       border: "border-terracotta-dark" },
  pending:   { bg: "bg-amber-400",    text: "text-amber-950",   border: "border-amber-500" },
  completed: { bg: "bg-sand-300",     text: "text-ink/70",      border: "border-sand-400" },
};

type CellKind =
  | { type: "free" }
  | { type: "blocked"; reason?: string | null }
  | {
      type: "booking";
      bookingId: string;
      guestName: string;
      status: string;
      reference: string;
      isFirst: boolean; // first cell within our window (round left)
      isLast: boolean;  // last cell within our window (round right)
      actualStart: boolean; // true check-in date
      actualEnd: boolean;   // last night of stay
    };

type Grid = Record<string, Record<string, CellKind>>; // roomId → dateStr → CellKind

export async function OccupancyGrid({
  days = 14,
  offsetDays = 0,
}: {
  days?: number;
  offsetDays?: number;
}) {
  const base = todayUTC();
  const windowStart = new Date(base);
  windowStart.setUTCDate(windowStart.getUTCDate() + offsetDays);
  const windowEnd = new Date(windowStart);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + days);

  // Build date array
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(windowStart);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d);
  }

  const [rooms, bookings, blocked] = await Promise.all([
    prisma.room.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ["pending", "confirmed", "completed"] },
        checkIn: { lt: windowEnd },
        checkOut: { gt: windowStart },
      },
      include: { rooms: { select: { roomId: true } } },
    }),
    prisma.blockedDate.findMany({
      where: { date: { gte: windowStart, lt: windowEnd } },
    }),
  ]);

  // Build blocked lookup: "all" or roomId → Set<dateStr>
  const blockedMap: Record<string, Set<string>> = { all: new Set() };
  for (const b of blocked) {
    const key = b.roomId ?? "all";
    if (!blockedMap[key]) blockedMap[key] = new Set();
    blockedMap[key].add(toDateOnlyString(b.date));
  }

  // Build occupancy grid
  const grid: Grid = {};
  for (const room of rooms) grid[room.id] = {};

  for (const booking of bookings) {
    const nights = eachNight(booking.checkIn, booking.checkOut);
    const checkInStr = toDateOnlyString(booking.checkIn);

    for (const roomLink of booking.rooms) {
      const roomId = roomLink.roomId;
      if (!grid[roomId]) continue;

      const visibleNights = nights.filter(
        (n) => n >= windowStart && n < windowEnd
      );
      const lastNight = nights[nights.length - 1];

      for (let ni = 0; ni < visibleNights.length; ni++) {
        const night = visibleNights[ni];
        const dateStr = toDateOnlyString(night);
        const isFirst = ni === 0;
        const isLast = ni === visibleNights.length - 1;
        const actualStart = dateStr === checkInStr;
        const actualEnd = toDateOnlyString(night) === toDateOnlyString(lastNight);

        grid[roomId][dateStr] = {
          type: "booking",
          bookingId: booking.id,
          guestName: booking.guestName,
          status: booking.status,
          reference: booking.reference,
          isFirst,
          isLast,
          actualStart,
          actualEnd,
        };
      }
    }
  }

  // Build cell-render data with "nextIsSameBooking" flag per (room, dateIdx)
  type RenderedCell = CellKind & { noRightBorder?: boolean };

  function getCell(roomId: string, dateStr: string): CellKind {
    const booking = grid[roomId]?.[dateStr];
    if (booking) return booking;
    if (blockedMap.all.has(dateStr) || blockedMap[roomId]?.has(dateStr)) {
      return { type: "blocked", reason: null };
    }
    return { type: "free" };
  }

  const todayStr = toDateOnlyString(base);

  return (
    <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            {/* Room name header */}
            <th className="sticky left-0 z-20 w-36 min-w-[9rem] border-b border-r border-sand-200 bg-[#F7F4EF] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              Chambre
            </th>
            {dates.map((d) => {
              const dStr = toDateOnlyString(d);
              const isToday = dStr === todayStr;
              const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
              const showMonth = d.getUTCDate() === 1 || dStr === toDateOnlyString(dates[0]);
              return (
                <th
                  key={dStr}
                  className={`min-w-[38px] border-b border-r border-sand-100 px-0.5 py-1.5 text-center ${
                    isToday
                      ? "bg-terracotta/8 border-terracotta/20"
                      : isWeekend
                        ? "bg-sand/60"
                        : "bg-white"
                  }`}
                >
                  {showMonth && (
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted">
                      {MONTH_SHORT[d.getUTCMonth()]}
                    </div>
                  )}
                  <div className={`text-[10px] ${isToday ? "font-bold text-terracotta" : "text-muted"}`}>
                    {DAY_SHORT[d.getUTCDay()]}
                  </div>
                  <div
                    className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-terracotta text-white"
                        : "text-ink"
                    }`}
                  >
                    {d.getUTCDate()}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {rooms.map((room, ri) => {
            const rowBg = ri % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]";
            return (
              <tr key={room.id} className={rowBg}>
                {/* Room name cell */}
                <td className={`sticky left-0 z-10 border-r border-sand-200 px-4 py-0 ${rowBg}`}>
                  <div className="flex h-12 flex-col justify-center">
                    <span className="text-xs font-semibold text-ink leading-tight">
                      {room.name.replace("Chambre ", "").replace("Suite ", "")}
                    </span>
                    <span className="text-[10px] text-muted">
                      {room.name.startsWith("Suite") ? "Suite" : "Chambre"}
                    </span>
                  </div>
                </td>

                {/* Date cells */}
                {dates.map((d, di) => {
                  const dStr = toDateOnlyString(d);
                  const cell = getCell(room.id, dStr);
                  const isToday = dStr === todayStr;
                  const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;

                  // Check if next cell is same booking (to remove right border)
                  let noRightBorder = false;
                  if (cell.type === "booking" && di < dates.length - 1) {
                    const nextDateStr = toDateOnlyString(dates[di + 1]);
                    const nextCell = getCell(room.id, nextDateStr);
                    noRightBorder =
                      nextCell.type === "booking" &&
                      nextCell.bookingId === cell.bookingId;
                  }

                  const baseTdCls = [
                    "p-0 h-12",
                    noRightBorder ? "border-r-0" : "border-r border-sand-100",
                    isToday && cell.type !== "booking" ? "bg-terracotta/5" : "",
                    isWeekend && cell.type === "free" ? "bg-sand/30" : "",
                  ].filter(Boolean).join(" ");

                  if (cell.type === "booking") {
                    const st = STATUS_STYLE[cell.status] || STATUS_STYLE.confirmed;
                    const roundL = cell.isFirst;
                    const roundR = cell.isLast;

                    return (
                      <td key={dStr} className={baseTdCls}>
                        <Link
                          href={`/admin/bookings/${cell.bookingId}`}
                          title={`${cell.guestName} · ${cell.reference}`}
                          className={[
                            "block h-full transition-opacity hover:opacity-85",
                            st.bg,
                            cell.isFirst ? "ml-1" : "",
                            cell.isLast ? "mr-1" : "",
                            roundL && roundR
                              ? "rounded-lg"
                              : roundL
                                ? "rounded-l-lg"
                                : roundR
                                  ? "rounded-r-lg"
                                  : "",
                          ].join(" ")}
                        >
                          {cell.isFirst && (
                            <span
                              className={`flex h-full items-center px-2 text-[10px] font-semibold truncate max-w-[80px] ${st.text}`}
                            >
                              {cell.guestName.split(" ")[0]}
                            </span>
                          )}
                        </Link>
                      </td>
                    );
                  }

                  if (cell.type === "blocked") {
                    return (
                      <td key={dStr} className={baseTdCls}>
                        <div
                          className="m-1 h-10 rounded-lg"
                          style={{
                            background:
                              "repeating-linear-gradient(-45deg, #D5C9B8 0, #D5C9B8 2px, transparent 2px, transparent 8px)",
                          }}
                          title={cell.reason || "Bloqué"}
                        />
                      </td>
                    );
                  }

                  // free
                  return <td key={dStr} className={baseTdCls} />;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-sand-100 px-5 py-3 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-8 rounded-sm bg-terracotta" />
          Confirmée
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-8 rounded-sm bg-amber-400" />
          En attente
        </span>
        <span
          className="flex items-center gap-2"
        >
          <span
            className="inline-block h-3 w-8 rounded-sm"
            style={{
              background:
                "repeating-linear-gradient(-45deg, #D5C9B8 0, #D5C9B8 2px, transparent 2px, transparent 8px)",
            }}
          />
          Bloqué
        </span>
        <span className="flex items-center gap-2 ml-auto">
          <span className="inline-block h-3 w-3 rounded-full bg-terracotta" />
          Aujourd&apos;hui
        </span>
      </div>
    </div>
  );
}
