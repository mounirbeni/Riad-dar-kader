// Currency formatting. All amounts are whole MAD (Moroccan dirham).

export function formatMAD(amount: number, locale: "fr" | "en" = "fr"): string {
  const formatted = new Intl.NumberFormat(locale === "fr" ? "fr-MA" : "en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return locale === "fr" ? `${formatted} MAD` : `${formatted} MAD`;
}

export function formatRange(min: number, max: number, locale: "fr" | "en" = "fr"): string {
  if (min === max) return formatMAD(min, locale);
  return `${formatMAD(min, locale)} – ${formatMAD(max, locale)}`;
}
