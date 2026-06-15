import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed-core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// One-time (idempotent) database bootstrap.
// Protected by SEED_SECRET — pass it via the x-seed-secret header only.
// Usage: curl -H "x-seed-secret: YOUR_SEED_SECRET" https://yourdomain.com/api/seed
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED_IN_PRODUCTION !== "true") {
    return NextResponse.json({ ok: false, error: "Not available in production." }, { status: 403 });
  }

  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "SEED_SECRET is not configured." },
      { status: 503 }
    );
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

  try {
    const summary = await runSeed(prisma);
    return NextResponse.json({ ok: true, ...summary });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Seed failed" },
      { status: 500 }
    );
  }
}
