"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/nav";

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
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "experiences",
    href: (locale) => localePath(locale, "experiences"),
    labelFr: "Expériences",
    labelEn: "Experiences",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    key: "contact",
    href: (locale) => localePath(locale, "contact"),
    labelFr: "Contact",
    labelEn: "Contact",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    key: "profile",
    href: (locale) => `/${locale}/compte`,
    labelFr: "Profil",
    labelEn: "Profile",
    icon: (active) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-sand-200/80 bg-sand/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {ITEMS.map(({ key, href: hrefFn, labelFr, labelEn, icon }) => {
          const href = hrefFn(locale);
          const active =
            pathname === href ||
            (key !== "home" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={key}
              href={href}
              className={`relative flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors duration-150 ${
                active ? "text-terracotta" : "text-muted"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-terracotta"
                  transition={{ type: "spring", stiffness: 520, damping: 35 }}
                />
              )}
              <motion.div
                animate={{ scale: active ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {icon(active)}
              </motion.div>
              <span className="leading-tight">{locale === "fr" ? labelFr : labelEn}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
