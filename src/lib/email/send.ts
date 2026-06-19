// Email delivery abstraction.
// Supports Resend and Brevo via env config. When no provider/API key is set
// (e.g. local dev), emails are logged to the console so the flow still works.

import type { RenderedEmail } from "./templates";
import { prisma } from "@/lib/prisma";

type SendArgs = {
  to: string;
  email: RenderedEmail;
  replyTo?: string;
  bookingId?: string;
  template?: string;
};

const FROM = () =>
  process.env.EMAIL_FROM || "Mbn Demo Riad <reservations@mbnriad.com>";

async function sendWithResend({ to, email, replyTo }: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM(),
      to: [to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    console.error("[email] Resend error", res.status, await res.text());
    return false;
  }
  return true;
}

function parseFrom(from: string): { name: string; email: string } {
  const match = /^(.*?)<(.+?)>$/.exec(from);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: "Mbn Demo Riad", email: from.trim() };
}

async function sendWithBrevo({ to, email, replyTo }: SendArgs): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;
  const sender = parseFrom(FROM());
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject: email.subject,
      htmlContent: email.html,
      textContent: email.text,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });
  if (!res.ok) {
    console.error("[email] Brevo error", res.status, await res.text());
    return false;
  }
  return true;
}

/**
 * Send an email. Never throws — booking flow should not fail because of email.
 * Returns true if dispatched (or logged in dev), false on provider error.
 * Optionally logs to the EmailLog table when bookingId + template are provided.
 */
export async function sendEmail(args: SendArgs): Promise<boolean> {
  const provider = (process.env.EMAIL_PROVIDER || "").toLowerCase();
  let success = false;
  let errorMsg: string | undefined;

  try {
    if (provider === "resend") {
      success = await sendWithResend(args);
    } else if (provider === "brevo") {
      success = await sendWithBrevo(args);
    } else {
      console.info(
        `\n[email:dev] To: ${args.to}\nSubject: ${args.email.subject}\n${args.email.text}\n`
      );
      success = true;
    }
  } catch (err) {
    console.error("[email] send failed", err);
    errorMsg = String(err);
  }

  // Persist to EmailLog when a bookingId is supplied (best-effort, non-fatal).
  if (args.bookingId || args.template) {
    try {
      await prisma.emailLog.create({
        data: {
          bookingId: args.bookingId ?? null,
          to: args.to,
          subject: args.email.subject,
          template: args.template ?? "unknown",
          status: success ? "sent" : "failed",
          error: errorMsg ?? null,
        },
      });
    } catch {
      // Log table write failure is non-fatal.
    }
  }

  return success;
}
