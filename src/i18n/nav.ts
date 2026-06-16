import type { Locale } from "./config";

// Path segments are shared across locales (only the prefix changes), which
// keeps routing simple while the labels are translated.
export const navPaths = {
  home: "",
  riad: "le-riad",
  rooms: "chambres",
  stay: "sejour",
  experiences: "experiences",
  gallery: "galerie",
  contact: "contact",
  faq: "aide",
} as const;

export type NavKey = keyof typeof navPaths;

export function localePath(locale: Locale, key: NavKey): string {
  const seg = navPaths[key];
  return seg ? `/${locale}/${seg}` : `/${locale}`;
}

export function withLocale(locale: Locale, path = ""): string {
  const clean = path.replace(/^\//, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}
