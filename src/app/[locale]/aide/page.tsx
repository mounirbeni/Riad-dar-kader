import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/nav";
import { contactEmail } from "@/lib/constants";
import { guestWhatsAppLink } from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "FAQ & Aide — Riad Dar Kader" : "FAQ & Help — Riad Dar Kader",
    description: fr
      ? "Questions fréquentes sur votre séjour au Riad Dar Kader à Marrakech : arrivée, petit-déjeuner, annulation et plus."
      : "Frequently asked questions about your stay at Riad Dar Kader in Marrakech: check-in, breakfast, cancellation and more.",
    alternates: { languages: { fr: "/fr/aide", en: "/en/aide" } },
  };
}

type FaqItem = { q: string; a: string };

const faqFr: FaqItem[] = [
  {
    q: "À quelle heure est le check-in et le check-out ?",
    a: "Le check-in est possible dès 15h00 et le check-out doit avoir lieu avant 12h00. Si vous arrivez plus tôt ou souhaitez partir plus tard, contactez-nous : nous ferons notre possible pour vous accommoder selon les disponibilités.",
  },
  {
    q: "Comment trouver le riad ?",
    a: "La Médina de Marrakech est piétonne : nous vous conseillons d'arriver en taxi jusqu'à la porte la plus proche (Bab Doukkala ou Bab Laksour). Dès votre réservation confirmée, nous vous enverrons un plan détaillé et un numéro WhatsApp pour vous guider jusqu'à notre porte.",
  },
  {
    q: "Le petit-déjeuner est-il inclus dans la réservation ?",
    a: "Le petit-déjeuner marocain (pain maison, confiture, huile d'argan, jus frais, thé à la menthe…) peut être ajouté à votre séjour. Sélectionnez-le comme extra lors de votre demande de réservation.",
  },
  {
    q: "Quels modes de paiement acceptez-vous ?",
    a: "Nous acceptons le règlement en espèces (dirhams marocains ou euros) directement au riad. Pour les grandes réservations ou la privatisation du riad, un acompte peut être demandé pour confirmer votre séjour.",
  },
  {
    q: "Quelle est la politique d'annulation ?",
    a: "Les annulations effectuées au moins 7 jours avant la date d'arrivée sont sans frais. Pour les annulations plus tardives, une nuit de séjour peut être retenue à titre d'acompte. Contactez-nous dès que possible si votre situation change.",
  },
  {
    q: "Acceptez-vous les enfants ?",
    a: "Oui, les enfants sont les bienvenus au Riad Dar Kader ! Merci de préciser l'âge et le nombre d'enfants dans votre demande afin que nous puissions préparer l'espace au mieux.",
  },
  {
    q: "Y a-t-il un parking à proximité ?",
    a: "La Médina est entièrement piétonne : il n'y a pas de parking au riad. Les parkings les plus proches se trouvent à l'entrée de la Médina (Bab Doukkala, Bab Jdid). Nous pouvons vous indiquer le meilleur itinéraire depuis votre point d'arrivée.",
  },
  {
    q: "Comment modifier ou annuler ma réservation ?",
    a: "Contactez-nous directement par email ou WhatsApp en indiquant votre numéro de référence. Nous traiterons votre demande dans les meilleurs délais et ferons tout notre possible pour vous proposer une solution adaptée.",
  },
  {
    q: "Le Wi-Fi est-il disponible dans les chambres ?",
    a: "Oui, un accès Wi-Fi gratuit est disponible dans toutes les chambres et les espaces communs du riad.",
  },
  {
    q: "Proposez-vous des transferts depuis l'aéroport ?",
    a: "Nous pouvons organiser un transfert depuis l'aéroport Marrakech-Ménara sur demande. Mentionnez-le dans vos demandes particulières lors de la réservation ou contactez-nous directement.",
  },
];

