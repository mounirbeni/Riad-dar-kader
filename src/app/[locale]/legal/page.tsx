import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { POLICIES, CONTACT_EMAIL } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Informations légales — Mbn Demo Riad" : "Legal Information — Mbn Demo Riad",
    robots: { index: false },
  };
}

const DESCRIPTIONS: Record<string, { fr: string; en: string }> = {
  privacy: {
    fr: "Comment nous collectons, utilisons et protégeons vos données personnelles.",
    en: "How we collect, use and protect your personal data.",
  },
  terms: {
    fr: "Les règles d'utilisation du site et nos engagements réciproques.",
    en: "The rules for using the site and our mutual commitments.",
  },
  booking: {
    fr: "Le déroulement d'une réservation, du paiement à l'arrivée.",
    en: "How a booking works, from payment to check-in.",
  },
  cancellation: {
    fr: "Délais, frais éventuels et modalités de remboursement.",
    en: "Deadlines, any fees and refund arrangements.",
  },
  cookies: {
    fr: "Les cookies utilisés sur le site et comment les gérer.",
    en: "The cookies used on the site and how to manage them.",
  },
};

export default async function LegalIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const fr = locale === "fr";

  return (
    <main className="container-page max-w-3xl py-16 lg:py-24">
      <h1 className="font-serif text-3xl text-ink sm:text-4xl">
        {fr ? "Informations légales" : "Legal Information"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {fr
          ? "Retrouvez ci-dessous l'ensemble des documents légaux du Mbn Demo Riad. Chaque document est consultable sur sa propre page."
          : "Find below all the legal documents of Mbn Demo Riad. Each document can be consulted on its own page."}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {POLICIES.map((p) => (
          <Link
            key={p.slug}
            href={`/${locale}/legal/${p.slug}`}
            className="group rounded-2xl border border-sand-200 bg-white p-6 transition hover:border-terracotta/40 hover:shadow-soft"
          >
            <h2 className="font-serif text-lg text-ink group-hover:text-terracotta">
              {fr ? p.fr : p.en}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {fr ? DESCRIPTIONS[p.slug].fr : DESCRIPTIONS[p.slug].en}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-terracotta">
              {fr ? "Consulter" : "Read"}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted">
        {fr ? "Une question ? Contactez-nous à " : "A question? Contact us at "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-terracotta hover:underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </main>
  );
}
