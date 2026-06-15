"use client";

import { useActionState } from "react";
import { guestLoginAction } from "@/app/actions/guest";
import { dictionaries } from "@/i18n/dictionaries";

export function GuestLoginForm({ locale }: { locale: string }) {
  const [state, formAction, pending] = useActionState(guestLoginAction, { ok: false });
  const t = dictionaries[locale === "en" ? "en" : "fr"].account;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-terracotta/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          placeholder={t.emailPlaceholder}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="password">
          {t.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-terracotta/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          placeholder="••••••••"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-terracotta px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-terracotta/90 disabled:opacity-60 transition-colors"
      >
        {pending ? t.signingIn : t.signIn}
      </button>
    </form>
  );
}
