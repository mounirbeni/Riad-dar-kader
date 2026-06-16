"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authenticateGuest, createGuestSession, destroyGuestSession } from "@/lib/guest-auth";
import { randomBytes, createHash } from "crypto";
import { sendEmail } from "@/lib/email/send";
import { passwordResetEmail } from "@/lib/email/templates";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

type ActionState = { ok: boolean; error?: string; message?: string };

export async function guestLoginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const locale = String(formData.get("locale") || "fr");

  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const loginLimit = rateLimit(`guest-login:${ip}`, 8, 10 * 60_000);
  if (!loginLimit.success) return { ok: false, error: "Trop de tentatives. Réessayez dans 10 minutes." };

  if (!email || !password) return { ok: false, error: "Veuillez remplir tous les champs." };

  const session = await authenticateGuest(email, password);
  if (!session) return { ok: false, error: "Email ou mot de passe incorrect." };

  await createGuestSession(session);
  redirect(`/${locale}/compte`);
}

export async function guestSignupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const phone = String(formData.get("phone") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const locale = String(formData.get("locale") || "fr");

  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const signupLimit = rateLimit(`guest-signup:${ip}`, 5, 10 * 60_000);
  if (!signupLimit.success) return { ok: false, error: "Trop de tentatives. Réessayez dans 10 minutes." };

  if (!name || !email || !password) return { ok: false, error: "Veuillez remplir tous les champs obligatoires." };
  if (password.length < 8) return { ok: false, error: "Le mot de passe doit contenir au moins 8 caractères." };

  const normalizedPhone = phone || null;

  const [emailConflict, phoneConflict] = await Promise.all([
    prisma.guestUser.findUnique({ where: { email } }),
    normalizedPhone ? prisma.guestUser.findUnique({ where: { phone: normalizedPhone } }) : null,
  ]);

  if (emailConflict) return { ok: false, error: "Un compte existe déjà avec cet email. Connectez-vous ou utilisez une autre adresse." };
  if (phoneConflict) return { ok: false, error: "Ce numéro de téléphone est déjà associé à un compte existant." };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.guestUser.create({
    data: { name, email, passwordHash, phone: normalizedPhone, country: country || null },
  });

  // Link any existing bookings made with this email
  await prisma.booking.updateMany({
    where: { guestEmail: email, guestUserId: null },
    data: { guestUserId: user.id },
  });

  await createGuestSession({ sub: user.id, email: user.email, name: user.name });
  redirect(`/${locale}/compte`);
}

// Non-redirecting versions used inside the booking flow auth gate.
export type BookingAuthResult =
  | { ok: true; user: { id: string; name: string; email: string; phone: string | null } }
  | { ok: false; error: string };

export async function bookingLoginAction(_prev: BookingAuthResult, formData: FormData): Promise<BookingAuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const loginLimit = rateLimit(`booking-login:${ip}`, 8, 10 * 60_000);
  if (!loginLimit.success) return { ok: false, error: "Trop de tentatives. Réessayez plus tard." };
  if (!email || !password) return { ok: false, error: "Veuillez remplir tous les champs." };
  const session = await authenticateGuest(email, password);
  if (!session) return { ok: false, error: "Email ou mot de passe incorrect." };
  await createGuestSession(session);
  const user = await prisma.guestUser.findUnique({ where: { id: session.sub } });
  return { ok: true, user: { id: session.sub, name: session.name, email: session.email, phone: user?.phone ?? null } };
}

export async function bookingSignupAction(_prev: BookingAuthResult, formData: FormData): Promise<BookingAuthResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const phone = String(formData.get("phone") || "").trim() || null;
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const signupLimit = rateLimit(`booking-signup:${ip}`, 5, 10 * 60_000);
  if (!signupLimit.success) return { ok: false, error: "Trop de tentatives. Réessayez plus tard." };
  if (!name || !email || !password) return { ok: false, error: "Veuillez remplir tous les champs obligatoires." };
  if (password.length < 8) return { ok: false, error: "Mot de passe : 8 caractères minimum." };
  const normalizedPhone = phone || null;
  const [emailConflict, phoneConflict] = await Promise.all([
    prisma.guestUser.findUnique({ where: { email } }),
    normalizedPhone ? prisma.guestUser.findUnique({ where: { phone: normalizedPhone } }) : null,
  ]);
  if (emailConflict) return { ok: false, error: "Un compte existe déjà avec cet email. Connectez-vous." };
  if (phoneConflict) return { ok: false, error: "Ce numéro est déjà associé à un compte." };
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.guestUser.create({ data: { name, email, passwordHash, phone: normalizedPhone } });
  await prisma.booking.updateMany({ where: { guestEmail: email, guestUserId: null }, data: { guestUserId: user.id } });
  await createGuestSession({ sub: user.id, email: user.email, name: user.name });
  return { ok: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } };
}

export async function guestLogoutAction(locale: string = "fr"): Promise<void> {
  await destroyGuestSession();
  redirect(`/${locale}/compte/connexion`);
}

export async function requestPasswordResetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const locale = String(formData.get("locale") || "fr") as "fr" | "en";
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const resetLimit = rateLimit(`pwd-reset:${ip}`, 3, 15 * 60_000);
  if (!resetLimit.success) return { ok: true, message: "Si un compte existe, un lien de réinitialisation a été envoyé." };
  if (!email) return { ok: false, error: "Veuillez saisir votre adresse e-mail." };

  const user = await prisma.guestUser.findUnique({ where: { email } });
  // Always return success to avoid email enumeration
  if (!user) return { ok: true, message: "Si un compte existe, un lien de réinitialisation a été envoyé." };

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.guestUser.update({
    where: { id: user.id },
    data: { resetToken: tokenHash, resetTokenExpiry: expiry },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mbnriad.com";
  const resetUrl = `${baseUrl}/${locale}/compte/reinitialiser?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    email: passwordResetEmail({ name: user.name, resetUrl }, locale),
  });

  return { ok: true, message: locale === "fr"
    ? "Un lien de réinitialisation a été envoyé à votre adresse e-mail."
    : "A reset link has been sent to your email address." };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");
  const locale = String(formData.get("locale") || "fr") as "fr" | "en";

  if (!email || !token || !password) return { ok: false, error: "Données manquantes." };
  if (password.length < 8) return {
    ok: false,
    error: locale === "fr" ? "Le mot de passe doit contenir au moins 8 caractères." : "Password must be at least 8 characters.",
  };

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const user = await prisma.guestUser.findFirst({
    where: {
      email,
      resetToken: tokenHash,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) return {
    ok: false,
    error: locale === "fr"
      ? "Lien invalide ou expiré. Veuillez refaire une demande."
      : "Invalid or expired link. Please request a new one.",
  };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.guestUser.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  await createGuestSession({ sub: user.id, email: user.email, name: user.name });
  return { ok: true, message: locale === "fr" ? "Mot de passe mis à jour." : "Password updated." };
}
