"use client";

import { useActionState } from "react";
import { guestSignupAction } from "@/app/actions/guest";
import { dictionaries } from "@/i18n/dictionaries";

export function GuestSignupForm({ locale }: { locale: string }) {
  const [state, formAction, pending] = useActionState(guestSignupAction, { ok: false });
  const t = dictionaries[locale === "en" ? "en" : "fr"].account;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="name">
          {t.fullName} <span className="text-terracotta">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-terracotta/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          placeholder={t.yourName}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="email">
          Email <span className="text-terracotta">*</span>
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
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="phone">
          {t.phone}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-terracotta/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          placeholder="+33 6 00 00 00 00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="country">
          {t.country}
        </label>
        <input
          id="country"
          name="country"
          type="text"
          autoComplete="country-name"
          className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-terracotta/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          placeholder="France"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="password">
          {t.password} <span className="text-terracotta">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-terracotta/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          placeholder={t.passwordMin}
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
        {pending ? t.creatingAccount : t.createMyAccount}
      </button>
    </form>
  );
}
