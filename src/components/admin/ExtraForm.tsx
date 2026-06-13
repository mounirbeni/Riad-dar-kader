"use client";

import { useActionState } from "react";
import { saveExtraAction } from "@/app/actions/admin";
import { SubmitButton } from "./SubmitButton";

export type ExtraFormData = {
  id: string;
  slug: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  price: number;
  priceType: string;
  isActive: boolean;
  sortOrder: number;
};

export function ExtraForm({ extra }: { extra?: ExtraFormData }) {
  const [state, formAction] = useActionState(saveExtraAction, { ok: false });

  return (
    <form action={formAction} className="card space-y-3 p-5">
      {extra && <input type="hidden" name="id" value={extra.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Nom (FR)</label>
          <input name="nameFr" required defaultValue={extra?.nameFr} className="input" />
        </div>
        <div>
          <label className="label">Nom (EN)</label>
          <input name="name" required defaultValue={extra?.name} className="input" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Description (FR)</label>
          <textarea
            name="descriptionFr"
            rows={2}
            defaultValue={extra?.descriptionFr}
            className="input"
          />
        </div>
        <div>
          <label className="label">Description (EN)</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={extra?.description}
            className="input"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="label">Slug</label>
          <input name="slug" required defaultValue={extra?.slug} className="input" />
        </div>
        <div>
          <label className="label">Prix (MAD)</label>
          <input
            name="price"
            type="number"
            min={0}
            required
            defaultValue={extra?.price ?? 0}
            className="input"
          />
        </div>
        <div>
          <label className="label">Type</label>
          <select
            name="priceType"
            defaultValue={extra?.priceType ?? "per_booking"}
            className="input"
          >
            <option value="per_booking">Par séjour</option>
            <option value="per_guest">Par personne</option>
            <option value="per_night">Par nuit</option>
          </select>
        </div>
        <div>
          <label className="label">Ordre</label>
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={extra?.sortOrder ?? 0}
            className="input"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={extra?.isActive ?? true}
          className="h-4 w-4 accent-terracotta"
        />
        Extra activé
      </label>
      {state?.message && <p className="text-sm text-green-700">{state.message}</p>}
      {state?.error && <p className="text-sm text-terracotta">{state.error}</p>}
      <SubmitButton className="btn-primary" pendingLabel="…">
        {extra ? "Enregistrer" : "Ajouter l'extra"}
      </SubmitButton>
    </form>
  );
}
