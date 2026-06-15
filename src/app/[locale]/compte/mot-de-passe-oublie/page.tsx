"use client";

import { useActionState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/guest";

const INIT = { ok: false as const, error: "" };

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = String(params?.locale || "fr");
  const [state, action, pending] = useActionState(requestPasswordResetAction, INIT);

  if (state.ok) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91A16 16 0 0016 17.91l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0124 18.92z"/>
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-ink">{locale === "fr" ? "E-mail envoyé" : "Email sent"}</h1>
          <p className="text-sm text-muted">{state.message}</p>
          <Link href={`/${locale}/compte/connexion`} className="inline-block mt-4 text-sm font-medium text-terracotta hover:underline">
            {locale === "fr" ? "Retour à la connexion" : "Back to login"}
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
            {locale === "fr" ? "Mot de passe oublié" : "Forgot password"}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {locale === "fr"
              ? "Saisissez votre e-mail pour recevoir un lien de réinitialisation"
              : "Enter your email to receive a reset link"}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-7">
          <form action={action} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                {locale === "fr" ? "Adresse e-mail" : "Email address"}
              </label>
              <input
                type="email"
                name="email"
                required
                autoFocus
                className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                placeholder={locale === "fr" ? "votre@email.com" : "your@email.com"}
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
                ? (locale === "fr" ? "Envoi…" : "Sending…")
                : (locale === "fr" ? "Envoyer le lien" : "Send reset link")}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-sand-200 text-center">
            <Link href={`/${locale}/compte/connexion`} className="text-sm text-muted hover:text-terracotta transition-colors">
              {locale === "fr" ? "← Retour à la connexion" : "← Back to login"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
