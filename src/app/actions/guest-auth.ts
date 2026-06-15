"use server";

import { redirect } from "next/navigation";
import { loginGuest, registerGuest, destroyGuestSession } from "@/lib/guest-auth";

export type GuestAuthState = { error: string | null };

export async function loginAction(
  _state: GuestAuthState,
  formData: FormData
): Promise<GuestAuthState> {
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const returnTo = (formData.get("returnTo") as string) || "/";

  const result = await loginGuest(email, password);
  if ("error" in result) return { error: result.error };
  redirect(returnTo);
}

export async function registerAction(
  _state: GuestAuthState,
  formData: FormData
): Promise<GuestAuthState> {
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const firstName = (formData.get("firstName") as string) ?? "";
  const returnTo = (formData.get("returnTo") as string) || "/";

  const result = await registerGuest(email, password, firstName);
  if ("error" in result) return { error: result.error };
  redirect(returnTo);
}

export async function logoutAction(formData: FormData): Promise<never> {
  const returnTo = (formData.get("returnTo") as string) || "/";
  await destroyGuestSession();
  redirect(returnTo);
}
