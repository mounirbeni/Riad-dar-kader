"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/guest-auth";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export function LoginForm({
  locale,
  returnTo,
}: {
  locale: Locale;
  returnTo: string;
}) {
  const dict = getDictionary(locale);
  const t = dict.auth;

  const [state, action, pending] = useActionState(loginAction, { error: null });

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="bg-gradient-to-br from-terracotta to-terracotta-dark px-8 py-10 text-center text-white">
            <h1 className="font-serif text-3xl">{t.loginTitle}</h1>
          </div>

          <div className="p-8">
            {state.error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-terracotta/5 px-4 py-3 text-sm text-terracotta">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-xs font-bold">!</span>
                {(t.errors as Record<string, string>)[state.error] ?? state.error}
              </div>
            )}

            <form action={action} className="space-y-4">
              <input type="hidden" name="returnTo" value={returnTo} />

              <div>
                <label className="label">{t.email}</label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input"
                />
              </div>

              <div>
                <label className="label">{t.password}</label>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="btn-primary w-full py-3 disabled:opacity-60"
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t.loginSubmit}
                  </span>
                ) : (
                  t.loginSubmit
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              {t.noAccount}{" "}
              <Link
                href={`/${locale}/inscription?returnTo=${encodeURIComponent(returnTo)}`}
                className="font-medium text-terracotta hover:underline"
              >
                {t.register}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
