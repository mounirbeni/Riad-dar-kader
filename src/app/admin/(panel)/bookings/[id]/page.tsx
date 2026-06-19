import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatEUR } from "@/lib/money";
import { formatDateHuman, nightsBetween } from "@/lib/dates";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BookingActions } from "@/components/admin/BookingActions";
import { ownerWhatsAppLink } from "@/lib/whatsapp";
import { AdminBookingChat } from "@/components/admin/AdminBookingChat";
import {
  IconArrowLeft,
  IconCalendar,
  IconUser,
  IconMoon,
  IconBed,
  IconCheck,
  IconMail,
  IconBell,
  IconClipboardList,
} from "@/components/Icons";

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
      messages: { orderBy: { createdAt: "asc" } },
      statusHistory: { orderBy: { createdAt: "desc" } },
      emailLogs: { orderBy: { createdAt: "desc" } },
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
      {/* Back + title */}
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-terracotta"
        >
          <IconArrowLeft size={14} />
          Retour aux réservations
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 font-serif text-xl text-terracotta">
              {booking.guestName.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <h1 className="font-serif text-3xl text-ink">{booking.guestName}</h1>
              <p className="text-sm text-muted font-mono">{booking.reference}</p>
            </div>
          </div>
          <StatusBadge status={booking.status} large />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — stay, guest, extras */}
        <div className="space-y-5 lg:col-span-2">

          {/* Stay overview strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat icon={<IconCalendar size={14} />} label="Arrivée" value={formatDateHuman(booking.checkIn, "fr")} />
            <MiniStat icon={<IconCalendar size={14} />} label="Départ" value={formatDateHuman(booking.checkOut, "fr")} />
            <MiniStat icon={<IconMoon size={14} />} label="Nuits" value={String(nights)} />
            <MiniStat icon={<IconUser size={14} />} label="Voyageurs" value={String(booking.guests)} />
          </div>

          {/* Stay details */}
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
            <div className="border-b border-sand-100 bg-sand/30 px-5 py-3.5">
              <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
                <IconBed size={16} className="text-terracotta" />
                Séjour
              </h2>
            </div>
            <dl className="grid gap-4 p-5 sm:grid-cols-2">
              {booking.optionLabel && (
                <DetailField label="Formule" value={booking.optionLabel} />
              )}
              <DetailField
                label="Chambres attribuées"
                value={booking.rooms.map((r) => r.room.name).join(", ") || "—"}
              />
              <DetailField
                label="Demande reçue"
                value={formatDateHuman(booking.createdAt, "fr")}
              />
            </dl>
          </div>

          {/* Guest contact */}
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
            <div className="border-b border-sand-100 bg-sand/30 px-5 py-3.5">
              <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
                <IconUser size={16} className="text-terracotta" />
                Coordonnées
              </h2>
            </div>
            <div className="p-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailField label="Email" value={booking.guestEmail} copyable />
                <DetailField label="Téléphone" value={booking.guestPhone} copyable />
                <DetailField label="Pays" value={booking.guestCountry || "—"} />
              </dl>
              {booking.specialRequests && (
                <div className="mt-4 rounded-xl bg-sand/60 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Demandes particulières
                  </p>
                  <p className="mt-1 text-sm text-ink">{booking.specialRequests}</p>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`mailto:${booking.guestEmail}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:border-terracotta/30 hover:text-terracotta"
                >
                  <IconMail size={14} />
                  Envoyer un email
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Extras + total */}
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
            <div className="border-b border-sand-100 bg-sand/30 px-5 py-3.5">
              <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
                <IconCheck size={16} className="text-terracotta" />
                Extras & total
              </h2>
            </div>
            <div className="p-5">
              {booking.extras.length === 0 ? (
                <p className="text-sm text-muted">Aucun extra demandé.</p>
              ) : (
                <ul className="space-y-2">
                  {booking.extras.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between rounded-xl bg-sand/50 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-ink">
                        {e.nameSnapshot}
                        {e.quantity > 1 && (
                          <span className="ml-1 text-muted">×{e.quantity}</span>
                        )}
                      </span>
                      <span className="text-muted">
                        {formatEUR(e.priceSnapshot, "fr")} / unité
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {/* Total */}
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-terracotta/5 to-brass/5 border border-sand-200 px-5 py-4">
                <span className="text-sm font-medium text-muted">Total estimé</span>
                <span className="font-serif text-2xl text-terracotta">
                  {formatEUR(booking.estimatedTotal, "fr")}
                </span>
              </div>
            </div>
          </div>

          {/* Status history */}
          {booking.statusHistory.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
              <div className="border-b border-sand-100 bg-sand/30 px-5 py-3.5">
                <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
                  <IconClipboardList size={16} className="text-terracotta" />
                  Historique des statuts
                </h2>
              </div>
              <ul className="divide-y divide-sand-100">
                {booking.statusHistory.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                    <div className="flex items-center gap-2 text-muted">
                      {h.fromStatus && (
                        <>
                          <StatusPill status={h.fromStatus} />
                          <span>→</span>
                        </>
                      )}
                      <StatusPill status={h.toStatus} />
                    </div>
                    <span className="text-xs text-muted">
                      {new Date(h.createdAt).toLocaleString("fr-FR", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit", timeZone: "UTC",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Email log */}
          {booking.emailLogs.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
              <div className="border-b border-sand-100 bg-sand/30 px-5 py-3.5">
                <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
                  <IconBell size={16} className="text-terracotta" />
                  Emails envoyés
                </h2>
              </div>
              <ul className="divide-y divide-sand-100">
                {booking.emailLogs.map((log) => (
                  <li key={log.id} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{log.subject}</p>
                      <p className="text-xs text-muted">{log.to}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${log.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {log.status === "sent" ? "Envoyé" : "Échec"}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(log.createdAt).toLocaleString("fr-FR", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit", timeZone: "UTC",
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right — actions + chat */}
        <div className="space-y-5">
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            adminNotes={booking.adminNotes}
          />
          <AdminBookingChat
            bookingId={booking.id}
            messages={booking.messages}
            guestName={booking.guestName}
            checkIn={booking.checkIn}
          />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-muted">
        {icon}
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 font-medium text-ink">{value}</p>
    </div>
  );
}

function DetailField({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`mt-1 text-sm font-medium text-ink ${copyable ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };
  const label: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    completed: "Terminé",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[status] ?? "bg-sand-100 text-ink"}`}>
      {label[status] ?? status}
    </span>
  );
}
