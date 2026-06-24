"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SurveyData = {
  riadName: string; city: string; roomCount: string; yearsOpen: string;
  bookingMethods: string[]; hasWebsite: string; platforms: string[];
  directPct: string; occupancyRate: string;
  challenges: string[]; adminTimeDay: string; lostBookings: string; biggestStress: string;
  wantedFeatures: string[]; techComfort: string; wantsArabic: string; usesSmartphone: string;
  currentlyPays: string; currentAmount: string; willingToPay: string;
  payPreference: string; commissionOk: string;
  wantsDemo: boolean; contactName: string; contactWa: string; comments: string;
  locale: string;
};

export async function submitSurveyAction(data: SurveyData) {
  await prisma.surveyResponse.create({
    data: {
      ...data,
      currentAmount: data.currentAmount || null,
      contactName: data.contactName || null,
      contactWa: data.contactWa || null,
      comments: data.comments || null,
    },
  });
  revalidatePath("/admin/surveys");
}
