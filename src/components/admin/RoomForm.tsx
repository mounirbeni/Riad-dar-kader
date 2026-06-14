"use client";

import { useActionState } from "react";
import { saveRoomAction, deleteRoomAction } from "@/app/actions/admin";
import { SubmitButton } from "./SubmitButton";

export type RoomFormData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  capacity: number;
  basePrice: number;
  isActive: boolean;
  sortOrder: number;
};

export function RoomForm({ room }: { room?: RoomFormData }) {
  const [state, formAction] = useActionState(saveRoomAction, { ok: false });
  const [delState, delAction] = useActionState(deleteRoomAction, { ok: false });

  return (
    <div className="card p-5">
      <form action={formAction} className="space-y-3">
        {room && <input type="hidden" name="id" value={room.id} />}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Nom</label>
            <input name="name" required defaultValue={room?.name} className="input" />
          </div>
          <div>
            <label className="label">Slug</label>
            <input name="slug" required defaultValue={room?.slug} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={room?.description}
            className="input"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label">Capacité</label>
            <input
              name="capacity"
              type="number"
              min={1}
              max={12}
              required
              defaultValue={room?.capacity ?? 2}
              className="input"
            />
          </div>
          <div>
            <label className="label">Prix / nuit (€)</label>
            <input
              name="basePrice"
              type="number"
              min={0}
              required
              defaultValue={room?.basePrice ?? 900}
              className="input"
            />
          </div>
          <div>
            <label className="label">Ordre</label>
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={room?.sortOrder ?? 0}
              className="input"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={room?.isActive ?? true}
            className="h-4 w-4 accent-terracotta"
          />
          Chambre active
        </label>
        {state?.message && <p className="text-sm text-green-700">{state.message}</p>}
        {state?.error && <p className="text-sm text-terracotta">{state.error}</p>}
        <div className="flex gap-2">
          <SubmitButton className="btn-primary" pendingLabel="…">
            {room ? "Enregistrer" : "Ajouter la chambre"}
          </SubmitButton>
        </div>
      </form>

      {room && (
        <form action={delAction} className="mt-3 border-t border-sand-200 pt-3">
          <input type="hidden" name="id" value={room.id} />
          <SubmitButton
            className="text-sm text-terracotta hover:underline"
            pendingLabel="Suppression…"
          >
            Supprimer cette chambre
          </SubmitButton>
          {delState?.error && (
            <p className="text-sm text-terracotta">{delState.error}</p>
          )}
        </form>
      )}
    </div>
  );
}