const faqEn: FaqItem[] = [
  {
    q: "What time is check-in and check-out?",
    a: "Check-in is available from 3:00 PM and check-out must be by 12:00 PM. If you arrive earlier or wish to depart later, contact us and we'll do our best to accommodate you subject to availability.",
  },
  {
    q: "How do I find the riad?",
    a: "The Marrakech Medina is pedestrian-only: we recommend taking a taxi to the nearest gate (Bab Doukkala or Bab Laksour). Once your booking is confirmed, we'll send you a detailed map and a WhatsApp number to guide you to our door.",
  },
  {
    q: "Is breakfast included in the booking?",
    a: "A Moroccan breakfast (home-baked bread, jam, argan oil, fresh juice, mint tea…) can be added to your stay. Simply select it as an extra when making your booking request.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept cash payment (Moroccan dirhams or euros) at the riad. For larger bookings or full-riad privatisation, a deposit may be requested to confirm your stay.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Cancellations made at least 7 days before the check-in date are free of charge. For later cancellations, one night's stay may be retained as a deposit. Please contact us as soon as possible if your plans change.",
  },
  {
    q: "Do you welcome children?",
    a: "Yes, children are very welcome at Riad Dar Kader! Please mention the age and number of children in your request so we can prepare the space accordingly.",
  },
  {
    q: "Is there parking nearby?",
    a: "The Medina is entirely pedestrian: there is no parking at the riad. The nearest car parks are at the entrances to the Medina (Bab Doukkala, Bab Jdid). We can advise you on the best route from your arrival point.",
  },
  {
    q: "How do I modify or cancel my booking?",
    a: "Contact us directly by email or WhatsApp with your reference number. We'll handle your request promptly and do our best to offer a suitable solution.",
  },
  {
    q: "Is Wi-Fi available in the rooms?",
    a: "Yes, free Wi-Fi is available in all rooms and common areas of the riad.",
  },
  {
    q: "Do you offer airport transfers?",
    a: "We can arrange a transfer from Marrakech-Ménara airport on request. Mention it in your special requests when booking, or contact us directly.",
  },
];

export default async function AidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const dict = getDictionary(locale);
  const fr = locale === "fr";
  const faq = fr ? faqFr : faqEn;

  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <p className="kicker">{fr ? "Assistance" : "Support"}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          {fr ? "FAQ & Aide" : "FAQ & Help"}
        </h1>
        <p className="mt-4 text-muted">
          {fr
            ? "Retrouvez les réponses aux questions les plus fréquentes. Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter directement."
            : "Find answers to the most common questions. If you can't find what you're looking for, don't hesitate to reach out directly."}
        </p>
      </div>

      <div className="mt-12 max-w-3xl space-y-4">
        {faq.map((item, i) => (
          <details
            key={i}
            className="group overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left">
              <span className="font-medium text-ink">{item.q}</span>
              <span className="shrink-0 text-terracotta transition-transform duration-200 group-open:rotate-45">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </summary>
            <div className="border-t border-sand-100 px-6 py-5">
              <p className="text-sm leading-relaxed text-muted">{item.a}</p>
            </div>
          </details>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-14 max-w-3xl rounded-2xl bg-terracotta/5 border border-terracotta/20 p-8">
        <h2 className="font-serif text-2xl text-ink">
          {fr ? "Vous avez d'autres questions ?" : "Still have questions?"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {fr
            ? "Notre équipe est disponible par email et WhatsApp pour vous aider."
            : "Our team is available by email and WhatsApp to help you."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`mailto:${contactEmail()}`}
            className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:border-terracotta/30 hover:text-terracotta"
          >
            {fr ? "Nous écrire" : "Email us"}
          </a>
          <a
            href={guestWhatsAppLink(locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            WhatsApp
          </a>
          <Link href={localePath(locale, "contact")} className="btn-primary">
            {dict.nav.contact}
          </Link>
        </div>
      </div>
    </div>
  );
}
