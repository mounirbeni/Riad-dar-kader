import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getGuestSession } from "@/lib/guest-auth";
import { prisma } from "@/lib/prisma";
import { guestLogoutAction } from "@/app/actions/guest";
import { formatEUR } from "@/lib/money";
import { IconArrowRight } from "@/components/Icons";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { guestWhatsAppLink } from "@/lib/whatsapp";
import { DashboardTabs } from "@/components/guest/DashboardTabs";

export const dynamic = "force-dynamic";

function fmtShort(d: Date, locale: string) {
  return new Date(d).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric", month: "short", timeZone: "UTC",
  });
}
function nightCount(a: Date, b: Date) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function daysUntil(d: Date) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}
function monthLabel(d: Date, locale: string) {
  return new Date(d).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", { month: "short", timeZone: "UTC" });
}

export default async function GuestDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab = "all" } = await searchParams;

  const session = await getGuestSession();
  if (!session) redirect(`/${locale}/compte/connexion`);

  const dict = getDictionary(locale as Locale);
  const t = dict.account;

  const STATUS: Record<string, { label: string; cls: string; dot: string; bar: string }> = {
    pending:   { label: t.statusPending,   cls: "bg-amber-50 text-amber-700 border border-amber-200",      dot: "bg-amber-400",   bar: "bg-amber-400" },
    confirmed: { label: t.statusConfirmed, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500", bar: "bg-emerald-500" },
    cancelled: { label: t.statusCancelled, cls: "bg-red-50 text-red-600 border border-red-200",            dot: "bg-red-400",     bar: "bg-red-400" },
    completed: { label: t.statusCompleted, cls: "bg-sand text-muted border border-sand-200",               dot: "bg-muted/40",    bar: "bg-muted/30" },
  };

  const [user, allBookings] = await Promise.all([
    prisma.guestUser.findUnique({ where: { id: session.sub } }),
    prisma.booking.findMany({
      where: { OR: [{ guestEmail: session.email }, { guestUserId: session.sub }] },
      include: {
        rooms: { include: { room: { select: { name: true } } } },
        extras: { select: { nameSnapshot: true, quantity: true } },
        messages: {
          select: { id: true, isRead: true, sender: true, content: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect(`/${locale}/compte/connexion`);

  const now = new Date();

  const bookings = allBookings.filter((b) => {
    if (tab === "upcoming") return (b.status === "confirmed" || b.status === "pending") && new Date(b.checkOut) >= now;
    if (tab === "past")     return b.status === "completed" || (b.status === "confirmed" && new Date(b.checkOut) < now);
    if (tab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const confirmedCount = allBookings.filter(b => b.status === "confirmed" || b.status === "completed").length;
  const totalNights = allBookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((acc, b) => acc + nightCount(b.checkIn, b.checkOut), 0);
  const totalSpent = allBookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((acc, b) => acc + b.estimatedTotal, 0);

  const unreadMessages = allBookings.flatMap(b =>
    b.messages
      .filter(m => m.sender === "admin" && !m.isRead)
      .map(m => ({ ...m, bookingId: b.id, reference: b.reference }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const nextStay = allBookings
    .filter(b => b.status === "confirmed" && new Date(b.checkIn) > now)
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())[0];

  const tabCounts = {
    all:       allBookings.length,
    upcoming:  allBookings.filter(b => (b.status === "confirmed" || b.status === "pending") && new Date(b.checkOut) >= now).length,
    past:      allBookings.filter(b => b.status === "completed" || (b.status === "confirmed" && new Date(b.checkOut) < now)).length,
    cancelled: allBookings.filter(b => b.status === "cancelled").length,
  };

  const initials = user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const logoutWithLocale = guestLogoutAction.bind(null, locale);
  const waUrl = guestWhatsAppLink(locale as "fr" | "en");

  const quickActions = [
    {
      href: `/${locale}/sejour`,
      label: t.newBooking,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="10" y1="17" x2="14" y2="17"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/chambres`,
      label: locale === "en" ? "Rooms" : "Chambres",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/experiences`,
      label: locale === "en" ? "Experiences" : "Expériences",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
    {
      href: waUrl,
      label: "WhatsApp",
      external: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/galerie`,
      label: locale === "en" ? "Gallery" : "Galerie",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/contact`,
      label: locale === "en" ? "Contact" : "Contact",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91A16 16 0 0016 17.91l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.92z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-sand">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-terracotta via-terracotta/90 to-brass/80 px-4 pt-8 pb-20 safe-top">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm font-serif text-lg font-bold text-white ring-2 ring-white/30">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white/70 text-xs">{t.hello},</p>
              <h1 className="font-serif text-xl text-white leading-tight truncate">{user.name}</h1>
              <p className="text-white/50 text-[11px] truncate">{user.email}</p>
            </div>
          </div>
          <form action={logoutWithLocale} className="shrink-0">
            <button
              type="submit"
              className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-xs text-white backdrop-blur-sm hover:bg-white/20 active:bg-white/30 transition-colors"
            >
              {t.signOut}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 pb-24 space-y-4">

        {/* ── Stats strip ──────────────────────────────────── */}
        {/* Scrollable row on mobile, 4-col grid on sm+ */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { value: String(allBookings.length), label: allBookings.length !== 1 ? t.bookingCountPlural : t.bookingCount, color: "text-ink" },
            { value: String(confirmedCount),     label: confirmedCount !== 1 ? t.confirmedCountPlural : t.confirmedCount, color: "text-emerald-600" },
            { value: String(totalNights),        label: totalNights !== 1 ? t.nights : t.night,                          color: "text-terracotta" },
            { value: formatEUR(totalSpent),      label: locale === "en" ? "Total spent" : "Total dépensé",               color: "text-brass" },
          ].map(({ value, label, color }) => (
            <div key={label} className="shrink-0 w-28 sm:w-auto rounded-2xl bg-white border border-sand-200 shadow-sm p-4 text-center">
              <p className={`text-lg font-bold ${color} truncate`}>{value}</p>
              <p className="text-[10px] text-muted mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Unread messages ───────────────────────────────── */}
        {unreadMessages.length > 0 && (
          <div className="rounded-2xl border border-terracotta/20 bg-terracotta/5 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-terracotta animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                {unreadMessages.length} {locale === "en" ? "unread" : "non lu"}{unreadMessages.length > 1 ? "s" : ""}
              </p>
            </div>
            {unreadMessages.slice(0, 3).map((m) => (
              <Link
                key={m.id}
                href={`/${locale}/compte/reservations/${m.bookingId}`}
                className="flex items-center gap-3 rounded-xl bg-white border border-sand-200 px-4 py-3 min-h-[52px] hover:border-terracotta/30 active:bg-sand transition-colors"
              >
                <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-full bg-terracotta/10">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-terracotta uppercase tracking-wide">{m.reference}</p>
                  <p className="text-sm text-ink truncate">{m.content}</p>
                </div>
                <IconArrowRight size={14} className="text-muted shrink-0" />
              </Link>
            ))}
            {unreadMessages.length > 3 && (
              <p className="text-xs text-center text-muted">+{unreadMessages.length - 3} {locale === "en" ? "more" : "de plus"}</p>
            )}
          </div>
        )}

        {/* ── Next stay highlight ───────────────────────────── */}
        {nextStay && (() => {
          const days = daysUntil(nextStay.checkIn);
          const nights = nightCount(nextStay.checkIn, nextStay.checkOut);
          const roomNames = nextStay.rooms.map(r => r.room.name).join(", ");
          return (
            <Link
              href={`/${locale}/compte/reservations/${nextStay.id}`}
              className="block rounded-2xl bg-gradient-to-br from-terracotta/5 via-white to-brass/5 border border-terracotta/20 shadow-sm p-5 active:bg-terracotta/5 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-terracotta animate-pulse" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-terracotta">
                  {locale === "en" ? "Next stay" : "Prochain séjour"}
                </p>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-lg text-ink truncate">{roomNames}</p>
                  <p className="text-sm text-muted mt-1">
                    {fmtShort(nextStay.checkIn, locale)} → {fmtShort(nextStay.checkOut, locale)}
                    {" · "}{nights} {nights !== 1 ? t.nights : t.night}
                  </p>
                  <p className="mt-1.5 text-xs text-muted">
                    {locale === "en" ? "Check-in 2 PM · Check-out 12 PM" : "Arrivée 14h · Départ 12h"}
                  </p>
                </div>
                <div className="shrink-0 rounded-xl bg-terracotta/10 px-4 py-3 text-center min-w-[60px]">
                  <p className="text-3xl font-bold text-terracotta leading-none">{days}</p>
                  <p className="text-[10px] text-terracotta/80 mt-1">
                    {locale === "en" ? (days === 1 ? "day" : "days") : (days <= 1 ? "jour" : "jours")}
                  </p>
                </div>
              </div>
            </Link>
          );
        })()}

        {/* ── Quick actions grid ─────────────────────────────── */}
        {/* 3-col icon grid on mobile, horizontal list on sm+ */}
        <div>
          <h3 className="font-medium text-ink text-sm mb-3">
            {locale === "en" ? "Quick actions" : "Actions rapides"}
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:hidden">
            {quickActions.map(({ href, label, icon, external }) => (
              <Link
                key={href}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-sand-200 shadow-sm px-2 py-4 text-center hover:border-terracotta/30 active:bg-sand transition-colors"
              >
                <span className="text-terracotta">{icon}</span>
                <span className="text-[11px] font-medium text-ink leading-tight">{label}</span>
              </Link>
            ))}
          </div>
          {/* Desktop: compact list */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-2">
            {quickActions.map(({ href, label, icon, external }) => (
              <Link
                key={href}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-medium text-ink hover:border-terracotta/30 hover:text-terracotta transition-colors"
              >
                <span className="text-terracotta shrink-0">{icon}</span>
                <span className="flex-1">{label}</span>
                <IconArrowRight size={13} className="text-muted" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Bookings ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-serif text-lg text-ink shrink-0">{t.myBookings}</h2>
          </div>
          {/* Tabs full-width on mobile */}
          <div className="mb-3">
            <Suspense fallback={null}>
              <DashboardTabs locale={locale} counts={tabCounts} />
            </Suspense>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-2xl bg-white border border-sand-200 p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/8">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta/60">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p className="font-serif text-lg text-ink mb-1">{t.noBookings}</p>
              <p className="text-sm text-muted mb-5">{t.noBookingsText}</p>
              <Link href={`/${locale}/sejour`} className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-semibold text-white">
                {t.bookStay} <IconArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const nights = nightCount(b.checkIn, b.checkOut);
                const roomNames = b.rooms.map(r => r.room.name).join(", ");
                const st = STATUS[b.status] ?? { label: b.status, cls: "bg-sand text-muted border border-sand-200", dot: "bg-muted/40", bar: "bg-muted/30" };
                const unread = b.messages.filter(m => m.sender === "admin" && !m.isRead).length;
                const isUpcoming = b.status === "confirmed" && new Date(b.checkIn) > now;

                return (
                  <Link
                    key={b.id}
                    href={`/${locale}/compte/reservations/${b.id}`}
                    className={`group block rounded-2xl bg-white border shadow-sm overflow-hidden active:scale-[0.99] transition-all hover:shadow-md ${
                      isUpcoming ? "border-terracotta/20" : "border-sand-200"
                    }`}
                  >
                    {/* Status colour bar at top */}
                    <div className={`h-1 w-full ${st.bar}`} />

                    <div className="p-4">
                      {/* Mobile: compact date row */}
                      <div className="flex items-center gap-2 mb-2 sm:hidden">
                        <div className="flex items-center gap-1.5 rounded-lg bg-sand border border-sand-200 px-2.5 py-1">
                          <span className="text-[10px] font-semibold text-muted">{monthLabel(b.checkIn, locale)}</span>
                          <span className="text-sm font-bold text-ink">{new Date(b.checkIn).getUTCDate()}</span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        <div className="flex items-center gap-1.5 rounded-lg bg-sand border border-sand-200 px-2.5 py-1">
                          <span className="text-[10px] font-semibold text-muted">{monthLabel(b.checkOut, locale)}</span>
                          <span className="text-sm font-bold text-ink">{new Date(b.checkOut).getUTCDate()}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${st.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        {/* Desktop date block */}
                        <div className="hidden sm:flex flex-col items-center min-w-[48px]">
                          <div className="rounded-xl bg-sand border border-sand-200 px-2.5 py-2 text-center w-full">
                            <p className="text-[9px] uppercase font-semibold text-muted tracking-wide">{monthLabel(b.checkIn, locale)}</p>
                            <p className="text-xl font-bold text-ink">{new Date(b.checkIn).getUTCDate()}</p>
                          </div>
                          <div className="w-px h-3 bg-sand-200" />
                          <div className="rounded-xl bg-sand border border-sand-200 px-2.5 py-2 text-center w-full">
                            <p className="text-[9px] uppercase font-semibold text-muted tracking-wide">{monthLabel(b.checkOut, locale)}</p>
                            <p className="text-xl font-bold text-ink">{new Date(b.checkOut).getUTCDate()}</p>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          {/* Badge row — hidden on mobile (shown above) */}
                          <div className="hidden sm:flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-mono text-[10px] font-semibold text-terracotta bg-terracotta/8 px-2 py-0.5 rounded-md">{b.reference}</span>
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${st.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                              {st.label}
                            </span>
                            {unread > 0 && (
                              <span className="inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white">{unread}</span>
                            )}
                          </div>

                          {/* Mobile: ref + unread */}
                          <div className="flex items-center gap-2 mb-1 sm:hidden">
                            <span className="font-mono text-[10px] font-semibold text-terracotta">{b.reference}</span>
                            {unread > 0 && (
                              <span className="inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-terracotta text-[9px] font-bold text-white">{unread}</span>
                            )}
                          </div>

                          <p className="font-medium text-ink text-[15px] truncate">{roomNames || (locale === "en" ? "Room" : "Chambre")}</p>
                          <p className="text-xs text-muted mt-0.5">
                            {nights} {nights !== 1 ? t.nights : t.night}
                            {" · "}{b.guests} {b.guests !== 1 ? t.travellers : t.traveller}
                          </p>
                          {b.extras.length > 0 && (
                            <p className="mt-1 text-[11px] text-muted truncate">
                              + {b.extras.map(e => e.nameSnapshot + (e.quantity > 1 ? ` ×${e.quantity}` : "")).join(", ")}
                            </p>
                          )}
                          {b.status === "pending" && (
                            <p className="mt-2 text-[11px] text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 inline-block">{t.pendingNote}</p>
                          )}
                        </div>

                        {/* Price + arrow */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <p className="font-serif text-base sm:text-lg font-bold text-ink">{formatEUR(b.estimatedTotal)}</p>
                          <p className="text-[10px] text-muted hidden sm:block">{t.estimatedTotal}</p>
                          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-terracotta group-hover:gap-2 transition-all">
                            {locale === "en" ? "View" : "Voir"} <IconArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Profile + Riad info ───────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Profile */}
          <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-ink text-sm">{t.myProfile}</h3>
              <Link href={`/${locale}/compte/mot-de-passe-oublie`} className="text-[11px] text-terracotta hover:underline">
                {locale === "en" ? "Change password" : "Changer le mot de passe"}
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { label: t.profileName, value: user.name },
                { label: t.profileEmail, value: user.email },
                ...(user.phone ? [{ label: t.profilePhone, value: user.phone }] : []),
                ...(user.country ? [{ label: t.profileCountry, value: user.country }] : []),
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-muted">{field.label}</p>
                  <p className="text-sm text-ink mt-0.5 break-all">{field.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Riad info */}
          <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
            <h3 className="font-medium text-ink text-sm mb-3">
              {locale === "en" ? "Riad information" : "Informations du riad"}
            </h3>
            <div className="space-y-3 text-xs text-muted">
              {[
                {
                  icon: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>,
                  circle: <circle cx="12" cy="10" r="3"/>,
                  text: "Médina, Musée Mouassine, Marrakech",
                },
                {
                  icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
                  text: locale === "en" ? "Check-in 2 PM · Check-out 12 PM" : "Arrivée 14h · Départ 12h",
                },
                {
                  icon: <><path d="M1 6l5 2 5-4 5 4 5-2"/><path d="M1 6v12l5 2 5-4 5 4 5-2V6"/></>,
                  text: locale === "en" ? "Free Wi-Fi · Parking nearby" : "Wi-Fi gratuit · Parking proche",
                },
                {
                  icon: <><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91A16 16 0 0016 17.91l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.92z"/></>,
                  text: locale === "en" ? "24 h WhatsApp assistance" : "Assistance WhatsApp 24h/24",
                },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-terracotta">
                    {icon}
                  </svg>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Mobile FAB ────────────────────────────────────── */}
      {/* Fixed "+" button above the bottom nav on mobile only */}
      <div className="fixed bottom-20 right-4 z-30 sm:hidden">
        <Link
          href={`/${locale}/sejour`}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta shadow-lg shadow-terracotta/30 text-white hover:bg-terracotta/90 active:scale-95 transition-all"
          aria-label={t.newBooking}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </Link>
      </div>

    </div>
  );
}
