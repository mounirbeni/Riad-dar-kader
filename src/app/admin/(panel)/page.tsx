import Link from "next/link";
import { getDashboardStats } from "@/lib/stats";
import { formatMAD } from "@/lib/money";
import { formatDateHuman } from "@/lib/dates";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Nouvelles demandes",
      value: stats.pending,
      href: "/admin/bookings?status=pending",
      accent: "text-terracotta",
    },
    {
      label: "Réservations confirmées à venir",
      value: stats.confirmedUpcoming,
      href: "/admin/bookings?status=confirmed",
      accent: "text-brass",
    },
    {
      label: "Demandes ce mois-ci",
      value: stats.bookingsThisMonth,
      href: "/admin/bookings",
      accent: "text-ink",
    },
    {
      label: "Taux d'occupation (ce mois)",
      value: `${stats.occupancyRate}%`,
      href: "/admin/calendar",
      accent: "text-ink",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-ink">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted">
          Vue d'ensemble de votre riad — {formatDateHuman(new Date(), "fr")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="card p-5 transition hover:shadow-soft"
          >
            <p className="text-sm text-muted">{c.label}</p>
            <p className={`mt-2 font-serif text-3xl ${c.accent}`}>{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="card p-5">
        <p className="text-sm text-muted">Revenu estimé (réservations confirmées ce mois)</p>
        <p className="mt-1 font-serif text-3xl text-terracotta">
          {formatMAD(stats.estimatedRevenueMonth, "fr")}
        </p>
        <p className="mt-1 text-xs text-muted">
          Estimation indicative, hors extras non confirmés.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-sand-200 px-5 py-4">
          <h2 className="font-serif text-xl text-ink">Prochaines arrivées</h2>
        </div>
        {stats.upcomingArrivals.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            Aucune arrivée à venir pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-sand-200">
            {stats.upcomingArrivals.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="font-medium text-ink hover:text-terracotta"
                  >
                    {b.guestName}
                  </Link>
                  <p className="text-xs text-muted">
                    {formatDateHuman(b.checkIn, "fr")} → {formatDateHuman(b.checkOut, "fr")} ·{" "}
                    {b.guests} pers. · {b.reference}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
