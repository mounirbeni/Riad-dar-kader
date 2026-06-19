import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { SurveyForm } from "@/components/SurveyForm";

export const metadata: Metadata = {
  title: "Sondage — Plateforme de gestion de Riad",
  robots: { index: false, follow: false },
};

export default async function StandaloneSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale: Locale = lang === "en" ? "en" : "fr";

  return (
    <div className="min-h-screen bg-[#F7F4EF] py-10 px-4">
      <div className="max-w-xl mx-auto pb-16">
        <SurveyForm locale={locale} />
      </div>
    </div>
  );
}
