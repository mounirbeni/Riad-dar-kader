"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/admin";
import { SubmitButton } from "./SubmitButton";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, { ok: false });

  return (
    <form action={formAction} className="card space-y-4 p-7">
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="input"
        />
      </div>
      {state?.error && <p className="text-sm text-terracotta">{state.error}</p>}
      <SubmitButton className="btn-primary w-full" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
    </form>
  );
}
