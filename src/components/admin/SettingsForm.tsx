"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/app/actions/admin";
import { SubmitButton } from "./SubmitButton";

export function SettingsForm({
  holdPending,
  minNights,
}: {
  holdPending: boolean;
  minNights: number;
}) {
  const [state, formAction] = useActionState(saveSettingsAction, { ok: false });

  return (
    <form action={formAction} className="card max-w-xl space-y-5 p-6">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="hold_pending_availability"
          defaultChecked={holdPending}
          className="mt-1 h-4 w-4 accent-terracotta"
        />
        <span>
          <span className="block text-sm font-medium text-ink">
            Les demandes en attente réservent la disponibilité
          </span>
          <span className="block text-xs text-muted">
            Si activé, une demande en attente bloque les chambres jusqu'à votre
            décision. Sinon, seules les réservations confirmées bloquent les dates.
          </span>
        </span>
      </label>

      <div>
        <label className="label">Nombre de nuits minimum</label>
        <input
          name="min_nights"
          type="number"
          min={1}
          max={30}
          defaultValue={minNights}
          className="input max-w-[120px]"
        />
      </div>

      {state?.message && <p className="text-sm text-green-700">{state.message}</p>}
      <SubmitButton className="btn-primary" pendingLabel="Enregistrement…">
        Enregistrer les paramètres
      </SubmitButton>
    </form>
  );
}
