import { redirect } from "next/navigation";
import Link from "next/link";
import { getGuestSession } from "@/lib/guest-auth";
import { prisma } from "@/lib/prisma";
import { guestLogoutAction } from "@/app/actions/guest";
import { formatEUR } from "@/lib/money";
import { IconArrowRight } from "@/components/Icons";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: "En attente de confirmation", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmée", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Annulée", cls: "bg-red-100 text-red-600" },
  completed: { label: "Séjour terminé", cls: "bg-sand text-muted" },
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function nightCount(checkIn: Date, checkOut: Date) {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
}

export default async function GuestDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getGuestSession();
  if (!session) redirect(`/${locale}/compte/connexion`);

  const [user, bookings] = await Promise.all([
    prisma.guestUser.findUnique({ where: { id: session.sub } }),
    prisma.booking.findMany({
      where: { guestEmail: session.email },
      include: {
        rooms: { include: { room: { select: { name: true } } } },
        extras: { select: { nameSnapshot: true, quantity: true } },
        messages: { select: { id: true, isRead: true, sender: true }, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect(`/${locale}/compte/connexion`);

  const logoutWithLocale = guestLogoutAction.bind(null, locale);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Bonjour, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <form action={logoutWithLocale}>
          <button
            type="submit"
            className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm text-muted hover:text-ink transition-colors"
          >
            Se déconnecter
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-ink">{bookings.length}</p>
          <p className="text-xs text-muted mt-1">Réservation{bookings.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-emerald-600">{bookings.filter(b => b.status === "confirmed" || b.status === "completed").length}</p>
          <p className="text-xs text-muted mt-1">Confirmée{bookings.filter(b => b.status === "confirmed" || b.status === "completed").length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-amber-600">{bookings.filter(b => b.status === "pending").length}</p>
          <p className="text-xs text-muted mt-1">En attente</p>
        </div>
      </div>

      {/* Bookings */}
      <div>
        <h2 className="font-serif text-lg text-ink mb-4">Mes réservations</h2>

        {bookings.length === 0 ? (
          <div className="rounded-2xl bg-white border border-sand-200 p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sand text-muted">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="font-medium text-ink mb-1">Aucune réservation</p>
            <p className="text-sm text-muted mb-4">Planifiez votre séjour à Marrakech au Riad Dar Kader.</p>
            <Link
              href={`/${locale}/sejour`}
              className="inline-flex rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors"
            >
              Réserver un séjour
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const nights = nightCount(b.checkIn, b.checkOut);
              const roomNames = b.rooms.map(r => r.room.name).join(", ");
              const st = STATUS_LABELS[b.status] ?? { label: b.status, cls: "bg-sand text-muted" };
              const unreadMessages = b.messages.filter(m => m.sender === "admin" && !m.isRead).length;
              return (
                <Link
                  key={b.id}
                  href={`/${locale}/compte/reservations/${b.id}`}
                  className="block rounded-2xl bg-white border border-sand-200 shadow-sm p-5 hover:border-terracotta/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-lg">{b.reference}</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                        {unreadMessages > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white">{unreadMessages}</span>
                        )}
                      </div>
                      <p className="mt-2 font-medium text-ink">{roomNames || "Chambre"}</p>
                      <p className="text-sm text-muted mt-0.5">
                        {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {nights} nuit{nights !== 1 ? "s" : ""} · {b.guests} voyageur{b.guests !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-ink">{formatEUR(b.estimatedTotal)}</p>
                      <p className="text-xs text-muted">total estimé</p>
                    </div>
                  </div>

                  {b.extras.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-sand-200">
                      <p className="text-xs text-muted">
                        Extras : {b.extras.map(e => `${e.nameSnapshot}${e.quantity > 1 ? ` ×${e.quantity}` : ""}`).join(" · ")}
                      </p>
                    </div>
                  )}

                  {b.status === "pending" && (
                    <div className="mt-3 pt-3 border-t border-sand-200">
                      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                        Votre demande est en cours de traitement. Vous recevrez une confirmation par email sous 24h.
                      </p>
                    </div>
                  )}

                  {b.specialRequests && (
                    <div className="mt-3 pt-3 border-t border-sand-200">
                      <p className="text-xs text-muted italic">"{b.specialRequests}"</p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-sand-200 flex items-center justify-between">
                    <span className="text-xs text-muted">{b.messages.length} message{b.messages.length !== 1 ? "s" : ""}</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-terracotta">
                      Voir le détail
                      <IconArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
        <h2 className="font-medium text-ink mb-4">Mon profil</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted mb-0.5">Nom</p>
            <p className="text-ink">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Email</p>
            <p className="text-ink">{user.email}</p>
          </div>
          {user.phone && (
            <div>
              <p className="text-xs text-muted mb-0.5">Téléphone</p>
              <p className="text-ink">{user.phone}</p>
            </div>
          )}
          {user.country && (
            <div>
              <p className="text-xs text-muted mb-0.5">Pays</p>
              <p className="text-ink">{user.country}</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <Link href={`/${locale}/sejour`} className="inline-flex rounded-xl bg-terracotta px-6 py-3 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors shadow-sm">
          Faire une nouvelle réservation
        </Link>
      </div>
    </div>
  );
}
