import { SurveyForm } from "./SurveyForm";

export const metadata = {
  title: "Sondage — Propriétaires de Riads",
  description: "Partagez vos besoins en matière de réservation en ligne pour votre riad.",
  robots: "noindex",
};

export default function SondagePage() {
  return (
    <div className="min-h-screen bg-[#FDFAF7] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta" aria-hidden="true">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-[#2C1A0E]">Sondage Propriétaires</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#7A6652]">
            Aidez-nous à mieux comprendre vos besoins en réservation en ligne.
            <br />2 minutes suffisent.
          </p>
        </div>

        <SurveyForm />
      </div>
    </div>
  );
}
