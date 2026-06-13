// Flexible pricing helpers. All amounts are whole MAD.
// Final price stays "estimated" until the owner confirms.

import type { ExtraPriceType } from "@prisma/client";

export function extraLineTotal(
  price: number,
  priceType: ExtraPriceType,
  quantity: number,
  context: { guests: number; nights: number }
): number {
  const qty = Math.max(1, quantity);
  switch (priceType) {
    case "per_guest":
      return price * context.guests * qty;
    case "per_night":
      return price * context.nights * qty;
    case "per_booking":
    default:
      return price * qty;
  }
}

export function priceTypeLabel(type: ExtraPriceType, locale: "fr" | "en") {
  const map = {
    fr: {
      per_booking: "par séjour",
      per_guest: "par personne",
      per_night: "par nuit",
    },
    en: {
      per_booking: "per booking",
      per_guest: "per guest",
      per_night: "per night",
    },
  } as const;
  return map[locale][type];
}
