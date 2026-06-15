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

  const existing = await prisma.guestUser.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "Un compte existe déjà avec cet email." };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.guestUser.create({
    data: { name, email, passwordHash, phone: phone || null, country: country || null },
  });

  // Link any existing bookings made with this email
  await prisma.booking.updateMany({
    where: { guestEmail: email, guestUserId: null },
    data: { guestUserId: user.id },
  });

  await createGuestSession({ sub: user.id, email: user.email, name: user.name });
  redirect(`/${locale}/compte`);
}

export async function guestLogoutAction(locale: string = "fr"): Promise<void> {
  await destroyGuestSession();
  redirect(`/${locale}/compte/connexion`);
}
