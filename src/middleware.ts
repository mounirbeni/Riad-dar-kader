import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function makeSecret(value?: string): Uint8Array {
  return new TextEncoder().encode(value ?? "");
}

async function verifyJwt(token: string, secret: Uint8Array, type: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload["type"] === type && !!payload.sub;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes (/admin/**) except the login page ──────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("rdk_admin_session")?.value;
    const valid = token
      ? await verifyJwt(token, makeSecret(process.env.AUTH_SECRET), "admin")
      : false;

    if (!valid) {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      if (token) res.cookies.delete("rdk_admin_session");
      return res;
    }
  }

  // ── Guest account routes (/:locale/compte/**) ────────────────────────────
  const compteMatch = pathname.match(/^\/([a-z]{2})\/compte(\/|$)/);
  if (compteMatch) {
    const token = request.cookies.get("rdk_guest_session")?.value;
    const valid = token
      ? await verifyJwt(token, makeSecret(process.env.AUTH_SECRET), "guest")
      : false;

    if (!valid) {
      const locale = compteMatch[1];
      const res = NextResponse.redirect(
        new URL(`/${locale}/connexion?next=${encodeURIComponent(pathname)}`, request.url)
      );
      if (token) res.cookies.delete("rdk_guest_session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/:locale/compte/:path*"],
};
