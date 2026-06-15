"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Tab = "all" | "upcoming" | "past" | "cancelled";

const LABELS: Record<Tab, Record<string, string>> = {
  all:       { fr: "Toutes",   en: "All" },
  upcoming:  { fr: "À venir",  en: "Upcoming" },
  past:      { fr: "Passées",  en: "Past" },
  cancelled: { fr: "Annulées", en: "Cancelled" },
};

export function DashboardTabs({
  locale,
  counts,
}: {
  locale: string;
  counts: Record<Tab, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const active = (searchParams.get("tab") ?? "all") as Tab;

  function setTab(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") params.delete("tab");
    else params.set("tab", tab);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  const tabs: Tab[] = ["all", "upcoming", "past", "cancelled"];

  return (
    /* overflow-x-auto lets tabs scroll on narrow screens without wrapping */
    <div className="w-full overflow-x-auto scrollbar-hide -mx-0.5 px-0.5">
      <div className="flex items-center gap-1 rounded-xl bg-sand border border-sand-200 p-1 w-max min-w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            /* min-h-[36px] ensures a comfortable tap target */
            className={`flex items-center gap-1.5 rounded-lg px-3 min-h-[36px] text-xs font-medium transition-all whitespace-nowrap ${
              active === tab
                ? "bg-white shadow-sm text-ink"
                : "text-muted hover:text-ink active:bg-white/60"
            }`}
          >
            {LABELS[tab][locale] || LABELS[tab]["fr"]}
            {counts[tab] > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                active === tab
                  ? "bg-terracotta/10 text-terracotta"
                  : "bg-sand-200 text-muted"
              }`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
