"use client";

import { useActionState } from "react";
import {
  updateBookingStatusAction,
  sendPreArrivalAction,
} from "@/app/actions/admin";
import { SubmitButton } from "./SubmitButton";
import { IconCheck, IconArrowRight } from "@/components/Icons";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "cancelled", label: "Annulée" },
  { value: "completed", label: "Terminée" },
];

function QuickStatus({
  bookingId,
  target,
  label,
  cls,
}: {
  bookingId: string;
  target: string;
  label: string;
  cls: string;
}) {
  const [state, formAction] = useActionState(updateBookingStatusAction, { ok: false });
  return (
    <form action={formAction} className="flex-1">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={target} />
      <input type="hidden" name="adminNotes" value="" />
      <SubmitButton className={`w-full ${cls}`} pendingLabel="…">
        {label}
      </SubmitButton>
      {state?.message && (
        <p className="mt-1 text-xs text-green-700">{state.message}</p>
      )}
    </form>
  );
}

export function BookingActions({
  bookingId,
  status,
  adminNotes,
}: {
  bookingId: string;
  status: string;
  adminNotes: string | null;
}) {
  const [state, formAction] = useActionState(updateBookingStatusAction, { ok: false });
  const [preState, preAction] = useActionState(sendPreArrivalAction, { ok: false });

  return (
    <div className="space-y-4">
      {/* Quick action buttons — only for pending */}
      {status === "pending" && (
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-700">
            En attente de décision
          </p>
          <div className="flex gap-2">
            <QuickStatus
              bookingId={bookingId}
              target="confirmed"
              label="✓ Confirmer"
              cls="rounded-xl bg-terracotta py-2.5 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
            />
            <QuickStatus
              bookingId={bookingId}
              target="cancelled"
              label="✗ Annuler"
              cls="rounded-xl border border-red-200 bg-white py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            />
          </div>
        </div>
      )}

      {/* Full status + notes */}
      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
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
              className="input resize-none"
              placeholder="Non visible par le client"
            />
          </div>
          {state?.message && (
            <p className="flex items-center gap-1.5 text-sm text-green-700">
              <IconCheck size={13} />
              {state.message}
            </p>
          )}
          {state?.error && (
            <p className="text-sm text-terracotta">{state.error}</p>
          )}
          <SubmitButton className="btn-primary w-full" pendingLabel="Enregistrement…">
            Enregistrer les modifications
          </SubmitButton>
        </form>
      </div>

      {/* Communications */}
      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-ink">Communications</h3>
        <form action={preAction} className="mt-3">
          <input type="hidden" name="bookingId" value={bookingId} />
          <SubmitButton
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-sand-200 px-4 py-2.5 text-sm font-medium text-ink transition hover:border-terracotta/30 hover:text-terracotta"
            pendingLabel="Envoi en cours…"
          >
            <IconArrowRight size={13} />
            Envoyer le message pré-arrivée
          </SubmitButton>
          {preState?.message && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-green-700">
              <IconCheck size={13} />
              {preState.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
