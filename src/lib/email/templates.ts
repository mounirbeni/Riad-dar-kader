import { formatDateHuman } from "@/lib/dates";
import { formatEUR } from "@/lib/money";
import { RIAD } from "@/lib/constants";

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

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

const T = {
  fr: {
    location: "Médina de Marrakech",
    footer: "Mbn Riad · Médina, près du Musée Mouassine, Marrakech, Maroc\nRéservation directe acceptée.",
    reference: "Référence",
    arrival: "Arrivée",
    departure: "Départ",
    guests: "Voyageurs",
    formula: "Formule",
    extras: "Extras",
    total: "Total estimé",
    estimatedNote: "Le total est <strong>estimé</strong>. La confirmation finale vous sera envoyée par le riad.",
    team: `L'équipe du ${RIAD.name}`,
  },
  en: {
    location: "Medina of Marrakech",
    footer: "Mbn Riad · Medina, near Mouassine Museum, Marrakech, Morocco\nDirect booking accepted.",
    reference: "Reference",
    arrival: "Check-in",
    departure: "Check-out",
    guests: "Guests",
    formula: "Package",
    extras: "Extras",
    total: "Estimated total",
    estimatedNote: "The total is an <strong>estimate</strong>. The final confirmation will be sent by the riad.",
    team: `The ${RIAD.name} team`,
  },
};

function layout(title: string, bodyHtml: string, locale: "fr" | "en" = "fr"): string {
  const t = T[locale];
  return `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background:${COLORS.bg};font-family:Helvetica,Arial,sans-serif;color:${COLORS.ink};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(26,26,26,0.08);">
          <tr><td style="background:${COLORS.primary};padding:28px 32px;">
            <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">${RIAD.name}</div>
            <div style="color:#F5D9C9;font-size:13px;margin-top:4px;">${t.location}</div>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:${COLORS.primary};">${title}</h1>
            ${bodyHtml}
          </td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #EAE1D2;color:${COLORS.muted};font-size:12px;">
            ${t.footer.replace(/\n/g, "<br/>")}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function detailsTable(data: EmailBookingData, locale: "fr" | "en" = "fr"): string {
  const t = T[locale];
  const dateLocale = locale === "fr" ? "fr" : "en";
  const rows: [string, string][] = [
    [t.reference, data.reference],
    [t.arrival, formatDateHuman(data.checkIn, dateLocale)],
    [t.departure, formatDateHuman(data.checkOut, dateLocale)],
    [t.guests, String(data.guests)],
  ];
  if (data.optionLabel) rows.push([t.formula, data.optionLabel]);
  if (data.extras.length > 0) {
    rows.push([
      t.extras,
      data.extras.map((e) => `${e.name}${e.quantity > 1 ? ` ×${e.quantity}` : ""}`).join(", "),
    ]);
  }
  rows.push([t.total, formatEUR(data.estimatedTotal, locale)]);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px;">
    ${rows.map(([k, v]) => `<tr><td style="padding:8px 0;color:${COLORS.muted};font-size:13px;width:40%;">${k}</td><td style="padding:8px 0;font-size:14px;font-weight:600;">${v}</td></tr>`).join("")}
  </table>`;
}

function estimatedNote(locale: "fr" | "en" = "fr"): string {
  return `<p style="background:${COLORS.bg};border-radius:10px;padding:12px 14px;color:${COLORS.muted};font-size:13px;margin:16px 0 0;">${T[locale].estimatedNote}</p>`;
}

// 1. Guest — booking request received
export function guestRequestReceived(data: EmailBookingData, locale: "fr" | "en" = "fr"): RenderedEmail {
  const t = T[locale];
  const dateLocale = locale === "fr" ? "fr" : "en";
  const title = locale === "fr" ? "Nous avons bien reçu votre demande" : "We received your booking request";
  const subject = locale === "fr"
    ? `Votre demande de séjour ${data.reference} — ${RIAD.name}`
    : `Your stay request ${data.reference} — ${RIAD.name}`;
  const intro = locale === "fr"
    ? `Merci pour votre demande de séjour au ${RIAD.name}. Nous vérifions la disponibilité et reviendrons vers vous très rapidement pour confirmer.`
    : `Thank you for your stay request at ${RIAD.name}. We are checking availability and will get back to you shortly to confirm.`;
  const closing = locale === "fr" ? `À très bientôt,<br/>${t.team}` : `See you soon,<br/>${t.team}`;

  const html = layout(title, `<p style="font-size:14px;line-height:1.6;">Bonjour ${escHtml(data.guestName)},</p>
     <p style="font-size:14px;line-height:1.6;">${intro}</p>
     ${detailsTable(data, locale)}
     ${estimatedNote(locale)}
     <p style="font-size:14px;line-height:1.6;margin-top:20px;">${closing}</p>`, locale);

  const text = locale === "fr"
    ? `Bonjour ${data.guestName},\n\nMerci pour votre demande de séjour (${data.reference}).\n\nArrivée : ${formatDateHuman(data.checkIn, dateLocale)}\nDépart : ${formatDateHuman(data.checkOut, dateLocale)}\nVoyageurs : ${data.guests}\nTotal estimé : ${formatEUR(data.estimatedTotal, locale)}\n\nLa confirmation finale vous sera envoyée par le riad.\n\n${t.team}`
    : `Hello ${data.guestName},\n\nThank you for your stay request (${data.reference}).\n\nCheck-in: ${formatDateHuman(data.checkIn, dateLocale)}\nCheck-out: ${formatDateHuman(data.checkOut, dateLocale)}\nGuests: ${data.guests}\nEstimated total: ${formatEUR(data.estimatedTotal, locale)}\n\nThe final confirmation will be sent by the riad.\n\n${t.team}`;

  return { subject, html, text };
}

