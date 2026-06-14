"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath, type NavKey } from "@/i18n/nav";

type BottomNavItem = {
  key: NavKey;
  labelFr: string;
  labelEn: string;
  icon: (active: boolean) => ReactNode;
};

const ITEMS: BottomNavItem[] = [
  {
    key: "home",
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
    key: "stay",
    labelFr: "Réserver",
    labelEn: "Book",
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
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: "experiences",
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
];

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-sand-200/80 bg-sand/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {ITEMS.map(({ key, labelFr, labelEn, icon }) => {
          const href = localePath(locale, key);
          const active =
            pathname === href ||
            (key !== "home" && pathname.startsWith(href + "/")) ||
            (key !== "home" && pathname === href);
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors duration-150 ${
                active ? "text-terracotta" : "text-muted"
              }`}
            >
              {icon(active)}
              <span className="leading-tight">{locale === "fr" ? labelFr : labelEn}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
