// Date helpers used by the availability engine and UI.
// All booking dates are treated as calendar dates (no time component) in UTC
// to avoid timezone drift between server and database.

/** Parse a YYYY-MM-DD string into a UTC midnight Date. Returns null if invalid. */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (Number.isNaN(date.getTime())) return null;
  // Guard against rollovers like 2026-02-31
  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(m) - 1 ||
    date.getUTCDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

/** Format a Date to YYYY-MM-DD (UTC). */
export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today at UTC midnight. */
export function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Whole nights between checkIn and checkOut. */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** Every night occupied by a stay: [checkIn, checkOut) — checkout day is free. */
export function eachNight(checkIn: Date, checkOut: Date): Date[] {
  const nights: Date[] = [];
  const cursor = new Date(checkIn);
  while (cursor < checkOut) {
    nights.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return nights;
}

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Human readable date for emails / summaries. */
export function formatDateHuman(date: Date, locale: "fr" | "en" = "fr"): string {
  const day = date.getUTCDate();
  const month = (locale === "fr" ? MONTHS_FR : MONTHS_EN)[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return locale === "fr" ? `${day} ${month} ${year}` : `${month} ${day}, ${year}`;
}
