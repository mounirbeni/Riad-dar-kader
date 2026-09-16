"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/nav";
import { IconBed, IconHeart, IconHome, IconMapPin, IconUser } from "@/components/Icons";

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
  {
    key: "profile",
    href: (locale) => `/${locale}/compte`,
    labelFr: "Profil",
    labelEn: "Profile",
    icon: () => <IconUser size={23} />,
  },
];

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md lg:hidden ${
        "border-white/15 bg-[#18130f]/95 text-[#eee1cd]"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
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
                active ? "text-[#c86a4d]" : "text-[#eee1cd]/75"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-[#c86a4d]"
                  transition={{ type: "spring", stiffness: 520, damping: 35 }}
                />
              )}
              <motion.div
                animate={{ scale: active ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {icon(active)}
              </motion.div>
              <span className="font-serif text-xs leading-tight">{locale === "fr" ? labelFr : labelEn}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
