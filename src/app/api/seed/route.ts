import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed-core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// One-time (idempotent) database bootstrap.
// Protected by SEED_SECRET — without a matching secret the route refuses.
// Usage: GET /api/seed?secret=YOUR_SEED_SECRET
export async function GET(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "SEED_SECRET is not configured." },
      { status: 503 }
    );
  }

  const provided =
    new URL(request.url).searchParams.get("secret") ||
    request.headers.get("x-seed-secret");

  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runSeed(prisma);
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Seed failed" },
      { status: 500 }
    );
  }
}
