"use client";

import { useActionState } from "react";
import { blockDatesAction } from "@/app/actions/admin";
import { SubmitButton } from "./SubmitButton";

export function BlockDatesForm({
  rooms,
}: {
  rooms: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(blockDatesAction, { ok: false });

  return (
    <form action={formAction} className="card space-y-4 p-5">
      <h2 className="font-serif text-lg text-ink">Bloquer des dates</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Du</label>
          <input name="from" type="date" required className="input" />
        </div>
        <div>
          <label className="label">Au (inclus)</label>
          <input name="to" type="date" required className="input" />
        </div>
      </div>
      <div>
        <label className="label">Portée</label>
        <select name="roomId" defaultValue="" className="input">
          <option value="">Tout le riad</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Raison (optionnel)</label>
        <input name="reason" className="input" placeholder="Maintenance, congé…" />
      </div>
      {state?.message && <p className="text-sm text-green-700">{state.message}</p>}
      {state?.error && <p className="text-sm text-terracotta">{state.error}</p>}
      <SubmitButton className="btn-primary w-full" pendingLabel="Blocage…">
        Bloquer ces dates
      </SubmitButton>
    </form>
  );
}
