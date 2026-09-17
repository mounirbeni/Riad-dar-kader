// Riad-wide constants and configuration.

export const RIAD = {
  name: "MBN DEMO RIAD",
  totalRooms: 7,
  city: "Marrakech",
  area: "Médina, près du Musée Mouassine",
  currency: "EUR",
  currencyLabel: "€",
  openingNote: {
    fr: "Ouverture prévue début octobre",
    en: "Opening early October",
  },
} as const;

export const whatsappNumber = () =>
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, "") || "212600000000";

export const contactEmail = () =>
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@mbnriad.com";

export const siteUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

  // The legacy Vercel URL is no longer assigned to this project.
  if (!configuredUrl || configuredUrl === "https://riad-dar-kader.vercel.app") {
    return "https://mbndemo.vercel.app";
  }

  return configuredUrl;
};

// Settings keys persisted in SiteSetting table.
export const SETTING_KEYS = {
  HOLD_PENDING_AVAILABILITY: "hold_pending_availability", // "true" | "false"
  MIN_NIGHTS: "min_nights",
} as const;
