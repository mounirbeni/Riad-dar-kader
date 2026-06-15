import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatEUR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  const bookings = await prisma.booking.findMany({
    where: { status: { not: "cancelled" } },
    orderBy: { createdAt: "desc" },
    include: { rooms: { include: { room: true } } },
  });

  // Group by email to build guest profiles
  const guestMap = new Map<string, {
    name: string; email: string; phone: string; country: string | null;
    bookings: typeof bookings; totalSpent: number;
  }>();

  for (const b of bookings) {
    if (!guestMap.has(b.guestEmail)) {
      guestMap.set(b.guestEmail, { name: b.guestName, email: b.guestEmail, phone: b.guestPhone, country: b.guestCountry ?? null, bookings: [], totalSpent: 0 });
    }
    const g = guestMap.get(b.guestEmail)!;
    g.bookings.push(b);
    g.totalSpent += b.estimatedTotal;
  }

  const guests = Array.from(guestMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Clients</h1>
          <p className="mt-1 text-sm text-muted">{guests.length} client{guests.length !== 1 ? "s" : ""} enregistré{guests.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {guests.length === 0 ? (
        <div className="rounded-2xl bg-white border border-sand-200 p-12 text-center">
          <p className="text-muted">Aucune réservation confirmée pour l'instant.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-sand-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-200 bg-sand/60">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden lg:table-cell">Pays</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Séjours</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Total dépensé</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g, i) => {
                  const initials = g.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={g.email} className={`border-b border-sand-200/50 hover:bg-sand/30 transition-colors ${i % 2 !== 0 ? "bg-sand/10" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-ink">{g.name}</p>
                            <p className="text-xs text-muted md:hidden">{g.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-ink/80">{g.email}</p>
                        <p className="text-xs text-muted">{g.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-muted hidden lg:table-cell">{g.country || "—"}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
                          {g.bookings.length}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-ink">
                        {formatEUR(g.totalSpent)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-sand-200 text-xs text-muted">
            Total : {formatEUR(guests.reduce((s, g) => s + g.totalSpent, 0))} générés · {guests.length} clients
          </div>
        </div>
      )}

      {/* Recent bookings by guest */}
      {guests.slice(0, 5).map((g) => (
        <div key={g.email} className="rounded-2xl bg-white border border-sand-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-sand-200 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold flex items-center justify-center shrink-0">
              {g.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-ink">{g.name}</p>
              <p className="text-xs text-muted">{g.email}</p>
            </div>
          </div>
          <div className="divide-y divide-sand-200/60">
            {g.bookings.map((b) => (
              <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-sand/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-ink">{b.reference}</p>
                  <p className="text-xs text-muted">
                    {new Date(b.checkIn).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    {" → "}
                    {new Date(b.checkOut).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    {" · "}
                    {b.rooms.map((r) => r.room.name).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink">{formatEUR(b.estimatedTotal)}</p>
                  <StatusBadge status={b.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-600",
    completed: "bg-blue-100 text-blue-700",
  };
  const labels: Record<string, string> = { confirmed: "Confirmé", pending: "En attente", cancelled: "Annulé", completed: "Terminé" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[status] ?? "bg-sand text-muted"}`}>{labels[status] ?? status}</span>;
}
