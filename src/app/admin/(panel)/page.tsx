import type { ReactNode } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/stats";
import { formatEUR } from "@/lib/money";
import { formatDateHuman } from "@/lib/dates";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  IconBell,
  IconCheckCircle,
  IconCalendar,
  IconBarChart,
  IconTrendingUp,
  IconArrowRight,
  IconBed,
  IconUsers,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

type StatCard = {
  label: string;
  value: string | number;
  sub?: string;
  href: string;
  accentText: string;
  accentBg: string;
  icon: ReactNode;
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const cards: StatCard[] = [
    {
      label: "Nouvelles demandes",
      value: stats.pending,
      sub: stats.pending === 0 ? "Tout est traité" : "À confirmer",
      href: "/admin/bookings?status=pending",
      accentText: stats.pending > 0 ? "text-terracotta" : "text-ink",
      accentBg: stats.pending > 0 ? "bg-terracotta/10 text-terracotta" : "bg-sand-200 text-muted",
      icon: <IconBell size={17} />,
    },
    {
      label: "Confirmées à venir",
      value: stats.confirmedUpcoming,
      sub: "prochains séjours",
      href: "/admin/bookings?status=confirmed",
      accentText: "text-brass",
      accentBg: "bg-brass/10 text-brass",
      icon: <IconCheckCircle size={17} />,
    },
    {
      label: "Ce mois-ci",
      value: stats.bookingsThisMonth,
      sub: "demandes reçues",
      href: "/admin/bookings",
      accentText: "text-ink",
      accentBg: "bg-sand-200 text-ink",
      icon: <IconUsers size={17} />,
    },
    {
      label: "Occupation (mois)",
      value: `${stats.occupancyRate}%`,
      sub: "des nuits disponibles",
      href: "/admin/calendar",
      accentText: stats.occupancyRate >= 70 ? "text-brass" : "text-ink",
      accentBg: stats.occupancyRate >= 70 ? "bg-brass/10 text-brass" : "bg-sand-200 text-ink",
      icon: <IconBarChart size={17} />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{formatDateHuman(new Date(), "fr")}</p>
          <h1 className="mt-0.5 font-serif text-3xl text-ink">{greeting}</h1>
        </div>
        <Link
          href="/admin/bookings?status=pending"
          className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-terracotta-dark"
        >
          <IconBell size={15} />
          {stats.pending > 0
            ? `${stats.pending} demande${stats.pending > 1 ? "s" : ""} en attente`
            : "Aucune demande en attente"}
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl border border-sand-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.accentBg}`}>
                {c.icon}
              </span>
              <IconArrowRight
                size={14}
                className="text-muted opacity-0 transition group-hover:opacity-100"
              />
            </div>
            <p className={`mt-4 font-serif text-4xl font-light ${c.accentText}`}>{c.value}</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{c.label}</p>
            {c.sub && <p className="mt-0.5 text-xs text-muted">{c.sub}</p>}
          </Link>
        ))}
      </div>

      {/* Revenue + occupancy hero row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-terracotta to-terracotta-dark p-6 text-white lg:col-span-2">
          <div className="absolute inset-0 bg-zellige opacity-15" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-white/60">
                  Revenu estimé · ce mois
                </p>
                <p className="mt-2 font-serif text-5xl font-light">
                  {formatEUR(stats.estimatedRevenueMonth, "fr")}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <IconTrendingUp size={20} />
              </span>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Estimation indicative des réservations confirmées ce mois-ci.
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-3">
          <QuickLink href="/admin/bookings" icon={<IconBell size={15} />} label="Voir toutes les réservations" />
          <QuickLink href="/admin/rooms" icon={<IconBed size={15} />} label="Gérer les chambres" />
          <QuickLink href="/admin/calendar" icon={<IconCalendar size={15} />} label="Bloquer des dates" />
        </div>
      </div>

      {/* Upcoming arrivals */}
      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-sand-200 px-6 py-4">
          <h2 className="font-serif text-xl text-ink">Prochaines arrivées</h2>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1 text-sm text-terracotta transition hover:gap-2"
          >
            Tout voir
            <IconArrowRight size={13} />
          </Link>
        </div>

        {stats.upcomingArrivals.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-sand-200 text-muted">
              <IconCalendar size={20} />
            </span>
            <p className="mt-3 text-sm text-muted">Aucune arrivée à venir pour le moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-sand-100">
            {stats.upcomingArrivals.map((b) => {
              const daysUntil = Math.round(
                (b.checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              return (
                <li key={b.id}>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition hover:bg-sand/50"
                  >
                    {/* Avatar */}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta/10 font-medium text-terracotta text-sm">
                      {b.guestName.slice(0, 1).toUpperCase()}
                    </span>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">{b.guestName}</span>
                        <span className="text-xs text-muted">{b.reference}</span>
                      </div>
                      <p className="text-xs text-muted">
                        {formatDateHuman(b.checkIn, "fr")} → {formatDateHuman(b.checkOut, "fr")} · {b.guests} pers.
                      </p>
                    </div>

                    {/* Days until */}
                    <div className="shrink-0 text-right">
                      <p className={`text-xs font-medium ${daysUntil <= 3 ? "text-terracotta" : "text-muted"}`}>
                        {daysUntil === 0
                          ? "Aujourd'hui"
                          : daysUntil === 1
                            ? "Demain"
                            : `J-${daysUntil}`}
                      </p>
                    </div>

                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-1 items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-3.5 text-sm font-medium text-ink shadow-sm transition hover:border-terracotta/30 hover:bg-sand/50 hover:text-terracotta"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-200 text-ink">
        {icon}
      </span>
      {label}
      <IconArrowRight size={13} className="ml-auto text-muted" />
    </Link>
  );
}
