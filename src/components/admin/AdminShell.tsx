"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/admin";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: "▦", exact: true },
  { href: "/admin/bookings", label: "Demandes & réservations", icon: "✉" },
  { href: "/admin/calendar", label: "Dates bloquées", icon: "▤" },
  { href: "/admin/rooms", label: "Chambres", icon: "▭" },
  { href: "/admin/extras", label: "Extras", icon: "✦" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙" },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sand lg:flex">
      {/* Sidebar */}
      <aside
        className={`${
          open ? "block" : "hidden"
        } border-b border-sand-200 bg-white lg:block lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r`}
      >
        <div className="flex h-16 items-center border-b border-sand-200 px-6">
          <Link href="/admin" className="font-serif text-lg text-terracotta">
            Dar Kader · Admin
          </Link>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-terracotta text-white"
                    : "text-ink/70 hover:bg-sand"
                }`}
              >
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sand-200 p-4">
          <p className="truncate text-xs text-muted">{email}</p>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="text-sm text-terracotta hover:underline"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-sand-200 bg-white px-5 lg:hidden">
          <Link href="/admin" className="font-serif text-lg text-terracotta">
            Dar Kader · Admin
          </Link>
          <button onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
