"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { localePath, type NavKey } from "@/i18n/nav";
import type { Dictionary } from "@/i18n/dictionaries";
import type { GuestSessionPayload } from "@/lib/guest-auth";
import { logoutAction } from "@/app/actions/guest-auth";

const NAV_ORDER: NavKey[] = [
  "home",
  "riad",
  "rooms",
  "stay",
  "experiences",
  "gallery",
  "contact",
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Header({
  locale,
  dict,
  user,
}: {
  locale: Locale;
  dict: Dictionary;
  user: GuestSessionPayload | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const otherLocale: Locale = locale === "fr" ? "en" : "fr";
  const switchPath = swapLocale(pathname, locale, otherLocale);

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200/70 bg-sand/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href={localePath(locale, "home")}
          className="font-serif text-xl font-700 tracking-wide text-terracotta"
          onClick={() => setOpen(false)}
        >
          Riad Dar Kader
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ORDER.map((key) => {
            const href = localePath(locale, key);
            const active = isActive(pathname, href);
            return (
              <Link
                key={key}
                href={href}
                className={`relative text-sm transition-colors ${
                  active
                    ? "text-terracotta font-medium"
                    : "text-ink/70 hover:text-terracotta"
                }`}
              >
                {dict.nav[key]}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-[3px] left-0 right-0 h-px bg-terracotta"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={switchPath}
            className="rounded-full border border-sand-300 px-3 py-1 text-xs font-medium uppercase text-muted transition hover:border-brass hover:text-brass"
          >
            {otherLocale}
          </Link>

          {/* Auth buttons — desktop */}
          {user ? (
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-sm text-ink/70">
                {user.name || user.email.split("@")[0]}
              </span>
              <form action={logoutAction}>
                <input type="hidden" name="returnTo" value={`/${locale}`} />
                <button
                  type="submit"
                  className="rounded-full border border-sand-300 px-3 py-1 text-xs font-medium text-muted transition hover:border-terracotta hover:text-terracotta"
                >
                  {dict.auth.logout}
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href={`/${locale}/connexion`}
                className="rounded-full border border-sand-300 px-3 py-1 text-xs font-medium text-muted transition hover:border-terracotta hover:text-terracotta"
              >
                {dict.auth.login}
              </Link>
              <Link
                href={`/${locale}/inscription`}
                className="rounded-full border border-terracotta/50 bg-terracotta/5 px-3 py-1 text-xs font-medium text-terracotta transition hover:bg-terracotta/10"
              >
                {dict.auth.register}
              </Link>
            </div>
          )}

          <Link
            href={`/${locale}/compte`}
            className="hidden items-center justify-center h-9 w-9 rounded-full border border-sand-200 bg-white text-muted hover:text-terracotta hover:border-terracotta/30 transition-colors sm:flex"
            title="Mon espace voyageur"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <Link
            href={localePath(locale, "stay")}
            className="hidden btn-primary !px-5 !py-2.5 text-sm sm:inline-flex"
          >
            {dict.nav.book}
          </Link>
          <motion.button
            type="button"
            aria-label="Menu"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            whileTap={{ scale: 0.88 }}
            transition={{ duration: 0.12 }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-terracotta"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.path
                    key="close"
                    d="M18 6L6 18M6 6l12 12"
                    strokeLinecap="round"
                    initial={{ opacity: 0, rotate: -45, originX: "50%", originY: "50%" }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.18 }}
                  />
                ) : (
                  <motion.path
                    key="open"
                    d="M3 6h18M3 12h18M3 18h18"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  />
                )}
              </AnimatePresence>
            </svg>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden border-t border-sand-200 bg-sand lg:hidden"
          >
            <div className="container-page flex flex-col py-3">
              {NAV_ORDER.map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.045, duration: 0.22, ease: EASE }}
                >
                  <Link
                    href={localePath(locale, key)}
                    onClick={() => setOpen(false)}
                    className="block py-2.5 text-sm text-ink/80 hover:text-terracotta"
                  >
                    {dict.nav[key]}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + NAV_ORDER.length * 0.045, duration: 0.22, ease: EASE }}
                className="mt-3 border-t border-sand-200 pt-4 space-y-2"
              >
                <Link
                  href={localePath(locale, "stay")}
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  {locale === "fr" ? "Réserver maintenant" : "Book now"}
                </Link>
                {user ? (
                  <Link
                    href={`/${locale}/compte`}
                    onClick={() => setOpen(false)}
                    className="flex items-center rounded-xl border border-sand-200 bg-white px-3 py-2.5 text-sm font-medium text-ink hover:border-terracotta/30 hover:text-terracotta transition-colors"
                  >
                    {user.name || user.email.split("@")[0]}
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/${locale}/compte/inscription`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-sand-200 bg-white py-2.5 text-sm font-medium text-ink hover:border-terracotta/30 hover:text-terracotta transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                      {dict.auth.register}
                    </Link>
                    <Link
                      href={`/${locale}/compte/connexion`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-sand-200 bg-white py-2.5 text-sm font-medium text-ink hover:border-terracotta/30 hover:text-terracotta transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                      {dict.auth.login}
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href.split("/").length === 2) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function swapLocale(pathname: string, from: Locale, to: Locale): string {
  if (pathname === `/${from}`) return `/${to}`;
  if (pathname.startsWith(`/${from}/`)) {
    return `/${to}/` + pathname.slice(from.length + 2);
  }
  return `/${to}`;
}
