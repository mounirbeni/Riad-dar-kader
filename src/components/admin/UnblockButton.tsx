"use client";

import { useActionState } from "react";
import { unblockDateAction } from "@/app/actions/admin";
import { SubmitButton } from "./SubmitButton";

export function UnblockButton({ id }: { id: string }) {
  const [, formAction] = useActionState(unblockDateAction, { ok: false });
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        className="text-xs text-terracotta hover:underline"
        pendingLabel="…"
      >
        Débloquer
      </SubmitButton>
    </form>
  );
}
