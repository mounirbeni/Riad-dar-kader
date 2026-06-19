import { whatsappNumber } from "@/lib/constants";
import { formatDateHuman } from "@/lib/dates";
import { formatEUR } from "@/lib/money";

type WhatsAppBooking = {
  reference: string;
  guestName: string;
  guestPhone: string;
  guestCountry?: string | null;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  optionLabel?: string | null;
  status: string;
  estimatedTotal: number;
  extras: { name: string; quantity: number }[];
};

/** Build a wa.me link with a pre-filled message. */
export function waLink(message: string, number?: string): string {
  const phone = (number || whatsappNumber()).replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Simple guest CTA — opens a chat with the riad. */
export function guestWhatsAppLink(locale: "fr" | "en" = "fr"): string {
  const message =
    locale === "fr"
      ? "Bonjour Mbn Demo Riad, j'aimerais avoir des informations sur un séjour."
      : "Hello Mbn Demo Riad, I'd like some information about a stay.";
  return waLink(message);
}

/** Owner notification message summarising a new/updated booking request. */
export function ownerWhatsAppMessage(booking: WhatsAppBooking): string {
  const lines = [
    `🏛️ *Mbn Demo Riad — Demande ${booking.reference}*`,
    `Statut : ${booking.status}`,
    "",
    `👤 ${booking.guestName}`,
    `📞 ${booking.guestPhone}${booking.guestCountry ? ` (${booking.guestCountry})` : ""}`,
    "",
    `📅 ${formatDateHuman(booking.checkIn, "fr")} → ${formatDateHuman(booking.checkOut, "fr")}`,
    `👥 ${booking.guests} voyageur(s)`,
    booking.optionLabel ? `🏨 ${booking.optionLabel}` : "",
  ].filter(Boolean);

  if (booking.extras.length > 0) {
    lines.push("", "✨ Extras :");
    for (const e of booking.extras) {
      lines.push(`  • ${e.name}${e.quantity > 1 ? ` ×${e.quantity}` : ""}`);
    }
  }

  lines.push("", `💰 Total estimé : ${formatEUR(booking.estimatedTotal)}`);
  return lines.join("\n");
}

/** Owner WhatsApp link with the booking summary pre-filled. */
export function ownerWhatsAppLink(booking: WhatsAppBooking): string {
  return waLink(ownerWhatsAppMessage(booking));
}
