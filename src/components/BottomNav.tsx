"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/nav";
import { IconBed, IconHeart, IconHome, IconMapPin, IconMenu } from "@/components/Icons";

type BottomNavItem = {
  key: string;
  href: (locale: Locale) => string;
  labelFr: string;
  labelEn: string;
  icon: (active: boolean) => ReactNode;
};

const ITEMS: BottomNavItem[] = [
  {
    key: "home",
    href: (locale) => localePath(locale, "home"),
    labelFr: "Accueil",
    labelEn: "Home",
    icon: () => <IconHome size={23} />,
  },
  {
    key: "rooms",
    href: (locale) => localePath(locale, "rooms"),
    labelFr: "Chambres",
    labelEn: "Rooms",
    icon: () => <IconBed size={22} />,
  },
  {
    key: "experiences",
    href: (locale) => localePath(locale, "experiences"),
    labelFr: "Expériences",
    labelEn: "Experiences",
    icon: () => <IconHeart size={23} />,
  },
  {
    key: "contact",
    href: (locale) => localePath(locale, "contact"),
    labelFr: "Nous trouver",
    labelEn: "Find us",
    icon: () => <IconMapPin size={23} />,
  },
];

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const fr = locale === "fr";
  const menuItems = [
    { href: localePath(locale, "home"), label: fr ? "Accueil" : "Home" },
    { href: localePath(locale, "riad"), label: fr ? "Le Riad" : "The Riad" },
    { href: localePath(locale, "rooms"), label: fr ? "Chambres" : "Rooms" },
    { href: localePath(locale, "experiences"), label: fr ? "Expériences" : "Experiences" },
    { href: localePath(locale, "gallery"), label: fr ? "Galerie" : "Gallery" },
    { href: localePath(locale, "contact"), label: fr ? "Nous trouver" : "Find us" },
  ];

  return (
    <>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.section
              aria-label={fr ? "Menu de navigation" : "Navigation menu"}
              initial={{ opacity: 0, y: 34, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 34, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="fixed inset-x-4 bottom-[calc(5.55rem+env(safe-area-inset-bottom))] z-[60] overflow-hidden rounded-[2rem] border border-white/25 bg-[#352017]/80 p-3 shadow-[0_22px_70px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,244,223,0.22)] backdrop-blur-[30px] saturate-150 lg:hidden"
            >
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,233,205,0.16),transparent_40%,rgba(136,59,38,0.22))]" />
              <div className="relative grid gap-1.5">
                <p className="px-3 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[#efd07f]">RIAD DAR KADER</p>
                {menuItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 font-serif text-xl text-white/95 transition active:scale-[0.99] active:bg-white/15">
                    {item.label}
                  </Link>
                ))}
                <Link href={`/${locale}/compte`} onClick={() => setMenuOpen(false)} className="rounded-2xl border border-white/15 bg-white/[0.1] px-4 py-3 font-serif text-lg text-[#f3dfc1] transition active:bg-white/15">
                  {fr ? "Mon profil" : "My profile"}
                </Link>
                <Link href={localePath(locale, "stay")} onClick={() => setMenuOpen(false)} className="mt-1 flex min-h-[52px] items-center justify-center rounded-2xl border border-[#ffd0b8]/30 bg-[#c76346]/85 px-4 text-base font-medium text-white shadow-[inset_0_1px_0_rgba(255,241,223,0.3)]">
                  {fr ? "Réserver maintenant" : "Book now"}
                </Link>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden border-t border-white/20 bg-[#2a1714]/75 text-[#f6eee1] shadow-[0_-12px_32px_rgba(0,0,0,0.3)] backdrop-blur-[28px] saturate-150 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/35" />
        <div className="relative grid grid-cols-5">
          {ITEMS.map(({ key, href: hrefFn, labelFr, labelEn, icon }) => {
            const href = hrefFn(locale);
            const active = pathname === href || (key !== "home" && pathname.startsWith(href + "/"));
            return (
              <Link key={key} href={href} className={`relative flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors duration-150 ${active ? "text-[#c86a4d]" : "text-[#eee1cd]/75"}`}>
                {active && <motion.div layoutId="bottom-nav-indicator" className="absolute bottom-1 h-1 w-1 rounded-full bg-[#c86a4d]" transition={{ type: "spring", stiffness: 520, damping: 35 }} />}
                <motion.div animate={{ scale: active ? 1.12 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>{icon(active)}</motion.div>
                <span className="font-serif text-xs leading-tight">{fr ? labelFr : labelEn}</span>
              </Link>
            );
          })}
          <button type="button" aria-label={fr ? "Ouvrir le menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className={`relative flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors duration-150 ${menuOpen ? "text-[#c86a4d]" : "text-[#eee1cd]/75"}`}>
            {menuOpen && <motion.div layoutId="bottom-nav-indicator" className="absolute bottom-1 h-1 w-1 rounded-full bg-[#c86a4d]" transition={{ type: "spring", stiffness: 520, damping: 35 }} />}
            <motion.div animate={{ rotate: menuOpen ? 90 : 0, scale: menuOpen ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}><IconMenu size={24} /></motion.div>
            <span className="font-serif text-xs leading-tight">{fr ? "Menu" : "Menu"}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
