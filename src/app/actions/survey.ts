"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SurveySchema = z.object({
  riadName: z.string().min(1).max(100),
  ownerName: z.string().min(1).max(100),
  phone: z.string().min(6).max(30),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().min(1).max(80),
  roomCount: z.coerce.number().int().min(1).max(100),
  hasWebsite: z.coerce.boolean(),
  hasOnlineBooking: z.coerce.boolean(),
  currentTools: z.array(z.string()).min(1),
  interest: z.enum(["yes", "maybe", "no"]),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type SurveyState = { success: boolean; error?: string };

export async function submitSurveyAction(
  _prev: SurveyState,
  formData: FormData
): Promise<SurveyState> {
  const raw = {
    riadName: formData.get("riadName"),
    ownerName: formData.get("ownerName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    city: formData.get("city") ?? "Marrakech",
    roomCount: formData.get("roomCount"),
    hasWebsite: formData.get("hasWebsite") === "true",
    hasOnlineBooking: formData.get("hasOnlineBooking") === "true",
    currentTools: formData.getAll("currentTools") as string[],
    interest: formData.get("interest"),
    notes: formData.get("notes") ?? "",
  };

  const parsed = SurveySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Données invalides. Vérifiez le formulaire." };
  }

  const d = parsed.data;

  await prisma.surveyResponse.create({
    data: {
      riadName: d.riadName,
      ownerName: d.ownerName,
      phone: d.phone,
      email: d.email || null,
      city: d.city,
      roomCount: d.roomCount,
      hasWebsite: d.hasWebsite,
      hasOnlineBooking: d.hasOnlineBooking,
      currentTools: d.currentTools,
      interest: d.interest,
      notes: d.notes || null,
    },
  });

  return { success: true };
}
