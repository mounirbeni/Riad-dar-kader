import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEUR } from "@/lib/money";
import { formatDateHuman, nightsBetween } from "@/lib/dates";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { BookingStatus } from "@prisma/client";
import { IconArrowRight, IconMoon, IconUsers } from "@/components/Icons";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "confirmed", label: "Confirmées" },
  { key: "cancelled", label: "Annulées" },
  { key: "completed", label: "Terminées" },
];

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status && status !== "all" ? (status as BookingStatus) : null;

  const bookings = await prisma.booking.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      rooms: { include: { room: { select: { name: true } } } },
      _count: { select: { extras: true } },
    },
  });

  const counts = await prisma.booking.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  const total = counts.reduce((s, c) => s + c._count._all, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-ink">Réservations</h1>
        <p className="mt-1 text-sm text-muted">
          {total} réservation{total > 1 ? "s" : ""} au total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (filter ?? "all") === f.key;
          const count = f.key === "all" ? total : (countMap[f.key] ?? 0);
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/bookings" : `/admin/bookings?status=${f.key}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-terracotta text-white shadow-sm"
                  : "bg-white text-ink/60 border border-sand-200 hover:border-terracotta/30 hover:text-ink"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? "bg-white/25 text-white" : "bg-sand-200 text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-sand-200 bg-white py-14 text-center text-muted shadow-sm">
          <p className="text-sm">Aucune réservation pour ce filtre.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
          {/* Column headers */}
          <div className="hidden border-b border-sand-100 bg-sand/30 px-6 py-3 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Voyageur</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Dates</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Durée</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Total</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Statut</span>
          </div>

          <ul className="divide-y divide-sand-100">
            {bookings.map((b) => {
              const nights = nightsBetween(b.checkIn, b.checkOut);
              return (
                <li key={b.id}>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="group flex flex-col gap-3 px-6 py-4 transition hover:bg-sand/40 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4"
                  >
                    {/* Guest */}
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-sm font-medium text-terracotta">
                        {b.guestName.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink group-hover:text-terracotta transition-colors">
                            {b.guestName}
                          </span>
                          <span className="hidden text-xs text-muted sm:inline">{b.reference}</span>
                        </div>
                        <p className="text-xs text-muted">
                          {b.rooms.map((r) => r.room.name).join(", ")}
                          {b._count.extras > 0 ? ` · ${b._count.extras} extra${b._count.extras > 1 ? "s" : ""}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <IconUsers size={12} className="text-muted/60" />
                        {formatDateHuman(b.checkIn, "fr")} →
                      </span>
                      <span className="text-xs">{formatDateHuman(b.checkOut, "fr")}</span>
                    </div>

                    {/* Nights */}
                    <span className="flex items-center gap-1 text-sm text-muted">
                      <IconMoon size={12} className="text-muted/60" />
                      {nights} nuit{nights > 1 ? "s" : ""}
                    </span>

                    {/* Total */}
                    <span className="font-medium text-terracotta">
                      {formatEUR(b.estimatedTotal, "fr")}
                    </span>

                    {/* Status */}
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <StatusBadge status={b.status} />
                      <IconArrowRight size={13} className="hidden text-muted sm:block opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
