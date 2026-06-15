"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { localePath, type NavKey } from "@/i18n/nav";
import type { Dictionary } from "@/i18n/dictionaries";

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
}: {
  locale: Locale;
  dict: Dictionary;
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
                transition={{
                  delay: 0.04 + NAV_ORDER.length * 0.045,
                  duration: 0.22,
                  ease: EASE,
                }}
              >
                <Link
                  href={localePath(locale, "stay")}
                  onClick={() => setOpen(false)}
                  className="btn-primary mt-3 w-full"
                >
                  {dict.nav.book}
                </Link>
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
