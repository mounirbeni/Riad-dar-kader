import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMAD } from "@/lib/money";
import { formatDateHuman, nightsBetween } from "@/lib/dates";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BookingActions } from "@/components/admin/BookingActions";
import { ownerWhatsAppLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      rooms: { include: { room: true } },
      extras: { include: { extra: true } },
    },
  });
  if (!booking) notFound();

  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const waUrl = ownerWhatsAppLink({
    reference: booking.reference,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestCountry: booking.guestCountry,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    optionLabel: booking.optionLabel,
    status: booking.status,
    estimatedTotal: booking.estimatedTotal,
    extras: booking.extras.map((e) => ({
      name: e.nameSnapshot,
      quantity: e.quantity,
    })),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/bookings"
            className="text-sm text-muted hover:text-terracotta"
          >
            ← Retour aux réservations
          </Link>
          <h1 className="mt-1 font-serif text-3xl text-ink">
            {booking.guestName}
          </h1>
          <p className="text-sm text-muted">Référence {booking.reference}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Stay */}
          <div className="card p-5">
            <h2 className="font-serif text-lg text-ink">Séjour</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Arrivée" value={formatDateHuman(booking.checkIn, "fr")} />
              <Field label="Départ" value={formatDateHuman(booking.checkOut, "fr")} />
              <Field label="Nuits" value={String(nights)} />
              <Field label="Voyageurs" value={String(booking.guests)} />
              {booking.optionLabel && (
                <Field label="Formule" value={booking.optionLabel} />
              )}
              <Field
                label="Chambres attribuées"
                value={
                  booking.rooms.map((r) => r.room.name).join(", ") || "—"
                }
              />
            </dl>
          </div>

          {/* Guest */}
          <div className="card p-5">
            <h2 className="font-serif text-lg text-ink">Coordonnées</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Email" value={booking.guestEmail} />
              <Field label="Téléphone" value={booking.guestPhone} />
              <Field label="Pays" value={booking.guestCountry || "—"} />
            </dl>
            {booking.specialRequests && (
              <div className="mt-4">
                <p className="text-sm text-muted">Demandes particulières</p>
                <p className="mt-1 text-sm text-ink">{booking.specialRequests}</p>
              </div>
            )}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-5"
            >
              WhatsApp au propriétaire
            </a>
          </div>

          {/* Extras */}
          <div className="card p-5">
            <h2 className="font-serif text-lg text-ink">Extras demandés</h2>
            {booking.extras.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Aucun extra.</p>
            ) : (
              <ul className="mt-3 divide-y divide-sand-200">
                {booking.extras.map((e) => (
                  <li key={e.id} className="flex justify-between py-2 text-sm">
                    <span className="text-ink">
                      {e.nameSnapshot}
                      {e.quantity > 1 ? ` ×${e.quantity}` : ""}
                    </span>
                    <span className="text-muted">
                      {formatMAD(e.priceSnapshot, "fr")} / unité
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-3">
              <span className="text-sm text-muted">Total estimé</span>
              <span className="font-serif text-xl text-terracotta">
                {formatMAD(booking.estimatedTotal, "fr")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            adminNotes={booking.adminNotes}
          />
          <div className="card p-5 text-xs text-muted">
            <p>Demande reçue le {formatDateHuman(booking.createdAt, "fr")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
