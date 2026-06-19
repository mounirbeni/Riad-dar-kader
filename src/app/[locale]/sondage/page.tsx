import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { SurveyForm } from "@/components/SurveyForm";

export const metadata: Metadata = {
  title: "Sondage — Plateforme Riad",
  description: "Aidez-nous à créer l'outil de gestion idéal pour votre riad.",
  robots: { index: false, follow: false },
};

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-sand py-10 px-4">
      <div className="max-w-xl mx-auto pb-20">
        <SurveyForm locale={locale as Locale} />
      </div>
    </div>
  );
}
