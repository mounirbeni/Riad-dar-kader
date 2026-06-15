"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authenticateGuest, createGuestSession, destroyGuestSession } from "@/lib/guest-auth";

type ActionState = { ok: boolean; error?: string };

export async function guestLoginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const locale = String(formData.get("locale") || "fr");

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
