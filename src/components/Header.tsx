"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath, type NavKey } from "@/i18n/nav";
import type { Dictionary } from "@/i18n/dictionaries";
import { IconMenu } from "@/components/Icons";

const NAV_ORDER: NavKey[] = ["home", "riad", "rooms", "experiences", "gallery", "contact"];

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  // Next can preserve a trailing slash on mobile navigation. Treat it as home too,
  // otherwise the header becomes a regular opaque bar and pushes the hero down.
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const isHome = normalizedPath === `/${locale}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const otherLocale: Locale = locale === "fr" ? "en" : "fr";
  const switchPath = swapLocale(pathname, locale, otherLocale);

  return (
    <header className={`site-header sticky top-0 z-50 border-b border-sand-200/70 bg-sand/85 backdrop-blur-md ${isHome ? "home-mobile-header absolute inset-x-0 top-0 border-transparent bg-transparent text-white backdrop-blur-none xl:sticky xl:border-sand-200/70 xl:bg-sand/85 xl:text-inherit xl:backdrop-blur-md" : ""}`}>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={localePath(locale, "home")} className={`font-serif text-xl font-700 tracking-wide text-terracotta ${isHome ? "text-white xl:text-terracotta" : ""}`}>
          <span className="hidden sm:inline">MBN DEMO RIAD</span>
          <span className="block text-[2rem] leading-[0.72] sm:hidden">MBN</span>
          <span className="mt-2 block text-[9px] font-sans font-medium tracking-[0.32em] sm:hidden">DEMO RIAD</span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ORDER.map((key) => {
            const href = localePath(locale, key);
            const active = isActive(pathname, href);
            return <Link key={key} href={href} className={`relative text-sm transition-colors ${active ? "font-medium text-terracotta" : "text-ink/70 hover:text-terracotta"}`}>{dict.nav[key]}{active && <motion.span layoutId="nav-underline" className="absolute -bottom-[3px] left-0 right-0 h-px bg-terracotta" transition={{ type: "spring", stiffness: 500, damping: 30 }} />}</Link>;
          })}
        </nav>
        {isHome && <button type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="flex h-11 w-11 items-center justify-center text-white xl:hidden"><IconMenu size={30} /></button>}
        <div className={`items-center gap-3 ${isHome ? "hidden xl:flex" : "flex"}`}>
          <Link href={switchPath} className="rounded-full border border-sand-300 px-3 py-1 text-xs font-medium uppercase text-muted transition hover:border-brass hover:text-brass">{otherLocale}</Link>
          <Link href={`/${locale}/compte`} className="hidden h-9 w-9 items-center justify-center rounded-full border border-sand-200 bg-white text-muted transition-colors hover:border-terracotta/30 hover:text-terracotta sm:flex" title="Mon espace voyageur"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></Link>
          <Link href={localePath(locale, "stay")} className="inline-flex btn-primary !px-4 !py-2 text-sm sm:!px-5 sm:!py-2.5">{dict.nav.book}</Link>
        </div>
      </div>
      <AnimatePresence>
        {isHome && menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }} className="absolute inset-x-4 top-[4.4rem] rounded-2xl border border-white/15 bg-[#18130f]/95 p-3 shadow-2xl backdrop-blur-xl xl:hidden">
            {NAV_ORDER.map((key) => <Link key={key} href={localePath(locale, key)} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-2.5 font-serif text-lg text-white/90 active:bg-white/10">{dict.nav[key]}</Link>)}
            <Link href={localePath(locale, "stay")} onClick={() => setMenuOpen(false)} className="mt-2 flex min-h-11 items-center justify-center rounded-xl bg-[#bd5a40] px-4 text-sm font-medium text-white">{dict.nav.book}</Link>
          </motion.div>
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
  if (pathname.startsWith(`/${from}/`)) return `/${to}/` + pathname.slice(from.length + 2);
  return `/${to}`;
}
