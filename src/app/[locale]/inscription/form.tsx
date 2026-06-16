"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/guest-auth";
import { getDictionary } from "@/i18n/dictionaries";
import { ConsentCheckbox } from "@/components/guest/ConsentCheckbox";
import { AuthShell } from "@/components/guest/AuthShell";
import type { Locale } from "@/i18n/config";

const inputCls =
  "w-full rounded-xl border border-sand-200 bg-white pl-10 pr-4 py-3 text-sm text-ink placeholder:text-muted/40 transition focus:border-terracotta/40 focus:outline-none focus:ring-2 focus:ring-terracotta/15";

export function RegisterForm({
  locale,
  returnTo,
}: {
  locale: Locale;
  returnTo: string;
}) {
  const dict = getDictionary(locale);
  const t = dict.auth;
  const fr = locale !== "en";

  const [state, action, pending] = useActionState(registerAction, { error: null });
  const [consent, setConsent] = useState(false);

  return (
    <AuthShell locale={locale}>
      <div>
        <h1 className="font-serif text-3xl text-ink">{t.registerTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {fr
            ? "Créez votre compte pour suivre vos réservations."
            : "Create your account to track your bookings."}
        </p>

        <div className="mt-8">
          {state.error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-red-500" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <p className="text-xs text-red-600">
                {(t.errors as Record<string, string>)[state.error] ?? state.error}
              </p>
            </div>
          )}

          <form action={action} className="space-y-4">
            <input type="hidden" name="returnTo" value={returnTo} />

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                {t.firstName}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted/60">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="given-name"
                  className={inputCls}
                  placeholder={fr ? "Votre prénom" : "Your first name"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                {t.email}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted/60">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputCls}
                  placeholder={fr ? "votre@email.com" : "your@email.com"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                {t.password}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted/60">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputCls}
                  placeholder={fr ? "8 caractères minimum" : "8 characters minimum"}
                />
              </div>
            </div>

            <ConsentCheckbox locale={locale} checked={consent} onChange={setConsent} />

            <button
              type="submit"
              disabled={pending || !consent}
              className="w-full rounded-xl bg-terracotta px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.registerSubmit}
                </span>
              ) : t.registerSubmit}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted">
            {t.hasAccount}{" "}
            <Link
              href={`/${locale}/connexion?returnTo=${encodeURIComponent(returnTo)}`}
              className="font-semibold text-terracotta hover:underline"
            >
              {t.login}
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
