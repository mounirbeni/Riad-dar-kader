"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Locale } from "@/i18n/config";
import { calendarAvailability } from "@/app/actions/booking";
import { parseDateOnly, toDateOnlyString, todayUTC, eachNight } from "@/lib/dates";

type Props = {
  locale: Locale;
  checkIn: string;
  checkOut: string;
  onSelect: (checkIn: string, checkOut: string) => void;
};

const WINDOW_DAYS = 100;

const WEEKDAYS = {
  fr: ["L", "M", "M", "J", "V", "S", "D"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};
const MONTHS = {
  fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(Date.UTC(year, month, 1));
  const startWeekday = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(Date.UTC(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function AvailabilityCalendar({ locale, checkIn, checkOut, onSelect }: Props) {
  const today = todayUTC();
  const [viewYear, setViewYear] = useState(today.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(today.getUTCMonth());
  const [soldOut, setSoldOut] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const maxDate = useMemo(() => {
    const m = new Date(today);
    m.setUTCDate(m.getUTCDate() + WINDOW_DAYS);
    return m;
  }, [today]);

  useEffect(() => {
    startTransition(async () => {
      const data = await calendarAvailability(toDateOnlyString(today), WINDOW_DAYS);
      setSoldOut(new Set(data.filter((d) => d.soldOut).map((d) => d.date)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ci = parseDateOnly(checkIn);
  const co = parseDateOnly(checkOut);

  function rangeHasSoldOut(a: Date, b: Date): boolean {
    return eachNight(a, b).some((n) => soldOut.has(toDateOnlyString(n)));
  }

  function handleClick(date: Date) {
    const key = toDateOnlyString(date);
    if (date < today || soldOut.has(key)) return;
    if (!ci || (ci && co) || date <= ci) {
      onSelect(key, "");
      return;
    }
    if (rangeHasSoldOut(ci, date)) {
      onSelect(key, "");
      return;
    }
    onSelect(toDateOnlyString(ci), key);
  }

  function cellState(date: Date) {
    const key = toDateOnlyString(date);
    const isPast = date < today;
    const isSold = soldOut.has(key);
    const isCheckIn = ci && toDateOnlyString(ci) === key;
    const isCheckOut = co && toDateOnlyString(co) === key;
    const inRange = ci && co && date > ci && date < co;
    const isToday = toDateOnlyString(date) === toDateOnlyString(today);
    return { isPast, isSold, isCheckIn, isCheckOut, inRange, isToday };
  }

  function shiftMonth(delta: number) {
    let y = viewYear;
    let m = viewMonth + delta;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewYear(y);
    setViewMonth(m);
  }

  const canPrev =
    viewYear > today.getUTCFullYear() ||
    (viewYear === today.getUTCFullYear() && viewMonth > today.getUTCMonth());
  const canNext = new Date(Date.UTC(viewYear, viewMonth + 1, 1)) <= maxDate;

  const months = [
    { y: viewYear, m: viewMonth },
    { y: viewMonth === 11 ? viewYear + 1 : viewYear, m: (viewMonth + 1) % 12 },
  ];

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canPrev}
          aria-label={locale === "fr" ? "Mois précédent" : "Previous month"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-300 bg-white text-ink transition hover:border-terracotta hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="flex flex-1 justify-center gap-8">
          {months.map(({ y, m }, idx) => (
            <p
              key={`${y}-${m}`}
              className={`font-serif text-base font-semibold text-ink ${idx === 1 ? "hidden sm:block" : ""}`}
            >
              {MONTHS[locale][m]} {y}
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canNext}
          aria-label={locale === "fr" ? "Mois suivant" : "Next month"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-300 bg-white text-ink transition hover:border-terracotta hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Calendar grid(s) */}
      <div className="grid gap-6 sm:grid-cols-2">
        {months.map(({ y, m }, idx) => (
          <div key={`${y}-${m}`} className={idx === 1 ? "hidden sm:block" : ""}>
            {/* Day-of-week headers */}
            <div className="mb-1 grid grid-cols-7">
              {WEEKDAYS[locale].map((w, wi) => (
                <div
                  key={wi}
                  className="py-1.5 text-center text-[11px] font-semibold uppercase tracking-widest text-muted"
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {monthGrid(y, m).map((date, i) => {
                if (!date) return <div key={i} className="aspect-square" />;
                const { isPast, isSold, isCheckIn, isCheckOut, inRange, isToday } = cellState(date);
                const disabled = isPast || isSold;
                const isEndpoint = isCheckIn || isCheckOut;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleClick(date)}
                    className={[
                      "relative aspect-square text-sm font-medium transition-all duration-150 focus:outline-none",
                      // Range background — no border-radius on range cells so they merge
                      inRange
                        ? "bg-terracotta/10 text-terracotta"
                        : "",
                      // Endpoint circles — rounded
                      isEndpoint
                        ? "z-10"
                        : "",
                      // Disabled
                      disabled
                        ? "cursor-not-allowed text-sand-300"
                        : !isEndpoint && !inRange
                          ? "text-ink hover:bg-sand-200 rounded-lg"
                          : "",
                      // Today ring
                      isToday && !isEndpoint
                        ? "font-bold underline decoration-terracotta decoration-2 underline-offset-2"
                        : "",
                    ].join(" ")}
                  >
                    {/* Endpoint circle */}
                    {isEndpoint && (
                      <span className="absolute inset-1 flex items-center justify-center rounded-full bg-terracotta text-white shadow-sm shadow-terracotta/40">
                        {date.getUTCDate()}
                      </span>
                    )}
                    {/* Sold-out line */}
                    {isSold && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sand-300 line-through">{date.getUTCDate()}</span>
                      </span>
                    )}
                    {/* Normal date */}
                    {!isEndpoint && !isSold && date.getUTCDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] text-white">1</span>
          {locale === "fr" ? "Sélectionné" : "Selected"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-5 w-5 rounded-lg bg-terracotta/10" />
          {locale === "fr" ? "Votre séjour" : "Your stay"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-5 w-5 rounded-lg bg-sand-100 text-[10px] text-sand-300 line-through flex items-center justify-center">7</span>
          {locale === "fr" ? "Indisponible" : "Unavailable"}
        </span>
      </div>
    </div>
  );
}
