"use client";

import { useActionState, useState } from "react";
import { clearAllDataAction } from "@/app/actions/admin";

const initial = { ok: false as boolean, error: undefined as string | undefined, message: undefined as string | undefined };

export function DangerZone() {
  const [state, formAction, pending] = useActionState(clearAllDataAction, initial);
  const [confirm, setConfirm] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="font-semibold text-red-700 mb-1">Zone de danger</h2>
      <p className="text-sm text-red-600/80 mb-4">
        Supprime toutes les réservations, réservations de chambres, extras commandés et dates bloquées.
        Les chambres, extras, paramètres et votre compte admin sont conservés.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          Effacer toutes les données de test
        </button>
      ) : (
        <form action={formAction} className="space-y-3">
          <p className="text-sm font-medium text-red-700">
            Tapez <code className="rounded bg-red-100 px-1 font-mono">EFFACER</code> pour confirmer :
          </p>
          <input
            name="confirm"
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="EFFACER"
            className="rounded-xl border border-red-300 px-3 py-2 text-sm font-mono w-full focus:outline-none focus:ring-2 focus:ring-red-400/50 bg-white"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={confirm !== "EFFACER" || pending}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-red-700 transition-colors"
            >
              {pending ? "Suppression…" : "Confirmer la suppression"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setConfirm(""); }}
              className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              Annuler
            </button>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.ok && state.message && <p className="text-sm text-emerald-700">{state.message}</p>}
        </form>
      )}
    </div>
  );
}
