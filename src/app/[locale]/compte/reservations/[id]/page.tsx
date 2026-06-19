import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getGuestSession } from "@/lib/guest-auth";
import { prisma } from "@/lib/prisma";
import { formatEUR } from "@/lib/money";
import { sendGuestMessageAction } from "@/app/actions/chat";
import { IconArrowLeft } from "@/components/Icons";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

function fmt(d: Date, locale: string) {
  return new Date(d).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
function fmtTime(d: Date, locale: string) {
  return new Date(d).toLocaleString(locale === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function GuestBookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await getGuestSession();
  if (!session) redirect(`/${locale}/compte/connexion`);

  const dict = getDictionary(locale as Locale);
  const t = dict.account;

  const STATUS: Record<string, { label: string; cls: string }> = {
    pending:   { label: t.statusPending,   cls: "bg-amber-100 text-amber-700" },
    confirmed: { label: t.statusConfirmed, cls: "bg-emerald-100 text-emerald-700" },
    cancelled: { label: t.statusCancelled, cls: "bg-red-100 text-red-600" },
    completed: { label: t.statusCompleted, cls: "bg-sand text-muted" },
  };

  const booking = await prisma.booking.findFirst({
    where: { id, OR: [{ guestEmail: session.email }, { guestUserId: session.sub }] },
    include: {
      rooms: { include: { room: { select: { name: true } } } },
      extras: { select: { nameSnapshot: true, quantity: true, priceSnapshot: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!booking) notFound();

  // Mark all unread admin messages as read now that the guest is viewing them
  await prisma.bookingMessage.updateMany({
    where: { bookingId: booking.id, sender: "admin", isRead: false },
    data: { isRead: true },
  });

  const nights = Math.round((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000);
  const st = STATUS[booking.status] ?? { label: booking.status, cls: "bg-sand text-muted" };
  const roomNames = booking.rooms.map(r => r.room.name).join(", ");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <Link href={`/${locale}/compte`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-terracotta transition-colors">
          <IconArrowLeft size={14} />
          {t.backToBookings}
        </Link>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="font-mono text-sm font-bold text-terracotta bg-terracotta/10 px-3 py-1 rounded-lg">{booking.reference}</span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
        </div>
        <h1 className="font-serif text-2xl text-ink mt-2">{roomNames}</h1>
        <p className="text-sm text-muted">{fmt(booking.checkIn, locale)} → {fmt(booking.checkOut, locale)} · {nights} {nights !== 1 ? t.nights : t.night} · {booking.guests} {booking.guests !== 1 ? t.travellers : t.traveller}</p>
      </div>

      {/* Stay summary */}
      <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted">{t.estimatedTotal}</span>
          <span className="font-serif text-xl text-terracotta">{formatEUR(booking.estimatedTotal)}</span>
        </div>
        {booking.extras.length > 0 && (
          <div className="pt-3 border-t border-sand-200 space-y-1">
            {booking.extras.map((e, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-ink">{e.nameSnapshot}{e.quantity > 1 ? ` ×${e.quantity}` : ""}</span>
                <span className="text-muted">{formatEUR(e.priceSnapshot * e.quantity)}</span>
              </div>
            ))}
          </div>
        )}
        {booking.specialRequests && (
          <div className="pt-3 border-t border-sand-200">
            <p className="text-xs text-muted mb-1">{t.specialRequests}</p>
            <p className="text-sm text-ink italic">"{booking.specialRequests}"</p>
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="rounded-2xl bg-white border border-sand-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-sand-200 bg-sand/30">
          <h2 className="font-medium text-ink">{t.chatTitle}</h2>
          <p className="text-xs text-muted mt-0.5">{t.chatSubtitle}</p>
        </div>

        {/* Messages */}
        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
          {booking.messages.length === 0 ? (
            <p className="text-center text-sm text-muted py-6">
              {booking.status === "pending" ? t.chatPendingMsg : t.chatEmpty}
            </p>
          ) : (
            booking.messages.map((msg) => {
              const isGuest = msg.sender === "guest";
              return (
                <div key={msg.id} className={`flex ${isGuest ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isGuest ? "bg-terracotta text-white rounded-br-sm" : "bg-sand border border-sand-200 text-ink rounded-bl-sm"}`}>
                    {!isGuest && <p className="text-[10px] font-semibold text-terracotta mb-1 uppercase tracking-wide">{msg.senderName}</p>}
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1.5 ${isGuest ? "text-white/60" : "text-muted"}`}>{fmtTime(msg.createdAt, locale)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Send message (only if confirmed or completed) */}
        {(booking.status === "confirmed" || booking.status === "completed") && (
          <div className="border-t border-sand-200 p-4">
            <form action={sendGuestMessageAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <div className="flex gap-2">
                <input
                  name="content"
                  type="text"
                  required
                  placeholder={t.writeMessage}
                  className="flex-1 rounded-xl border border-sand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors shrink-0"
                >
                  {t.send}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
