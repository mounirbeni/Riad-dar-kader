"use client";

import { useActionState, useState } from "react";
import { guestSignupAction } from "@/app/actions/guest";
import { dictionaries } from "@/i18n/dictionaries";
import { ConsentCheckbox } from "@/components/guest/ConsentCheckbox";

function FieldWrap({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted/60">
      {children}
    </span>
  );
}

const inputCls =
  "w-full rounded-xl border border-sand-200 bg-white pl-10 pr-4 py-3 text-sm text-ink placeholder:text-muted/40 transition focus:border-terracotta/40 focus:outline-none focus:ring-2 focus:ring-terracotta/15";

export function GuestSignupForm({ locale }: { locale: string }) {
  const [state, formAction, pending] = useActionState(guestSignupAction, {
    ok: false,
  });
  const [consent, setConsent] = useState(false);
  const t = dictionaries[locale === "en" ? "en" : "fr"].account;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />

      {/* Full name */}
      <div className="space-y-1.5">
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70"
          htmlFor="signup-name"
        >
          {t.fullName} <span className="text-terracotta">*</span>
        </label>
        <FieldWrap>
          <FieldIcon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </FieldIcon>
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputCls}
            placeholder={t.yourName}
          />
        </FieldWrap>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70"
          htmlFor="signup-email"
        >
          Email <span className="text-terracotta">*</span>
        </label>
        <FieldWrap>
          <FieldIcon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </FieldIcon>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputCls}
            placeholder={t.emailPlaceholder}
          />
        </FieldWrap>
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70"
          htmlFor="signup-phone"
        >
          {t.phone}
        </label>
        <FieldWrap>
          <FieldIcon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </FieldIcon>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputCls}
            placeholder="+33 6 00 00 00 00"
          />
        </FieldWrap>
      </div>

      {/* Country */}
      <div className="space-y-1.5">
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70"
          htmlFor="signup-country"
        >
          {t.country}
        </label>
        <FieldWrap>
          <FieldIcon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </FieldIcon>
          <input
            id="signup-country"
            name="country"
            type="text"
            autoComplete="country-name"
            className={inputCls}
            placeholder="France"
          />
        </FieldWrap>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70"
          htmlFor="signup-password"
        >
          {t.password} <span className="text-terracotta">*</span>
        </label>
        <FieldWrap>
          <FieldIcon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </FieldIcon>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputCls}
            placeholder={t.passwordMin}
          />
        </FieldWrap>
      </div>

      {/* Error */}
      {state?.error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-red-500" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <p className="text-xs text-red-600">{state.error}</p>
        </div>
      )}

      <ConsentCheckbox locale={locale} checked={consent} onChange={setConsent} />

      {/* Submit */}
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
            {t.creatingAccount}
          </span>
        ) : (
          t.createMyAccount
        )}
      </button>
    </form>
  );
}
