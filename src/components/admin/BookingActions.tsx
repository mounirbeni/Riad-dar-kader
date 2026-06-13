"use client";

import { useActionState } from "react";
import {
  updateBookingStatusAction,
  sendPreArrivalAction,
} from "@/app/actions/admin";
import { SubmitButton } from "./SubmitButton";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmer" },
  { value: "cancelled", label: "Annuler" },
  { value: "completed", label: "Marquer terminée" },
];

export function BookingActions({
  bookingId,
  status,
  adminNotes,
}: {
  bookingId: string;
  status: string;
  adminNotes: string | null;
}) {
  const [state, formAction] = useActionState(updateBookingStatusAction, {
    ok: false,
  });
  const [preState, preAction] = useActionState(sendPreArrivalAction, {
    ok: false,
  });

  return (
    <div className="card p-5">
      <h2 className="font-serif text-lg text-ink">Gérer la réservation</h2>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="bookingId" value={bookingId} />
        <div>
          <label className="label">Statut</label>
          <select name="status" defaultValue={status} className="input">
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Notes internes</label>
          <textarea
            name="adminNotes"
            rows={3}
            defaultValue={adminNotes || ""}
            className="input"
            placeholder="Non visible par le client"
          />
        </div>
        {state?.message && (
          <p className="text-sm text-green-700">{state.message}</p>
        )}
        {state?.error && <p className="text-sm text-terracotta">{state.error}</p>}
        <SubmitButton className="btn-primary w-full" pendingLabel="Enregistrement…">
          Enregistrer
        </SubmitButton>
      </form>

      <form action={preAction} className="mt-4 border-t border-sand-200 pt-4">
        <input type="hidden" name="bookingId" value={bookingId} />
        <SubmitButton
          className="btn-outline w-full"
          pendingLabel="Envoi…"
        >
          Envoyer le message pré-arrivée
        </SubmitButton>
        {preState?.message && (
          <p className="mt-2 text-sm text-green-700">{preState.message}</p>
        )}
      </form>
    </div>
  );
}
