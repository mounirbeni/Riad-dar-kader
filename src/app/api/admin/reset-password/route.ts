import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Reset the admin password. Protected by SEED_SECRET.
// POST /api/admin/reset-password
// Headers: x-seed-secret: YOUR_SEED_SECRET
// Body: { "email": "...", "password": "..." }
export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "SEED_SECRET not configured." }, { status: 503 });
  }

  const provided = request.headers.get("x-seed-secret") ?? "";
  let authorized = false;
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(secret);
    authorized = a.length === b.length && timingSafeEqual(a, b);
  } catch {
    authorized = false;
  }
  if (!authorized) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const email = (body.email as string | undefined)?.toLowerCase().trim();
  const password = body.password as string | undefined;

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Provide email and password (min 8 chars)." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Owner", role: "owner" },
  });

  return NextResponse.json({ ok: true, email: user.email });
}