// 2. Owner — new booking notification (always French for owner)
export function ownerNewBooking(data: EmailBookingData): RenderedEmail {
  const subject = `🔔 Nouvelle demande ${data.reference} — ${data.guestName}`;
  const html = layout(
    "Nouvelle demande de séjour",
    `<p style="font-size:14px;line-height:1.6;">Une nouvelle demande vient d'arriver.</p>
     ${detailsTable(data, "fr")}
     <table role="presentation" width="100%" style="margin-top:12px;">
       <tr><td style="padding:6px 0;color:${COLORS.muted};font-size:13px;">Contact</td><td style="padding:6px 0;font-size:14px;font-weight:600;">${escHtml(data.guestEmail)} · ${escHtml(data.guestPhone)}${data.guestCountry ? ` (${escHtml(data.guestCountry)})` : ""}</td></tr>
     </table>
     ${data.specialRequests ? `<p style="font-size:13px;color:${COLORS.muted};margin-top:12px;"><strong>Demandes :</strong> ${escHtml(data.specialRequests)}</p>` : ""}`,
    "fr"
  );
  const text = `Nouvelle demande ${data.reference}\n${data.guestName} — ${data.guestEmail} — ${data.guestPhone}\n${formatDateHuman(data.checkIn, "fr")} → ${formatDateHuman(data.checkOut, "fr")} · ${data.guests} voyageurs\nTotal estimé : ${formatEUR(data.estimatedTotal)}`;
  return { subject, html, text };
}

// 3. Booking confirmed
export function bookingConfirmed(data: EmailBookingData, locale: "fr" | "en" = "fr"): RenderedEmail {
  const t = T[locale];
  const dateLocale = locale === "fr" ? "fr" : "en";
  const title = locale === "fr" ? "Votre séjour est confirmé 🎉" : "Your stay is confirmed 🎉";
  const subject = locale === "fr"
    ? `Votre séjour est confirmé — ${RIAD.name} (${data.reference})`
    : `Your stay is confirmed — ${RIAD.name} (${data.reference})`;
  const intro = locale === "fr"
    ? `Bonne nouvelle : votre séjour au ${RIAD.name} est confirmé. Nous avons hâte de vous accueillir.`
    : `Great news: your stay at ${RIAD.name} is confirmed. We look forward to welcoming you.`;
  const closing = locale === "fr"
    ? `À très bientôt à Marrakech,<br/>${t.team}`
    : `See you soon in Marrakech,<br/>${t.team}`;

  const html = layout(title, `<p style="font-size:14px;line-height:1.6;">${locale === "fr" ? "Bonjour" : "Hello"} ${escHtml(data.guestName)},</p>
     <p style="font-size:14px;line-height:1.6;">${intro}</p>
     ${detailsTable(data, locale)}
     <p style="font-size:14px;line-height:1.6;margin-top:20px;">${closing}</p>`, locale);

  const text = locale === "fr"
    ? `Bonjour ${data.guestName},\n\nVotre séjour (${data.reference}) est confirmé.\n${formatDateHuman(data.checkIn, dateLocale)} → ${formatDateHuman(data.checkOut, dateLocale)}\n\nÀ très bientôt à Marrakech,\n${t.team}`
    : `Hello ${data.guestName},\n\nYour stay (${data.reference}) is confirmed.\n${formatDateHuman(data.checkIn, dateLocale)} → ${formatDateHuman(data.checkOut, dateLocale)}\n\nSee you soon in Marrakech,\n${t.team}`;

  return { subject, html, text };
}

