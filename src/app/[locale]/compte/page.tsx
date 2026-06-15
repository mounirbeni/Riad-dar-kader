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
function fmtFull(d: Date, locale: string) {
  return new Date(d).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}
function nightCount(a: Date, b: Date) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function daysUntil(d: Date) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
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

  const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
    pending:   { label: t.statusPending,   cls: "bg-amber-50 text-amber-700 border border-amber-200",      dot: "bg-amber-400" },
    confirmed: { label: t.statusConfirmed, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
    cancelled: { label: t.statusCancelled, cls: "bg-red-50 text-red-600 border border-red-200",            dot: "bg-red-400" },
    completed: { label: t.statusCompleted, cls: "bg-sand text-muted border border-sand-200",               dot: "bg-muted/40" },
  };

  const [user, allBookings] = await Promise.all([
    prisma.guestUser.findUnique({ where: { id: session.sub } }),
    prisma.booking.findMany({
      where: { OR: [{ guestEmail: session.email }, { guestUserId: session.sub }] },
      include: {
        rooms: { include: { room: { select: { name: true } } } },
        extras: { select: { nameSnapshot: true, quantity: true } },
        messages: { select: { id: true, isRead: true, sender: true, content: true, createdAt: true }, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect(`/${locale}/compte/connexion`);

  const now = new Date();

  // Tab filtering
  const bookings = allBookings.filter((b) => {
    if (tab === "upcoming") return (b.status === "confirmed" || b.status === "pending") && new Date(b.checkOut) >= now;
    if (tab === "past") return b.status === "completed" || (b.status === "confirmed" && new Date(b.checkOut) < now);
    if (tab === "cancelled") return b.status === "cancelled";
    return true;
  });

  // Stats
  const confirmedCount = allBookings.filter(b => b.status === "confirmed" || b.status === "completed").length;
  const totalNights = allBookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((acc, b) => acc + nightCount(b.checkIn, b.checkOut), 0);
  const totalSpent = allBookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((acc, b) => acc + b.estimatedTotal, 0);

  // Unread messages across all bookings
  const unreadMessages = allBookings.flatMap(b =>
    b.messages
      .filter(m => m.sender === "admin" && !m.isRead)
      .map(m => ({ ...m, bookingId: b.id, reference: b.reference }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Next upcoming confirmed stay
  const nextStay = allBookings
    .filter(b => b.status === "confirmed" && new Date(b.checkIn) > now)
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())[0];

  // Tab counts
  const tabCounts = {
    all: allBookings.length,
    upcoming: allBookings.filter(b => (b.status === "confirmed" || b.status === "pending") && new Date(b.checkOut) >= now).length,
    past: allBookings.filter(b => b.status === "completed" || (b.status === "confirmed" && new Date(b.checkOut) < now)).length,
    cancelled: allBookings.filter(b => b.status === "cancelled").length,
  };

  const initials = user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const logoutWithLocale = guestLogoutAction.bind(null, locale);
  const waUrl = guestWhatsAppLink(locale as "fr" | "en");

  return (
    <div className="min-h-screen bg-sand">
      {/* Hero */}
      <div className="bg-gradient-to-br from-terracotta via-terracotta/90 to-brass/80 px-4 pt-10 pb-20">
        <div className="max-w-3xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm font-serif text-xl font-bold text-white ring-2 ring-white/30">
              {initials}
            </div>
            <div>
              <p className="text-white/70 text-sm">{t.hello},</p>
              <h1 className="font-serif text-2xl text-white leading-tight">{user.name.split(" ")[0]}</h1>
              <p className="mt-0.5 text-xs text-white/60">{user.email}</p>
            </div>
          </div>
          <form action={logoutWithLocale}>
            <button type="submit" className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
              {t.signOut}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 pb-16 space-y-5">

        {/* Stats — 4 boxes */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: allBookings.length, label: allBookings.length !== 1 ? t.bookingCountPlural : t.bookingCount, color: "text-ink" },
            { value: confirmedCount, label: confirmedCount !== 1 ? t.confirmedCountPlural : t.confirmedCount, color: "text-emerald-600" },
            { value: totalNights, label: totalNights !== 1 ? t.nights : t.night, color: "text-terracotta" },
            { value: formatEUR(totalSpent), label: locale === "en" ? "Total spent" : "Total dépensé", color: "text-brass" },
          ].map(({ value, label, color }) => (
            <div key={label} className="rounded-2xl bg-white border border-sand-200 shadow-sm p-4 text-center">
              <p className={`text-xl font-bold ${color} truncate`}>{value}</p>
              <p className="text-[10px] text-muted mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Unread messages alert */}
        {unreadMessages.length > 0 && (
          <div className="rounded-2xl border border-terracotta/20 bg-terracotta/5 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-terracotta animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                {unreadMessages.length} {locale === "en" ? "unread message" : "message non lu"}{unreadMessages.length > 1 ? "s" : ""}
              </p>
            </div>
            {unreadMessages.slice(0, 3).map((m) => (
              <Link
                key={m.id}
                href={`/${locale}/compte/reservations/${m.bookingId}`}
                className="flex items-start gap-3 rounded-xl bg-white border border-sand-200 px-4 py-3 hover:border-terracotta/30 transition-colors"
              >
                <div className="mt-0.5 h-7 w-7 shrink-0 flex items-center justify-center rounded-full bg-terracotta/10">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-terracotta uppercase tracking-wide">{m.reference}</p>
                  <p className="text-sm text-ink truncate">{m.content}</p>
                </div>
                <IconArrowRight size={14} className="text-muted shrink-0 mt-1" />
              </Link>
            ))}
            {unreadMessages.length > 3 && (
              <p className="text-xs text-center text-muted">
                +{unreadMessages.length - 3} {locale === "en" ? "more" : "de plus"}
              </p>
            )}
          </div>
        )}

        {/* Next stay highlight */}
        {nextStay && (() => {
          const days = daysUntil(nextStay.checkIn);
          const nights = nightCount(nextStay.checkIn, nextStay.checkOut);
          const roomNames = nextStay.rooms.map(r => r.room.name).join(", ");
          return (
            <Link
              href={`/${locale}/compte/reservations/${nextStay.id}`}
              className="block rounded-2xl bg-gradient-to-br from-terracotta/5 via-white to-brass/5 border border-terracotta/20 shadow-sm p-5 hover:border-terracotta/40 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-terracotta animate-pulse" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-terracotta">
                  {locale === "en" ? "Next stay" : "Prochain séjour"}
                </p>
              </div>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-serif text-lg text-ink">{roomNames}</p>
                  <p className="text-sm text-muted mt-1">
                    {fmtShort(nextStay.checkIn, locale)} → {fmtShort(nextStay.checkOut, locale)} · {nights} {nights !== 1 ? t.nights : t.night}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {locale === "en" ? "Check-in from 2 PM · Check-out by 12 PM" : "Arrivée à partir de 14h · Départ avant 12h"}
                  </p>
                </div>
                <div className="rounded-xl bg-terracotta/10 px-4 py-3 text-center">
                  <p className="text-3xl font-bold text-terracotta leading-none">{days}</p>
                  <p className="text-[10px] text-terracotta/80 mt-1">
                    {locale === "en" ? (days === 1 ? "day left" : "days left") : (days <= 1 ? "jour" : "jours")}
                  </p>
                </div>
              </div>
            </Link>
          );
        })()}

        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h2 className="font-serif text-lg text-ink">{t.myBookings}</h2>
            <Suspense fallback={null}>
              <DashboardTabs locale={locale} counts={tabCounts} />
            </Suspense>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-2xl bg-white border border-sand-200 p-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/8">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta/60">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="font-serif text-lg text-ink mb-1">{t.noBookings}</p>
              <p className="text-sm text-muted mb-5">{t.noBookingsText}</p>
              <Link href={`/${locale}/sejour`} className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors">
                {t.bookStay} <IconArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const nights = nightCount(b.checkIn, b.checkOut);
                const roomNames = b.rooms.map(r => r.room.name).join(", ");
                const st = STATUS[b.status] ?? { label: b.status, cls: "bg-sand text-muted border border-sand-200", dot: "bg-muted/40" };
                const unread = b.messages.filter(m => m.sender === "admin" && !m.isRead).length;
                const isUpcoming = b.status === "confirmed" && new Date(b.checkIn) > now;

                return (
                  <Link
                    key={b.id}
                    href={`/${locale}/compte/reservations/${b.id}`}
                    className={`group block rounded-2xl bg-white border shadow-sm p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                      isUpcoming ? "border-terracotta/20 hover:border-terracotta/40" : "border-sand-200 hover:border-sand-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Date block */}
                      <div className="hidden sm:flex flex-col items-center min-w-[48px]">
                        <div className="rounded-xl bg-sand border border-sand-200 px-2.5 py-2 text-center leading-tight w-full">
                          <p className="text-[9px] uppercase font-semibold text-muted tracking-wide">
                            {new Date(b.checkIn).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", { month: "short", timeZone: "UTC" })}
                          </p>
                          <p className="text-xl font-bold text-ink">{new Date(b.checkIn).getUTCDate()}</p>
                        </div>
                        <div className="w-px h-3 bg-sand-200" />
                        <div className="rounded-xl bg-sand border border-sand-200 px-2.5 py-2 text-center leading-tight w-full">
                          <p className="text-[9px] uppercase font-semibold text-muted tracking-wide">
                            {new Date(b.checkOut).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", { month: "short", timeZone: "UTC" })}
                          </p>
                          <p className="text-xl font-bold text-ink">{new Date(b.checkOut).getUTCDate()}</p>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-mono text-[10px] font-semibold text-terracotta bg-terracotta/8 px-2 py-0.5 rounded-md">{b.reference}</span>
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${st.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                          {unread > 0 && (
                            <span className="inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white">{unread}</span>
                          )}
                        </div>
                        <p className="font-medium text-ink text-[15px]">{roomNames || (locale === "en" ? "Room" : "Chambre")}</p>
                        <p className="text-xs text-muted mt-0.5 sm:hidden">{fmtShort(b.checkIn, locale)} → {fmtShort(b.checkOut, locale)}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {nights} {nights !== 1 ? t.nights : t.night} · {b.guests} {b.guests !== 1 ? t.travellers : t.traveller}
                        </p>
                        {b.extras.length > 0 && (
                          <p className="mt-1.5 text-[11px] text-muted truncate">
                            + {b.extras.map(e => e.nameSnapshot + (e.quantity > 1 ? ` ×${e.quantity}` : "")).join(", ")}
                          </p>
                        )}
                        {b.status === "pending" && (
                          <p className="mt-2 text-[11px] text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 inline-block">{t.pendingNote}</p>
                        )}
                      </div>

                      {/* Price + arrow */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="font-serif text-lg font-bold text-ink">{formatEUR(b.estimatedTotal)}</p>
                        <p className="text-[10px] text-muted">{t.estimatedTotal}</p>
                        <span className="mt-2 flex items-center gap-1 text-xs font-medium text-terracotta group-hover:gap-2 transition-all">
                          {locale === "en" ? "Details" : "Détails"} <IconArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom grid: Profile + Riad info + Quick actions */}
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

          <div className="space-y-4">
            {/* Riad info */}
            <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
              <h3 className="font-medium text-ink text-sm mb-3">
                {locale === "en" ? "Riad information" : "Informations du riad"}
              </h3>
              <div className="space-y-2 text-xs text-muted">
                <div className="flex items-start gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-terracotta"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Médina, près du Musée Mouassine, Marrakech</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-terracotta"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{locale === "en" ? "Check-in from 2 PM · Check-out by 12 PM" : "Arrivée à partir de 14h · Départ avant 12h"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-terracotta"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>{locale === "en" ? "Free Wi-Fi · Private parking nearby" : "Wi-Fi gratuit · Parking proche"}</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
              <h3 className="font-medium text-ink text-sm mb-3">
                {locale === "en" ? "Quick actions" : "Actions rapides"}
              </h3>
              <div className="space-y-2">
                {[
                  { href: `/${locale}/sejour`, label: t.newBooking },
                  { href: `/${locale}/chambres`, label: locale === "en" ? "Browse rooms" : "Voir les chambres" },
                  { href: `/${locale}/experiences`, label: locale === "en" ? "Experiences & extras" : "Expériences & extras" },
                  { href: waUrl, label: locale === "en" ? "WhatsApp the riad" : "Contacter sur WhatsApp", external: true },
                  { href: `/${locale}/contact`, label: locale === "en" ? "Contact us" : "Nous contacter" },
                ].map(({ href, label, external }) => (
                  <Link
                    key={href}
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center justify-between rounded-xl border border-sand-200 px-4 py-2.5 text-sm font-medium text-ink hover:border-terracotta/30 hover:text-terracotta transition-colors"
                  >
                    <span>{label}</span>
                    <IconArrowRight size={13} className="text-muted" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
