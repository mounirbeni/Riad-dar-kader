import type { ReactNode } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/stats";
import { formatEUR } from "@/lib/money";
import { formatDateHuman } from "@/lib/dates";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OccupancyGrid } from "@/components/admin/OccupancyGrid";
import {
  IconBell,
  IconCheckCircle,
  IconCalendar,
  IconBarChart,
  IconTrendingUp,
  IconArrowRight,
  IconBed,
  IconUsers,
  IconCheck,
  IconUser,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const occupancyPct = Math.round((stats.occupiedRoomsToday / Math.max(stats.totalRooms, 1)) * 100);

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {formatDateHuman(new Date(), "fr")}
          </p>
          <h1 className="mt-0.5 font-serif text-3xl text-ink">{greeting}</h1>
        </div>
        {stats.pending > 0 && (
          <Link
            href="/admin/bookings?status=pending"
            className="inline-flex animate-pulse items-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-terracotta/30 transition hover:animate-none hover:bg-terracotta-dark"
          >
            <IconBell size={14} />
            {stats.pending} demande{stats.pending > 1 ? "s" : ""} en attente
          </Link>
        )}
      </div>

      {/* ── Today at a glance (Cloudbeds-style top strip) ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TodayCard
          label="Arrivées"
          value={stats.todayArrivals.length}
          sub="aujourd'hui"
          color={stats.todayArrivals.length > 0 ? "terracotta" : "neutral"}
          icon={<IconUser size={16} />}
          href="/admin/bookings?status=confirmed"
        />
        <TodayCard
          label="Départs"
          value={stats.todayDepartures.length}
          sub="aujourd'hui"
          color="brass"
          icon={<IconArrowRight size={16} />}
          href="/admin/bookings?status=confirmed"
        />
        <TodayCard
          label="Chambres occupées"
          value={`${stats.occupiedRoomsToday}/${stats.totalRooms}`}
          sub={`${occupancyPct}% occupation`}
          color={occupancyPct >= 60 ? "brass" : "neutral"}
          icon={<IconBed size={16} />}
          href="/admin/calendar"
        />
        <TodayCard
          label="Disponibles"
          value={stats.availableRoomsToday}
          sub="chambres libres"
          color="neutral"
          icon={<IconCheckCircle size={16} />}
          href="/admin/calendar"
        />
      </div>

      {/* ── Planning grid (14-day) ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Planning · 14 jours</h2>
          <Link
            href="/admin/calendar"
            className="inline-flex items-center gap-1 text-sm text-terracotta transition hover:gap-2"
          >
            Vue complète <IconArrowRight size={13} />
          </Link>
        </div>
        <OccupancyGrid days={14} />
      </section>

      {/* ── Today's arrivals + pending ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Today's check-ins */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
              <IconUser size={14} />
            </span>
            <h2 className="font-serif text-lg text-ink">Arrivées du jour</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
            {stats.todayArrivals.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                Aucune arrivée aujourd'hui.
              </p>
            ) : (
              <ul className="divide-y divide-sand-100">
                {stats.todayArrivals.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-sand/40"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-sm font-semibold text-terracotta">
                        {b.guestName[0].toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{b.guestName}</p>
                        <p className="text-xs text-muted">
                          {b.rooms.join(", ")} · {b.guests} pers.
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Today's check-outs */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass/10 text-brass">
              <IconArrowRight size={14} />
            </span>
            <h2 className="font-serif text-lg text-ink">Départs du jour</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
            {stats.todayDepartures.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                Aucun départ aujourd'hui.
              </p>
            ) : (
              <ul className="divide-y divide-sand-100">
                {stats.todayDepartures.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-sand/40"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass/10 text-sm font-semibold text-brass">
                        {b.guestName[0].toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-ink">{b.guestName}</p>
                        <p className="text-xs text-muted">{b.guests} pers. · {b.reference}</p>
                      </div>
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="rounded-lg border border-sand-200 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-terracotta hover:text-terracotta"
                      >
                        Voir
                      </Link>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ── Revenue + upcoming arrivals ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Revenue hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C1612] to-[#2D2018] p-6 text-white lg:col-span-1">
          <div className="absolute inset-0 bg-zellige opacity-10" />
          <div className="relative">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Revenu · ce mois
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <IconTrendingUp size={16} />
              </span>
            </div>
            <p className="mt-3 font-serif text-4xl font-light">
              {formatEUR(stats.estimatedRevenueMonth, "fr")}
            </p>
            <div className="mt-4 space-y-2 text-xs text-white/60">
              <div className="flex justify-between">
                <span>{stats.bookingsThisMonth} demandes</span>
                <span>{stats.confirmedUpcoming} à venir</span>
              </div>
              <div className="flex justify-between">
                <span>Occupation mois</span>
                <span className="font-semibold text-white/80">{stats.occupancyRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming arrivals */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">Prochaines arrivées</h2>
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-1 text-sm text-terracotta"
            >
              Tout voir <IconArrowRight size={13} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
            {stats.upcomingArrivals.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                Aucune arrivée à venir.
              </p>
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
                        className="flex items-center gap-3 px-5 py-3 transition hover:bg-sand/40"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-sm font-semibold text-terracotta">
                          {b.guestName[0].toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink">{b.guestName}</p>
                          <p className="text-xs text-muted">
                            {formatDateHuman(b.checkIn, "fr")} · {b.guests} pers.
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            daysUntil <= 1
                              ? "bg-terracotta/15 text-terracotta"
                              : daysUntil <= 3
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sand-200 text-muted"
                          }`}
                        >
                          {daysUntil === 0
                            ? "Aujourd'hui"
                            : daysUntil === 1
                              ? "Demain"
                              : `J-${daysUntil}`}
                        </span>
                        <StatusBadge status={b.status} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────

function TodayCard({
  label, value, sub, color, icon, href,
}: {
  label: string;
  value: string | number;
  sub: string;
  color: "terracotta" | "brass" | "neutral";
  icon: ReactNode;
  href: string;
}) {
  const palette = {
    terracotta: { bg: "bg-terracotta/10", text: "text-terracotta", val: "text-terracotta" },
    brass:      { bg: "bg-brass/10",      text: "text-brass",      val: "text-brass" },
    neutral:    { bg: "bg-sand-200",      text: "text-ink",        val: "text-ink" },
  }[color];

  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${palette.bg} ${palette.text}`}>
        {icon}
      </span>
      <div>
        <p className={`font-serif text-3xl font-light leading-none ${palette.val}`}>{value}</p>
        <p className="mt-0.5 text-[11px] font-semibold text-ink">{label}</p>
        <p className="text-[10px] text-muted">{sub}</p>
      </div>
    </Link>
  );
}
