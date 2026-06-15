import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function AvailabilityPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = addDays(today, 29); // 30-day window

  const [rooms, blockedDates, bookings] = await Promise.all([
    prisma.room.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.blockedDate.findMany({
      where: { date: { gte: today, lte: endDate } },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ["confirmed", "pending"] },
        checkIn: { lte: endDate },
        checkOut: { gte: today },
      },
      include: { rooms: true },
    }),
  ]);

  // Build a set of blocked keys: "roomId|date" or "|date" for whole-riad blocks
  const blockedSet = new Set(
    blockedDates.map((b) => `${b.roomId ?? ""}|${toDateKey(new Date(b.date))}`)
  );

  // Build a map of booked keys: "roomId|date" → booking reference
  const bookedMap = new Map<string, { ref: string; id: string; status: string }>();
  for (const booking of bookings) {
    let cur = new Date(booking.checkIn);
    const out = new Date(booking.checkOut);
    while (cur < out) {
      const key = toDateKey(cur);
      for (const br of booking.rooms) {
        bookedMap.set(`${br.roomId}|${key}`, {
          ref: booking.reference,
          id: booking.id,
          status: booking.status,
        });
      }
      cur = addDays(cur, 1);
    }
  }

  // Generate 30 days
  const days: Date[] = [];
  for (let i = 0; i < 30; i++) days.push(addDays(today, i));

  const dayLabels = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

  function getCellStatus(roomId: string, date: Date): "booked" | "blocked" | "free" {
    const dk = toDateKey(date);
    if (bookedMap.has(`${roomId}|${dk}`)) return "booked";
    if (blockedSet.has(`${roomId}|${dk}`) || blockedSet.has(`|${dk}`)) return "blocked";
    return "free";
  }

  // Count free nights per room
  const roomFreeCounts = rooms.map((r) => ({
    room: r,
    free: days.filter((d) => getCellStatus(r.id, d) === "free").length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">Disponibilité</h1>
          <p className="mt-1 text-sm text-muted">30 prochains jours · Toutes les chambres actives</p>
        </div>
        <Link
          href="/admin/calendar"
          className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-sand/40 transition-colors"
        >
          Voir le calendrier →
        </Link>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[
          { color: "bg-emerald-100 border border-emerald-200", label: "Libre" },
          { color: "bg-terracotta/20 border border-terracotta/30", label: "Réservé (confirmé)" },
          { color: "bg-amber-100 border border-amber-200", label: "En attente" },
          { color: "bg-slate-200 border border-slate-300", label: "Bloqué" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ${l.color}`} />
            <span className="text-muted">{l.label}</span>
          </span>
        ))}
      </div>

      {/* Availability grid */}
      <div className="rounded-2xl bg-white border border-sand-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-[11px] border-collapse min-w-max">
            <thead>
              <tr className="bg-sand/60">
                <th className="sticky left-0 z-10 bg-sand/60 px-4 py-2.5 text-left text-xs font-semibold text-muted w-36 border-b border-r border-sand-200">
                  Chambre
                </th>
                {days.map((d) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  const isToday = toDateKey(d) === toDateKey(today);
                  return (
                    <th
                      key={toDateKey(d)}
                      className={`px-0 py-2 text-center w-8 border-b border-r border-sand-200/60 font-medium ${
                        isToday ? "text-terracotta" : isWeekend ? "text-ink/60" : "text-muted"
                      }`}
                    >
                      <div>{dayLabels[d.getDay()]}</div>
                      <div className={`text-[10px] ${isToday ? "font-bold" : "font-normal"}`}>{d.getDate()}</div>
                    </th>
                  );
                })}
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted border-b border-sand-200 whitespace-nowrap">
                  Nuits libres
                </th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, ri) => (
                <tr key={room.id} className={ri % 2 !== 0 ? "bg-sand/10" : ""}>
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-2 font-medium text-ink text-xs border-r border-sand-200 whitespace-nowrap">
                    {room.name}
                  </td>
                  {days.map((d) => {
                    const dk = toDateKey(d);
                    const status = getCellStatus(room.id, d);
                    const booking = bookedMap.get(`${room.id}|${dk}`);
                    const isToday = dk === toDateKey(today);
                    let cellCls = "border-r border-sand-200/40 ";
                    if (status === "free") cellCls += "bg-emerald-50 hover:bg-emerald-100 cursor-default";
                    else if (status === "blocked") cellCls += "bg-slate-200";
                    else if (booking?.status === "confirmed") cellCls += "bg-terracotta/20 cursor-pointer hover:bg-terracotta/30";
                    else cellCls += "bg-amber-100 cursor-pointer hover:bg-amber-200";
                    return (
                      <td
                        key={dk}
                        className={`${cellCls} ${isToday ? "ring-1 ring-inset ring-terracotta/40" : ""} p-0 h-8 w-8`}
                        title={
                          status === "booked"
                            ? `${booking?.ref} (${booking?.status})`
                            : status === "blocked"
                            ? "Bloqué"
                            : "Libre"
                        }
                      >
                        {status === "booked" && booking && (
                          <Link href={`/admin/bookings/${booking.id}`} className="flex h-full w-full items-center justify-center" />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center justify-center h-6 w-8 rounded-md text-xs font-bold ${
                      roomFreeCounts.find((r) => r.room.id === room.id)!.free > 20
                        ? "bg-emerald-100 text-emerald-700"
                        : roomFreeCounts.find((r) => r.room.id === room.id)!.free > 10
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {roomFreeCounts.find((r) => r.room.id === room.id)!.free}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {roomFreeCounts.map(({ room, free }) => (
          <div key={room.id} className="rounded-2xl bg-white border border-sand-200 shadow-sm p-4">
            <p className="text-xs text-muted mb-1 truncate">{room.name}</p>
            <p className="text-2xl font-bold text-ink">{free}<span className="text-sm font-normal text-muted"> / 30</span></p>
            <div className="mt-2 h-1.5 bg-sand rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(free / 30) * 100}%` }} />
            </div>
            <p className="text-[10px] text-muted mt-1">nuits disponibles</p>
          </div>
        ))}
      </div>
    </div>
  );
}
