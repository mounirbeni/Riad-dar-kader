"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
                className={`text-sm transition-colors ${
                  active
                    ? "text-terracotta font-medium"
                    : "text-ink/70 hover:text-terracotta"
                }`}
              >
                {dict.nav[key]}
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
            href={localePath(locale, "stay")}
            className="hidden btn-primary !px-5 !py-2.5 text-sm sm:inline-flex"
          >
            {dict.nav.book}
          </Link>
          <button
            type="button"
            aria-label="Menu"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-terracotta">
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-sand-200 bg-sand lg:hidden">
          <div className="container-page flex flex-col py-3">
            {NAV_ORDER.map((key) => (
              <Link
                key={key}
                href={localePath(locale, key)}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-ink/80 hover:text-terracotta"
              >
                {dict.nav[key]}
              </Link>
            ))}

            {/* Auth links — mobile menu */}
            <div className="mt-2 border-t border-sand-200 pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <form action={logoutAction}>
                    <input type="hidden" name="returnTo" value={`/${locale}`} />
                    <button
                      type="submit"
                      onClick={() => setOpen(false)}
                      className="text-sm text-muted hover:text-terracotta"
                    >
                      {dict.auth.logout}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href={`/${locale}/connexion`}
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl border border-sand-300 py-2.5 text-center text-sm font-medium text-ink/80 hover:text-terracotta"
                  >
                    {dict.auth.login}
                  </Link>
                  <Link
                    href={`/${locale}/inscription`}
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl border border-terracotta/40 bg-terracotta/5 py-2.5 text-center text-sm font-medium text-terracotta"
                  >
                    {dict.auth.register}
                  </Link>
                </div>
              )}
            </div>

            <Link
              href={localePath(locale, "stay")}
              onClick={() => setOpen(false)}
              className="btn-primary mt-3 w-full"
            >
              {dict.nav.book}
            </Link>
          </div>
        </nav>
      )}
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