// 4. Booking cancelled
export function bookingCancelled(data: EmailBookingData, locale: "fr" | "en" = "fr"): RenderedEmail {
  const t = T[locale];
  const dateLocale = locale === "fr" ? "fr" : "en";
  const subject = locale === "fr"
    ? `Votre demande ${data.reference} — ${RIAD.name}`
    : `Your request ${data.reference} — ${RIAD.name}`;
  const title = locale === "fr" ? "Concernant votre demande" : "Regarding your request";
  const body = locale === "fr"
    ? `Nous sommes désolés, nous ne pouvons malheureusement pas confirmer votre séjour pour les dates demandées (${formatDateHuman(data.checkIn, dateLocale)} → ${formatDateHuman(data.checkOut, dateLocale)}). N'hésitez pas à nous contacter pour trouver d'autres dates.`
    : `We are sorry, we are unable to confirm your stay for the requested dates (${formatDateHuman(data.checkIn, dateLocale)} → ${formatDateHuman(data.checkOut, dateLocale)}). Please contact us to find alternative dates.`;

  const html = layout(title, `<p style="font-size:14px;line-height:1.6;">${locale === "fr" ? "Bonjour" : "Hello"} ${escHtml(data.guestName)},</p>
     <p style="font-size:14px;line-height:1.6;">${body}</p>
     <p style="font-size:14px;line-height:1.6;margin-top:20px;">${locale === "fr" ? "Bien à vous" : "Kind regards"},<br/>${t.team}</p>`, locale);

  const text = locale === "fr"
    ? `Bonjour ${data.guestName},\n\nNous ne pouvons malheureusement pas confirmer votre séjour (${data.reference}) pour les dates demandées. Contactez-nous pour d'autres dates.\n\n${t.team}`
    : `Hello ${data.guestName},\n\nWe are unable to confirm your stay (${data.reference}) for the requested dates. Please contact us for alternative dates.\n\n${t.team}`;

  return { subject, html, text };
}

// 5. Pre-arrival message
export function preArrival(data: EmailBookingData, locale: "fr" | "en" = "fr"): RenderedEmail {
  const t = T[locale];
  const dateLocale = locale === "fr" ? "fr" : "en";
  const subject = locale === "fr"
    ? `Préparez votre arrivée — ${RIAD.name}`
    : `Prepare for your arrival — ${RIAD.name}`;
  const title = locale === "fr" ? "Votre arrivée approche" : "Your arrival is approaching";
  const body = locale === "fr"
    ? `Votre séjour au ${RIAD.name} approche (arrivée le ${formatDateHuman(data.checkIn, dateLocale)}). Le riad se trouve dans la Médina, près du Musée Mouassine. Comme les ruelles sont piétonnes, écrivez-nous sur WhatsApp à votre arrivée et nous viendrons vous accueillir.`
    : `Your stay at ${RIAD.name} is approaching (arrival on ${formatDateHuman(data.checkIn, dateLocale)}). The riad is located in the Medina, near Mouassine Museum. As the alleys are pedestrian, please message us on WhatsApp upon arrival and we will come to welcome you.`;

  const html = layout(title, `<p style="font-size:14px;line-height:1.6;">${locale === "fr" ? "Bonjour" : "Hello"} ${escHtml(data.guestName)},</p>
     <p style="font-size:14px;line-height:1.6;">${body}</p>
     ${detailsTable(data, locale)}
     <p style="font-size:14px;line-height:1.6;margin-top:20px;">${locale === "fr" ? "À très vite" : "See you soon"},<br/>${t.team}</p>`, locale);

  const text = locale === "fr"
    ? `Bonjour ${data.guestName},\n\nVotre séjour approche (arrivée le ${formatDateHuman(data.checkIn, dateLocale)}). Écrivez-nous sur WhatsApp à votre arrivée dans la Médina, nous viendrons vous accueillir.\n\n${t.team}`
    : `Hello ${data.guestName},\n\nYour stay is approaching (arrival on ${formatDateHuman(data.checkIn, dateLocale)}). Please message us on WhatsApp when you arrive in the Medina and we will come to meet you.\n\n${t.team}`;

  return { subject, html, text };
}

// 6. Password reset email
export function passwordResetEmail(data: { name: string; resetUrl: string }, locale: "fr" | "en" = "fr"): RenderedEmail {
  const t = T[locale];
  const subject = locale === "fr"
    ? `Réinitialisation de votre mot de passe — ${RIAD.name}`
    : `Reset your password — ${RIAD.name}`;
  const title = locale === "fr" ? "Réinitialiser votre mot de passe" : "Reset your password";
  const intro = locale === "fr"
    ? `Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans <strong>1 heure</strong>.`
    : `You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.`;
  const btnLabel = locale === "fr" ? "Réinitialiser mon mot de passe" : "Reset my password";
  const ignoreNote = locale === "fr"
    ? "Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail."
    : "If you did not request this reset, please ignore this email.";

  const html = layout(title, `<p style="font-size:14px;line-height:1.6;">${locale === "fr" ? "Bonjour" : "Hello"} ${escHtml(data.name)},</p>
     <p style="font-size:14px;line-height:1.6;">${intro}</p>
     <div style="text-align:center;margin:28px 0;">
       <a href="${data.resetUrl}" style="display:inline-block;background:${COLORS.primary};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;">${btnLabel}</a>
     </div>
     <p style="font-size:12px;color:${COLORS.muted};text-align:center;">${ignoreNote}</p>`, locale);

  const text = locale === "fr"
    ? `Bonjour ${data.name},\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nCliquez sur ce lien (expire dans 1 heure) :\n${data.resetUrl}\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.\n\n${t.team}`
    : `Hello ${data.name},\n\nYou requested a password reset.\n\nClick this link (expires in 1 hour):\n${data.resetUrl}\n\nIf you did not request this reset, please ignore this email.\n\n${t.team}`;

  return { subject, html, text };
}
