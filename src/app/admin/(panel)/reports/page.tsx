import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const bookings = await prisma.booking.findMany({
    where: { status: { not: "cancelled" } },
    include: { rooms: { include: { room: true } } },
    orderBy: { checkIn: "asc" },
  });

  const rooms = await prisma.room.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  // Monthly revenue
  const monthlyMap = new Map<string, { revenue: number; bookings: number }>();
  for (const b of bookings) {
    const key = new Date(b.checkIn).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
    const existing = monthlyMap.get(key) ?? { revenue: 0, bookings: 0 };
    monthlyMap.set(key, { revenue: existing.revenue + b.estimatedTotal, bookings: existing.bookings + 1 });
  }
  const monthlyData = Array.from(monthlyMap.entries()).slice(-6).map(([month, data]) => ({ month, ...data }));
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);

  // Per-room stats
  const roomStats = rooms.map((room) => {
    const roomBookings = bookings.filter((b) => b.rooms.some((r) => r.room.id === room.id));
    const revenue = roomBookings.reduce((s, b) => s + b.estimatedTotal, 0);
    const nights = roomBookings.reduce((s, b) => {
      return s + Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000);
    }, 0);
    return { room, bookings: roomBookings.length, revenue, nights };
  }).sort((a, b) => b.revenue - a.revenue);

  // KPIs
  const totalRevenue = bookings.reduce((s, b) => s + b.estimatedTotal, 0);
  const totalBookings = bookings.length;
  const avgPerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  const allBookingsIncCancelled = await prisma.booking.count();
  const cancelledCount = await prisma.booking.count({ where: { status: "cancelled" } });
  const cancelRate = allBookingsIncCancelled > 0 ? Math.round((cancelledCount / allBookingsIncCancelled) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ink">Rapports</h1>
        <p className="mt-1 text-sm text-muted">Analyse des réservations et revenus</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Revenu total" value={`${totalRevenue.toLocaleString("fr-FR")} MAD`} icon="💰" />
        <KpiCard label="Réservations" value={String(totalBookings)} icon="📋" />
        <KpiCard label="Revenu moyen / rés." value={`${avgPerBooking.toLocaleString("fr-FR")} MAD`} icon="📊" />
        <KpiCard label="Taux d'annulation" value={`${cancelRate}%`} icon="❌" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue bar chart */}
        <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-6">
          <h2 className="font-semibold text-ink mb-1">Revenu des 6 derniers mois</h2>
          <p className="text-xs text-muted mb-5">Réservations confirmées et terminées</p>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {monthlyData.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted">{m.revenue > 0 ? `${(m.revenue / 1000).toFixed(0)}k` : ""}</span>
                  <div
                    className="w-full rounded-t-lg bg-terracotta/80 hover:bg-terracotta transition-colors"
                    style={{ height: `${Math.max(4, (m.revenue / maxRevenue) * 100)}%` }}
                    title={`${m.revenue.toLocaleString("fr-FR")} MAD · ${m.bookings} rés.`}
                  />
                  <span className="text-[10px] text-muted text-center leading-tight">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Per-room stats */}
        <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-6">
          <h2 className="font-semibold text-ink mb-5">Performance par chambre</h2>
          {roomStats.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">Aucune chambre active</p>
          ) : (
            <div className="space-y-4">
              {roomStats.map((rs) => {
                const pct = totalRevenue > 0 ? Math.round((rs.revenue / totalRevenue) * 100) : 0;
                return (
                  <div key={rs.room.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-ink">{rs.room.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-terracotta">{rs.revenue.toLocaleString("fr-FR")} MAD</span>
                        <span className="text-xs text-muted ml-2">({rs.bookings} rés.)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-sand rounded-full overflow-hidden">
                      <div className="h-full bg-terracotta/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted mt-0.5">{rs.nights} nuitée{rs.nights !== 1 ? "s" : ""} · {pct}% du revenu</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking status breakdown */}
      <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-6">
        <h2 className="font-semibold text-ink mb-5">Répartition par statut</h2>
        <StatusBreakdown bookings={bookings} allCount={allBookingsIncCancelled} cancelledCount={cancelledCount} />
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-bold text-ink mt-1">{value}</p>
    </div>
  );
}

function StatusBreakdown({ bookings, allCount, cancelledCount }: { bookings: any[]; allCount: number; cancelledCount: number }) {
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  const items = [
    { label: "Confirmées", count: confirmed, color: "bg-green-400" },
    { label: "Terminées", count: completed, color: "bg-blue-400" },
    { label: "En attente", count: pending, color: "bg-amber-400" },
    { label: "Annulées", count: cancelledCount, color: "bg-red-300" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className={`h-2 rounded-full mb-2 ${item.color}`} />
          <p className="text-2xl font-bold text-ink">{item.count}</p>
          <p className="text-xs text-muted mt-0.5">{item.label}</p>
          {allCount > 0 && (
            <p className="text-[10px] text-muted/60">{Math.round((item.count / allCount) * 100)}%</p>
          )}
        </div>
      ))}
    </div>
  );
}
