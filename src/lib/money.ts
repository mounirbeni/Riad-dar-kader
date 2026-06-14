// Currency formatting. All amounts are whole EUR (euros).

export function formatEUR(amount: number, locale: "fr" | "en" = "fr"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

// Keep old name as alias so callers can be migrated gradually.
export const formatMAD = formatEUR;

export function formatRange(min: number, max: number, locale: "fr" | "en" = "fr"): string {
  if (min === max) return formatEUR(min, locale);
  return `${formatEUR(min, locale)} – ${formatEUR(max, locale)}`;
}
