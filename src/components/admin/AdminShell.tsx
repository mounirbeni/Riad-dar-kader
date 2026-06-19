"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { logoutAction } from "@/app/actions/admin";
import {
  IconLayoutDashboard,
  IconInbox,
  IconCalendar,
  IconBed,
  IconGift,
  IconSettings,
  IconUsers,
  IconMail,
  IconBarChart,
  IconBrush,
  IconCreditCard,
  IconEdit,
  IconMessageCircle,
  IconGrid,
  IconClipboardList,
} from "@/components/Icons";

type NavItem = { href: string; label: string; icon: ReactNode; badge?: number; exact?: boolean };
type NavGroup = { group: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Vue d'ensemble",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: <IconLayoutDashboard size={16} />, exact: true },
    ],
  },
  {
    group: "Séjours",
    items: [
      { href: "/admin/bookings", label: "Réservations", icon: <IconInbox size={16} /> },
      { href: "/admin/calendar", label: "Calendrier", icon: <IconCalendar size={16} /> },
      { href: "/admin/planning", label: "Planning", icon: <IconClipboardList size={16} /> },
      { href: "/admin/availability", label: "Disponibilité", icon: <IconGrid size={16} /> },
    ],
  },
  {
    group: "Propriété",
    items: [
      { href: "/admin/rooms", label: "Chambres", icon: <IconBed size={16} /> },
      { href: "/admin/extras", label: "Extras & Services", icon: <IconGift size={16} /> },
      { href: "/admin/housekeeping", label: "Ménage", icon: <IconBrush size={16} /> },
    ],
  },
  {
    group: "Clients",
    items: [
      { href: "/admin/guests", label: "Clients", icon: <IconUsers size={16} /> },
      { href: "/admin/messages", label: "Messages", icon: <IconMessageCircle size={16} /> },
      { href: "/admin/payments", label: "Paiements", icon: <IconCreditCard size={16} /> },
    ],
  },
  {
    group: "Administration",
    items: [
      { href: "/admin/reports", label: "Rapports", icon: <IconBarChart size={16} /> },
      { href: "/admin/content", label: "Contenu", icon: <IconEdit size={16} /> },
      { href: "/admin/settings", label: "Paramètres", icon: <IconSettings size={16} /> },
    ],
  },
];

function Initials({ email }: { email: string }) {
  const ch = email.split("@")[0].slice(0, 2).toUpperCase();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">
      {ch}
    </span>
  );
}

function SidebarContent({
  email,
  pendingCount,
  unreadMessages,
  onNav,
}: {
  email: string;
  pendingCount?: number;
  unreadMessages?: number;
  onNav?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5 shrink-0">
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="shrink-0">
          <polygon points="14,2 16.4,10.2 24.5,7.6 19.2,14 24.5,20.4 16.4,17.8 14,26 11.6,17.8 3.5,20.4 8.8,14 3.5,7.6 11.6,10.2" fill="#B8943F" fillOpacity="0.9" />
        </svg>
        <div>
          <p className="font-serif text-base leading-tight text-white">Mbn Riad</p>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Administration</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV_GROUPS.map(({ group, items }) => (
          <div key={group}>
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                const badge =
                  item.href === "/admin/bookings" && pendingCount && pendingCount > 0
                    ? pendingCount
                    : item.href === "/admin/messages" && unreadMessages && unreadMessages > 0
                    ? unreadMessages
                    : undefined;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNav}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                      active
                        ? "bg-terracotta/20 text-white font-medium"
                        : "text-white/55 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-nav-active"
                        className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-terracotta"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className={`flex w-4 shrink-0 items-center justify-center transition-colors ${active ? "text-terracotta" : "text-white/35 group-hover:text-white/60"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {badge != null && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-terracotta px-1.5 text-[10px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-4 shrink-0">
        <div className="flex items-center gap-3">
          <Initials email={email} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/80">{email}</p>
            <form action={logoutAction} className="mt-0.5">
              <button type="submit" className="text-[11px] text-white/40 transition hover:text-terracotta">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({
  children,
  email,
  pendingCount,
  unreadMessages,
}: {
  children: ReactNode;
  email: string;
  pendingCount?: number;
  unreadMessages?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F4EF] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 bg-[#1C1612] lg:flex lg:flex-col overflow-hidden">
        <SidebarContent email={email} pendingCount={pendingCount} unreadMessages={unreadMessages} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#1C1612] flex flex-col transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent email={email} pendingCount={pendingCount} unreadMessages={unreadMessages} onNav={() => setOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sand-200 bg-white/80 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 16.4,10.2 24.5,7.6 19.2,14 24.5,20.4 16.4,17.8 14,26 11.6,17.8 3.5,20.4 8.8,14 3.5,7.6 11.6,10.2" fill="#B8943F" fillOpacity="0.9" />
            </svg>
            <span className="font-serif text-base text-ink">Mbn Riad</span>
          </div>
          <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="flex h-9 w-9 items-center justify-center rounded-xl border border-sand-200 bg-white text-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </header>

        <main className="flex-1 p-5 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
