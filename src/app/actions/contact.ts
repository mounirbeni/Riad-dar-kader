"use server";

import { headers } from "next/headers";
import { contactSchema } from "@/lib/validation";
import { rateLimit, sweep } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { RIAD } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function sendContactMessage(raw: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const data = parsed.data;
  if (data.website && data.website.length > 0) {
    return { ok: false, error: "invalid_input" };
  }

  sweep();
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const limited = rateLimit(`contact:${ip}`, 5, 10 * 60_000);
  if (!limited.success) return { ok: false, error: "rate_limited" };

  const ownerEmail =
    process.env.OWNER_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "owner@riaddarkader.com";

  // Persist to DB for admin inbox
  await prisma.contactMessage.create({
    data: {
      from: data.name,
      email: data.email,
      subject: `Message du site — ${data.name}`,
      body: data.message,
      channel: "form",
      status: "new",
    },
  });

  const escapedName = data.name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const escapedMsg = data.message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");

  await sendEmail({
    to: ownerEmail,
    replyTo: data.email,
    email: {
      subject: `📩 Message du site — ${data.name}`,
      text: `De : ${data.name} <${data.email}>\n\n${data.message}`,
      html: `<p><strong>De :</strong> ${escapedName} &lt;${data.email}&gt;</p><p>${escapedMsg}</p><hr/><p style="color:#7A6A58;font-size:12px;">${RIAD.name} — message envoyé depuis le formulaire de contact.</p>`,
    },
  });

  return { ok: true };
}
