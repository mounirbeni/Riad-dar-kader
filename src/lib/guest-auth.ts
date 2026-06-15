import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "rdk_guest_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) throw new Error("AUTH_SECRET missing");
  return new TextEncoder().encode(value);
}

export type GuestSessionPayload = {
  sub: string; // guest user id
  email: string;
  name: string;
};

export async function createGuestSession(payload: GuestSessionPayload): Promise<void> {
  const token = await new SignJWT({ email: payload.email, name: payload.name, type: "guest" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroyGuestSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getGuestSession(): Promise<GuestSessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || payload["type"] !== "guest") return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

export async function requireGuestSession(): Promise<GuestSessionPayload> {
  const session = await getGuestSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function authenticateGuest(email: string, password: string): Promise<GuestSessionPayload | null> {
  const user = await prisma.guestUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    await bcrypt.compare(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { sub: user.id, email: user.email, name: user.name };
}

export async function registerGuest(
  email: string,
  password: string,
  name: string
): Promise<{ ok: true } | { error: "email_taken" | "invalid_input" }> {
  if (!email || !password || !name) return { error: "invalid_input" };
  try {
    const existing = await prisma.guestUser.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) return { error: "email_taken" };

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.guestUser.create({
      data: { email: email.toLowerCase(), passwordHash, name },
    });
    await createGuestSession({ sub: user.id, email: user.email, name: user.name ?? "" });
    return { ok: true };
  } catch {
    return { error: "invalid_input" };
  }
}

export async function loginGuest(
  email: string,
  password: string
): Promise<{ ok: true } | { error: "invalid_credentials" }> {
  const user = await prisma.guestUser.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    await bcrypt.compare(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    return { error: "invalid_credentials" };
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "invalid_credentials" };
  await createGuestSession({ sub: user.id, email: user.email, name: user.name ?? "" });
  return { ok: true };
}
