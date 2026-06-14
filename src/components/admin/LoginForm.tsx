"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/admin";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ dark }: { dark?: boolean }) {
  const [state, formAction] = useActionState(loginAction, { ok: false });

  const labelCls = dark ? "mb-1.5 block text-sm font-medium text-white/70" : "label";
  const inputCls = dark
    ? "mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-terracotta/60 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
    : "input";

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </div>
      {state?.error && (
        <p className={`text-sm ${dark ? "text-terracotta" : "text-terracotta"}`}>{state.error}</p>
      )}
      <SubmitButton
        className={dark ? "mt-2 w-full rounded-xl bg-terracotta px-4 py-3 text-sm font-semibold text-white shadow-md shadow-terracotta/30 transition hover:bg-terracotta-dark disabled:opacity-60" : "btn-primary w-full"}
        pendingLabel="Connexion…"
      >
        Se connecter
      </SubmitButton>
    </form>
  );
}
