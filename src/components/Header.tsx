"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { localePath, type NavKey } from "@/i18n/nav";
import type { Dictionary } from "@/i18n/dictionaries";
import type { GuestSessionPayload } from "@/lib/guest-auth";
import { logoutAction } from "@/app/actions/guest-auth";

const NAV_ORDER: NavKey[] = [
  "home",
  "riad",
  "rooms",
  "experiences",
  "gallery",
  "contact",
];

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

  const otherLocale: Locale = locale === "fr" ? "en" : "fr";
  const switchPath = swapLocale(pathname, locale, otherLocale);

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200/70 bg-sand/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href={localePath(locale, "home")}
          className="font-serif text-xl font-700 tracking-wide text-terracotta"
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
            className="inline-flex btn-primary !px-4 !py-2 text-sm sm:!px-5 sm:!py-2.5"
          >
            {dict.nav.book}
          </Link>
        </div>
      </div>
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
