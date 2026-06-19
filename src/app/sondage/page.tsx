import type { Metadata } from "next";
import { SurveyForm } from "@/components/SurveyForm";

export const metadata: Metadata = {
  title: "Sondage — Plateforme de gestion de Riad",
  robots: { index: false, follow: false },
};

export default function StandaloneSurveyPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] py-10 px-4">
      <div className="max-w-xl mx-auto pb-16">
        <SurveyForm />
      </div>
    </div>
  );
}
