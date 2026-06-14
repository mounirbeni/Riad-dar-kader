// Riad-wide constants and configuration.

export const RIAD = {
  name: "Riad Dar Kader",
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
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@riaddarkader.com";

export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Settings keys persisted in SiteSetting table.
export const SETTING_KEYS = {
  HOLD_PENDING_AVAILABILITY: "hold_pending_availability", // "true" | "false"
  MIN_NIGHTS: "min_nights",
} as const;
