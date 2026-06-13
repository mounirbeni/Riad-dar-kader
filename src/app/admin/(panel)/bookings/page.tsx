import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMAD } from "@/lib/money";
import { formatDateHuman } from "@/lib/dates";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { BookingStatus } from "@prisma/client";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-ink">Demandes & réservations</h1>
        <p className="mt-1 text-sm text-muted">
          {bookings.length} résultat{bookings.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (filter ?? "all") === f.key;
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/bookings" : `/admin/bookings?status=${f.key}`}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                active
                  ? "bg-terracotta text-white"
                  : "bg-white text-ink/70 hover:bg-sand-200"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {bookings.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          Aucune réservation pour ce filtre.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-sand-200">
            {bookings.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/bookings/${b.id}`}
                  className="flex flex-col gap-2 px-5 py-4 transition hover:bg-sand sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{b.guestName}</span>
                      <span className="text-xs text-muted">{b.reference}</span>
                    </div>
                    <p className="text-xs text-muted">
                      {formatDateHuman(b.checkIn, "fr")} → {formatDateHuman(b.checkOut, "fr")} ·{" "}
                      {b.guests} pers.
                      {b.optionLabel ? ` · ${b.optionLabel}` : ""}
                      {b._count.extras > 0 ? ` · ${b._count.extras} extra(s)` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-terracotta">
                      {formatMAD(b.estimatedTotal, "fr")}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
