"use client";

import { useActionState } from "react";
import { guestLoginAction } from "@/app/actions/guest";
import { dictionaries } from "@/i18n/dictionaries";

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

export function GuestLoginForm({ locale }: { locale: string }) {
  const [state, formAction, pending] = useActionState(guestLoginAction, {
    ok: false,
  });
  const t = dictionaries[locale === "en" ? "en" : "fr"].account;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />

      {/* Email */}
      <div className="space-y-1.5">
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70"
          htmlFor="login-email"
        >
          Email
        </label>
        <FieldWrap>
          <FieldIcon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </FieldIcon>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputCls}
            placeholder={t.emailPlaceholder}
          />
        </FieldWrap>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted/70"
          htmlFor="login-password"
        >
          {t.password}
        </label>
        <FieldWrap>
          <FieldIcon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </FieldIcon>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputCls}
            placeholder="••••••••"
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

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-terracotta px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t.signingIn}
          </span>
        ) : (
          t.signIn
        )}
      </button>
    </form>
  );
}
