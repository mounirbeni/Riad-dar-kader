"use client";

import { useActionState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { resetPasswordAction } from "@/app/actions/guest";

const INIT = { ok: false as const, error: "" };

export default function ResetPasswordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = String(params?.locale || "fr");
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [state, action, pending] = useActionState(resetPasswordAction, INIT);

  useEffect(() => {
    if (state.ok) {
      setTimeout(() => router.push(`/${locale}/compte`), 1500);
    }
  }, [state.ok, locale, router]);

  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted">{locale === "fr" ? "Lien invalide." : "Invalid link."}</p>
          <Link href={`/${locale}/compte/mot-de-passe-oublie`} className="text-sm text-terracotta hover:underline">
            {locale === "fr" ? "Faire une nouvelle demande" : "Request a new link"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl text-ink">
            {locale === "fr" ? "Nouveau mot de passe" : "New password"}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {locale === "fr" ? "Choisissez un nouveau mot de passe sécurisé" : "Choose a new secure password"}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-7">
          {state.ok ? (
            <div className="text-center space-y-2 py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="font-medium text-ink">{state.message}</p>
              <p className="text-xs text-muted">{locale === "fr" ? "Redirection en cours…" : "Redirecting…"}</p>
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="locale" value={locale} />
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  {locale === "fr" ? "Nouveau mot de passe" : "New password"}
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  autoFocus
                  className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  placeholder={locale === "fr" ? "8 caractères minimum" : "8 characters minimum"}
                />
              </div>
              {state.error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{state.error}</p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-terracotta px-4 py-3 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors disabled:opacity-50"
              >
                {pending
                  ? (locale === "fr" ? "Mise à jour…" : "Updating…")
                  : (locale === "fr" ? "Mettre à jour le mot de passe" : "Update password")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
