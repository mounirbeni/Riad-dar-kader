"use client";

import { useActionState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/guest";
import { AuthShell } from "@/components/guest/AuthShell";

const INIT = { ok: false as const, error: "" };

const inputCls =
  "w-full rounded-xl border border-sand-200 bg-white pl-10 pr-4 py-3 text-sm text-ink placeholder:text-muted/40 transition focus:border-terracotta/40 focus:outline-none focus:ring-2 focus:ring-terracotta/15";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = String(params?.locale || "fr");
  const fr = locale !== "en";
  const [state, action, pending] = useActionState(requestPasswordResetAction, INIT);

  if (state.ok) {
    return (
      <AuthShell locale={locale}>
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-ink">
            {fr ? "E-mail envoyé" : "Email sent"}
          </h1>
          <p className="text-sm text-muted">{state.message}</p>
          <Link
            href={`/${locale}/compte/connexion`}
            className="inline-block mt-4 text-sm font-semibold text-terracotta hover:underline"
          >
            {fr ? "Retour à la connexion" : "Back to login"}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell locale={locale}>
      <div>
        <h1 className="font-serif text-3xl text-ink">
          {fr ? "Mot de passe oublié" : "Forgot password"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {fr
            ? "Saisissez votre e-mail pour recevoir un lien de réinitialisation."
            : "Enter your email to receive a reset link."}
        </p>

        <form action={action} className="mt-8 space-y-5">
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-1.5">
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70"
              htmlFor="reset-email"
            >
              {fr ? "Adresse e-mail" : "Email address"}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                id="reset-email"
                type="email"
                name="email"
                required
                autoFocus
                className={inputCls}
                placeholder={fr ? "votre@email.com" : "your@email.com"}
              />
            </div>
          </div>

          {state.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-red-500" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <p className="text-xs text-red-600">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-terracotta px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-terracotta/90 disabled:opacity-60"
          >
            {pending
              ? (fr ? "Envoi…" : "Sending…")
              : (fr ? "Envoyer le lien" : "Send reset link")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href={`/${locale}/compte/connexion`}
            className="text-sm text-muted transition hover:text-terracotta"
          >
            {fr ? "← Retour à la connexion" : "← Back to login"}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
