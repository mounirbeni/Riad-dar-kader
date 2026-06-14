"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Locale } from "@/i18n/config";
import { calendarAvailability } from "@/app/actions/booking";
import {
  parseDateOnly,
  toDateOnlyString,
  todayUTC,
  eachNight,
} from "@/lib/dates";

type Props = {
  locale: Locale;
  checkIn: string;
  checkOut: string;
  onSelect: (checkIn: string, checkOut: string) => void;
};

const WINDOW_DAYS = 100;

const WEEKDAYS = {
  fr: ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};
const MONTHS = {
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(Date.UTC(year, month, 1));
  const startWeekday = (first.getUTCDay() + 6) % 7; // Monday = 0
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

    // Start fresh if nothing chosen, both chosen, or click before current check-in.
    if (!ci || (ci && co) || date <= ci) {
      onSelect(key, "");
      return;
    }
    // ci set, choosing checkout: ensure no sold-out night in [ci, date)
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
    return { isPast, isSold, isCheckIn, isCheckOut, inRange };
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
  const canNext =
    new Date(Date.UTC(viewYear, viewMonth + 1, 1)) <= maxDate;

  // Render current month and the next one (2-up on desktop).
  const months = [
    { y: viewYear, m: viewMonth },
    { y: viewMonth === 11 ? viewYear + 1 : viewYear, m: (viewMonth + 1) % 12 },
  ];

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canPrev}
          aria-label="Mois précédent"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-300 text-terracotta transition hover:bg-sand disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {locale === "fr" ? "Sélectionnez vos dates" : "Select your dates"}
        </span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canNext}
          aria-label="Mois suivant"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-300 text-terracotta transition hover:bg-sand disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {months.map(({ y, m }, idx) => (
          <div key={`${y}-${m}`} className={idx === 1 ? "hidden sm:block" : ""}>
            <p className="mb-2 text-center font-serif text-lg text-ink">
              {MONTHS[locale][m]} {y}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS[locale].map((w) => (
                <div key={w} className="py-1 text-center text-[10px] font-medium uppercase text-muted">
                  {w}
                </div>
              ))}
              {monthGrid(y, m).map((date, i) => {
                if (!date) return <div key={i} />;
                const { isPast, isSold, isCheckIn, isCheckOut, inRange } = cellState(date);
                const disabled = isPast || isSold;
                const selected = isCheckIn || isCheckOut;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleClick(date)}
                    className={[
                      "relative aspect-square rounded-lg text-sm transition",
                      selected
                        ? "bg-terracotta font-semibold text-white"
                        : inRange
                          ? "bg-terracotta/10 text-terracotta"
                          : disabled
                            ? "cursor-not-allowed text-sand-300 line-through"
                            : "text-ink hover:bg-sand-200",
                    ].join(" ")}
                  >
                    {date.getUTCDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-terracotta" /> {locale === "fr" ? "Sélectionné" : "Selected"}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-terracotta/10" /> {locale === "fr" ? "Votre séjour" : "Your stay"}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-sand-200 line-through" /> {locale === "fr" ? "Indisponible" : "Unavailable"}</span>
      </div>
    </div>
  );
}
