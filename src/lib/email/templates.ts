import { formatDateHuman } from "@/lib/dates";
import { formatEUR } from "@/lib/money";
import { RIAD } from "@/lib/constants";

export type EmailBookingData = {
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry?: string | null;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  optionLabel?: string | null;
  estimatedTotal: number;
  specialRequests?: string | null;
  extras: { name: string; quantity: number }[];
  status?: string;
};

export type RenderedEmail = { subject: string; html: string; text: string };

const COLORS = {
  bg: "#F5F0E8",
  primary: "#8B3A2A",
  accent: "#B8943F",
  ink: "#1A1A1A",
  muted: "#7A6A58",
};

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:${COLORS.bg};font-family:Helvetica,Arial,sans-serif;color:${COLORS.ink};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(26,26,26,0.08);">
          <tr><td style="background:${COLORS.primary};padding:28px 32px;">
            <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">${RIAD.name}</div>
            <div style="color:#F5D9C9;font-size:13px;margin-top:4px;">Médina de Marrakech</div>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:${COLORS.primary};">${title}</h1>
            ${bodyHtml}
          </td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #EAE1D2;color:${COLORS.muted};font-size:12px;">
            ${RIAD.name} · Médina, près du Musée Mouassine, Marrakech, Maroc<br/>
            Réservation directe acceptée.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function detailsTable(data: EmailBookingData): string {
  const rows: [string, string][] = [
    ["Référence", data.reference],
    ["Arrivée", formatDateHuman(data.checkIn, "fr")],
    ["Départ", formatDateHuman(data.checkOut, "fr")],
    ["Voyageurs", String(data.guests)],
  ];
  if (data.optionLabel) rows.push(["Formule", data.optionLabel]);
  if (data.extras.length > 0) {
    rows.push([
      "Extras",
      data.extras
        .map((e) => `${e.name}${e.quantity > 1 ? ` ×${e.quantity}` : ""}`)
        .join(", "),
    ]);
  }
  rows.push(["Total estimé", formatEUR(data.estimatedTotal)]);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px;">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 0;color:${COLORS.muted};font-size:13px;width:40%;">${k}</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${v}</td></tr>`
      )
      .join("")}
  </table>`;
}

function estimatedNote(): string {
  return `<p style="background:${COLORS.bg};border-radius:10px;padding:12px 14px;color:${COLORS.muted};font-size:13px;margin:16px 0 0;">
    Le total est <strong>estimé</strong>. La confirmation finale vous sera envoyée par le riad.
  </p>`;
}

// 1. Guest — booking request received
export function guestRequestReceived(data: EmailBookingData): RenderedEmail {
  const subject = `Votre demande de séjour ${data.reference} — ${RIAD.name}`;
  const html = layout(
    "Nous avons bien reçu votre demande",
    `<p style="font-size:14px;line-height:1.6;">Bonjour ${data.guestName},</p>
     <p style="font-size:14px;line-height:1.6;">Merci pour votre demande de séjour au ${RIAD.name}. Nous vérifions la disponibilité et reviendrons vers vous très rapidement pour confirmer.</p>
     ${detailsTable(data)}
     ${estimatedNote()}
     <p style="font-size:14px;line-height:1.6;margin-top:20px;">À très bientôt,<br/>L'équipe du ${RIAD.name}</p>`
  );
  const text = `Bonjour ${data.guestName},\n\nMerci pour votre demande de séjour (${data.reference}).\n\nArrivée : ${formatDateHuman(
    data.checkIn,
    "fr"
  )}\nDépart : ${formatDateHuman(data.checkOut, "fr")}\nVoyageurs : ${data.guests}\nTotal estimé : ${formatEUR(
    data.estimatedTotal
  )}\n\nLa confirmation finale vous sera envoyée par le riad.\n\nL'équipe du ${RIAD.name}`;
  return { subject, html, text };
}

// 2. Owner — new booking notification
export function ownerNewBooking(data: EmailBookingData): RenderedEmail {
  const subject = `🔔 Nouvelle demande ${data.reference} — ${data.guestName}`;
  const html = layout(
    "Nouvelle demande de séjour",
    `<p style="font-size:14px;line-height:1.6;">Une nouvelle demande vient d'arriver.</p>
     ${detailsTable(data)}
     <table role="presentation" width="100%" style="margin-top:12px;">
       <tr><td style="padding:6px 0;color:${COLORS.muted};font-size:13px;">Contact</td><td style="padding:6px 0;font-size:14px;font-weight:600;">${data.guestEmail} · ${data.guestPhone}${
       data.guestCountry ? ` (${data.guestCountry})` : ""
     }</td></tr>
     </table>
     ${data.specialRequests ? `<p style="font-size:13px;color:${COLORS.muted};margin-top:12px;"><strong>Demandes :</strong> ${data.specialRequests}</p>` : ""}`
  );
  const text = `Nouvelle demande ${data.reference}\n${data.guestName} — ${data.guestEmail} — ${data.guestPhone}\n${formatDateHuman(
    data.checkIn,
    "fr"
  )} → ${formatDateHuman(data.checkOut, "fr")} · ${data.guests} voyageurs\nTotal estimé : ${formatEUR(
    data.estimatedTotal
  )}`;
  return { subject, html, text };
}

// 3. Booking confirmed
export function bookingConfirmed(data: EmailBookingData): RenderedEmail {
  const subject = `Votre séjour est confirmé — ${RIAD.name} (${data.reference})`;
  const html = layout(
    "Votre séjour est confirmé 🎉",
    `<p style="font-size:14px;line-height:1.6;">Bonjour ${data.guestName},</p>
     <p style="font-size:14px;line-height:1.6;">Bonne nouvelle : votre séjour au ${RIAD.name} est confirmé. Nous avons hâte de vous accueillir.</p>
     ${detailsTable(data)}
     <p style="font-size:14px;line-height:1.6;margin-top:20px;">À très bientôt à Marrakech,<br/>L'équipe du ${RIAD.name}</p>`
  );
  const text = `Bonjour ${data.guestName},\n\nVotre séjour (${data.reference}) est confirmé.\n${formatDateHuman(
    data.checkIn,
    "fr"
  )} → ${formatDateHuman(data.checkOut, "fr")}\n\nÀ très bientôt à Marrakech,\nL'équipe du ${RIAD.name}`;
  return { subject, html, text };
}

// 4. Booking cancelled
export function bookingCancelled(data: EmailBookingData): RenderedEmail {
  const subject = `Votre demande ${data.reference} — ${RIAD.name}`;
  const html = layout(
    "Concernant votre demande",
    `<p style="font-size:14px;line-height:1.6;">Bonjour ${data.guestName},</p>
     <p style="font-size:14px;line-height:1.6;">Nous sommes désolés, nous ne pouvons malheureusement pas confirmer votre séjour pour les dates demandées (${formatDateHuman(
       data.checkIn,
       "fr"
     )} → ${formatDateHuman(
       data.checkOut,
       "fr"
     )}). N'hésitez pas à nous contacter pour trouver d'autres dates.</p>
     <p style="font-size:14px;line-height:1.6;margin-top:20px;">Bien à vous,<br/>L'équipe du ${RIAD.name}</p>`
  );
  const text = `Bonjour ${data.guestName},\n\nNous ne pouvons malheureusement pas confirmer votre séjour (${data.reference}) pour les dates demandées. Contactez-nous pour d'autres dates.\n\nL'équipe du ${RIAD.name}`;
  return { subject, html, text };
}

// 5. Pre-arrival message
export function preArrival(data: EmailBookingData): RenderedEmail {
  const subject = `Préparez votre arrivée — ${RIAD.name}`;
  const html = layout(
    "Votre arrivée approche",
    `<p style="font-size:14px;line-height:1.6;">Bonjour ${data.guestName},</p>
     <p style="font-size:14px;line-height:1.6;">Votre séjour au ${RIAD.name} approche (arrivée le ${formatDateHuman(
       data.checkIn,
       "fr"
     )}). Le riad se trouve dans la Médina, près du Musée Mouassine. Comme les ruelles sont piétonnes, écrivez-nous sur WhatsApp à votre arrivée et nous viendrons vous accueillir.</p>
     ${detailsTable(data)}
     <p style="font-size:14px;line-height:1.6;margin-top:20px;">À très vite,<br/>L'équipe du ${RIAD.name}</p>`
  );
  const text = `Bonjour ${data.guestName},\n\nVotre séjour approche (arrivée le ${formatDateHuman(
    data.checkIn,
    "fr"
  )}). Écrivez-nous sur WhatsApp à votre arrivée dans la Médina, nous viendrons vous accueillir.\n\nL'équipe du ${RIAD.name}`;
  return { subject, html, text };
}
