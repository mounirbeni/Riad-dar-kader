import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr
      ? "Informations légales — Riad Dar Kader"
      : "Legal Information — Riad Dar Kader",
    robots: { index: false },
  };
}

type Item = { h: string; p: string };
type Section = { id: string; title: string; items: Item[] };

const CONTACT = "contact@riaddarkader.com";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const fr = locale === "fr";

  const sections: Section[] = fr
    ? [
        {
          id: "privacy",
          title: "Politique de confidentialité",
          items: [
            { h: "Données collectées", p: "Lorsque vous effectuez une demande de réservation ou créez un compte, nous collectons : nom, adresse e-mail, numéro de téléphone, pays de résidence et détails de votre séjour (dates, nombre de voyageurs, demandes particulières)." },
            { h: "Utilisation des données", p: "Vos données servent exclusivement à traiter votre demande de réservation, vous envoyer une confirmation et les informations relatives à votre séjour, et améliorer nos services. Nous ne vendons ni ne transmettons vos données à des tiers à des fins commerciales." },
            { h: "Durée de conservation", p: "Vos données sont conservées au maximum 3 ans à compter de votre dernier séjour ou de votre dernière interaction avec le riad, sauf obligation légale contraire." },
            { h: "Vos droits (RGPD)", p: `Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour les exercer, écrivez-nous à ${CONTACT}.` },
            { h: "Sécurité", p: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation." },
          ],
        },
        {
          id: "terms",
          title: "Conditions générales",
          items: [
            { h: "Objet", p: "Les présentes conditions régissent l'utilisation du site et les services proposés par le Riad Dar Kader. En utilisant ce site, vous acceptez ces conditions." },
            { h: "Tarifs", p: "Les tarifs sont indiqués en euros (€) et susceptibles d'évoluer. Le prix définitif est celui communiqué dans la confirmation de réservation et inclut la taxe de séjour applicable." },
            { h: "Responsabilité", p: "Riad Dar Kader ne peut être tenu responsable de tout dommage indirect, perte ou préjudice résultant de l'utilisation de ce site ou d'un séjour au riad, sauf en cas de faute grave ou de fraude." },
            { h: "Propriété intellectuelle", p: "L'ensemble des contenus du site (textes, visuels, logo) est la propriété du Riad Dar Kader et ne peut être reproduit sans autorisation écrite." },
            { h: "Droit applicable", p: "Les présentes conditions sont régies par le droit marocain. Tout litige sera soumis à la juridiction compétente de Marrakech." },
          ],
        },
        {
          id: "booking",
          title: "Conditions de réservation",
          items: [
            { h: "Nature de la demande", p: "Toute demande effectuée via ce site constitue une demande de réservation et non une réservation ferme. Le riad vous contacte pour confirmer la disponibilité et les modalités. La réservation est effective à réception de la confirmation écrite du riad." },
            { h: "Paiement", p: "Les modalités de paiement (acompte, solde, moyens acceptés) sont précisées dans la confirmation de réservation. Aucun paiement n'est prélevé via ce site au moment de la demande." },
            { h: "Arrivée & départ", p: "L'arrivée se fait à partir de 14h00 et le départ avant 12h00. Des horaires flexibles peuvent être arrangés selon disponibilité et sur demande." },
            { h: "Capacité & comportement", p: "Le nombre de voyageurs ne doit pas dépasser la capacité de la chambre réservée. Le riad se réserve le droit de refuser ou d'interrompre un séjour en cas de comportement inapproprié." },
            { h: "Taxe de séjour", p: "La taxe de séjour locale, lorsqu'elle s'applique, peut être incluse dans le tarif ou réglée sur place selon les indications de la confirmation." },
          ],
        },
        {
          id: "cancellation",
          title: "Politique d'annulation & de remboursement",
          items: [
            { h: "Annulation gratuite", p: "Sauf mention contraire dans votre confirmation, l'annulation est gratuite jusqu'à 7 jours avant la date d'arrivée." },
            { h: "Annulation tardive", p: "En cas d'annulation entre 7 et 2 jours avant l'arrivée, un montant correspondant à la première nuit pourra être facturé. À moins de 48h, le séjour peut être facturé en totalité." },
            { h: "Non-présentation", p: "En cas de non-présentation sans annulation préalable (no-show), le montant de la première nuit, voire de la totalité du séjour, pourra être retenu." },
            { h: "Remboursement", p: `Les remboursements éligibles sont effectués sous 14 jours par le moyen de paiement initial. Pour toute demande, contactez-nous à ${CONTACT}.` },
            { h: "Force majeure", p: "En cas d'événement de force majeure (catastrophe naturelle, restriction sanitaire, etc.), nous étudions chaque situation avec souplesse afin de proposer un report ou un avoir." },
          ],
        },
        {
          id: "cookies",
          title: "Politique relative aux cookies",
          items: [
            { h: "Qu'est-ce qu'un cookie ?", p: "Un cookie est un petit fichier déposé sur votre appareil lors de la visite d'un site, permettant d'en assurer le bon fonctionnement et de mémoriser certaines préférences." },
            { h: "Cookies que nous utilisons", p: "Ce site utilise uniquement des cookies techniques essentiels : session utilisateur (connexion à votre compte) et préférence de langue. Ils sont nécessaires au fonctionnement du site." },
            { h: "Cookies tiers & traçage", p: "Nous n'utilisons aucun cookie publicitaire ni aucun outil de traçage tiers à des fins marketing." },
            { h: "Gestion des cookies", p: "Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies. La désactivation des cookies essentiels peut toutefois empêcher la connexion à votre compte." },
          ],
        },
      ]
    : [
        {
          id: "privacy",
          title: "Privacy Policy",
          items: [
            { h: "Data we collect", p: "When you submit a booking request or create an account, we collect: name, email address, phone number, country of residence, and stay details (dates, number of guests, special requests)." },
            { h: "How we use your data", p: "Your data is used solely to process your booking request, send you confirmation and stay-related information, and improve our services. We do not sell or share your data with third parties for commercial purposes." },
            { h: "Data retention", p: "Your data is retained for a maximum of 3 years from your last stay or last interaction with the riad, unless required otherwise by law." },
            { h: "Your rights (GDPR)", p: `Under the GDPR, you have the rights of access, rectification, erasure, portability and objection. To exercise them, write to us at ${CONTACT}.` },
            { h: "Security", p: "We implement appropriate technical and organisational measures to protect your data against unauthorised access, loss or disclosure." },
          ],
        },
        {
          id: "terms",
          title: "Terms & Conditions",
          items: [
            { h: "Purpose", p: "These terms govern the use of the site and the services offered by Riad Dar Kader. By using this site, you accept these terms." },
            { h: "Pricing", p: "Prices are shown in euros (€) and are subject to change. The final price is the one communicated in the booking confirmation and includes applicable tourist tax." },
            { h: "Liability", p: "Riad Dar Kader cannot be held liable for any indirect damage, loss or prejudice resulting from the use of this site or a stay at the riad, except in cases of gross negligence or fraud." },
            { h: "Intellectual property", p: "All site content (text, visuals, logo) is the property of Riad Dar Kader and may not be reproduced without written permission." },
            { h: "Governing law", p: "These terms are governed by Moroccan law. Any dispute shall be subject to the competent jurisdiction of Marrakech." },
          ],
        },
        {
          id: "booking",
          title: "Booking Terms",
          items: [
            { h: "Nature of the request", p: "Any request made through this site is a booking request, not a confirmed reservation. The riad will contact you to confirm availability and terms. The booking is confirmed upon receipt of written confirmation from the riad." },
            { h: "Payment", p: "Payment terms (deposit, balance, accepted methods) are specified in the booking confirmation. No payment is taken through this site at the time of the request." },
            { h: "Check-in & check-out", p: "Check-in is from 2:00 PM and check-out before 12:00 PM. Flexible timings can be arranged subject to availability and on request." },
            { h: "Capacity & conduct", p: "The number of guests must not exceed the capacity of the booked room. The riad reserves the right to refuse or end a stay in the event of inappropriate behaviour." },
            { h: "Tourist tax", p: "The local tourist tax, where applicable, may be included in the rate or paid on site as indicated in the confirmation." },
          ],
        },
        {
          id: "cancellation",
          title: "Cancellation & Refund Policy",
          items: [
            { h: "Free cancellation", p: "Unless stated otherwise in your confirmation, cancellation is free of charge up to 7 days before the arrival date." },
            { h: "Late cancellation", p: "For cancellations between 7 and 2 days before arrival, an amount equal to the first night may be charged. Within 48 hours, the full stay may be charged." },
            { h: "No-show", p: "In the event of a no-show without prior cancellation, the first night — or the full stay — may be retained." },
            { h: "Refunds", p: `Eligible refunds are processed within 14 days to the original payment method. For any request, contact us at ${CONTACT}.` },
            { h: "Force majeure", p: "In the event of force majeure (natural disaster, health restrictions, etc.), we review each situation flexibly to offer a postponement or credit." },
          ],
        },
        {
          id: "cookies",
          title: "Cookie Policy",
          items: [
            { h: "What is a cookie?", p: "A cookie is a small file placed on your device when you visit a site, allowing it to function properly and to remember certain preferences." },
            { h: "Cookies we use", p: "This site uses only essential technical cookies: user session (login to your account) and language preference. They are required for the site to function." },
            { h: "Third-party & tracking cookies", p: "We do not use any advertising cookies or third-party tracking tools for marketing purposes." },
            { h: "Managing cookies", p: "You can configure your browser to block or delete cookies. Disabling essential cookies may, however, prevent you from logging into your account." },
          ],
        },
      ];

  return (
    <main className="container-page max-w-3xl py-16 lg:py-24">
      <h1 className="font-serif text-3xl text-ink sm:text-4xl">
        {fr ? "Informations légales" : "Legal Information"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {fr ? "Dernière mise à jour : juin 2025" : "Last updated: June 2025"}
      </p>

      {/* Table of contents */}
      <nav className="mt-8 rounded-2xl border border-sand-200 bg-sand/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {fr ? "Sommaire" : "Contents"}
        </p>
        <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-sm text-terracotta hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Legal notice */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl text-ink">
          {fr ? "Mentions légales" : "Legal Notice"}
        </h2>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <div>
            <p className="font-medium text-ink">{fr ? "Éditeur du site" : "Site operator"}</p>
            <p>Riad Dar Kader</p>
            <p>{fr ? "Médina, près du Musée Mouassine, Marrakech, Maroc" : "Medina, near Musée Mouassine, Marrakech, Morocco"}</p>
            <p>
              {fr ? "Email : " : "Email: "}
              <a href={`mailto:${CONTACT}`} className="text-terracotta hover:underline">{CONTACT}</a>
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">{fr ? "Hébergement" : "Hosting"}</p>
            <p>Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA</p>
          </div>
          <div>
            <p className="font-medium text-ink">{fr ? "Directeur de publication" : "Publication director"}</p>
            <p>Riad Dar Kader</p>
          </div>
        </div>
      </section>

      {/* Policy sections */}
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-24">
          <hr className="my-10 border-sand-200" />
          <h2 className="font-serif text-2xl text-ink">{s.title}</h2>
          <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted">
            {s.items.map((item, i) => (
              <div key={i}>
                <h3 className="font-medium text-ink">{item.h}</h3>
                <p className="mt-2">{item.p}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <hr className="my-10 border-sand-200" />
      <p className="text-xs text-muted">
        {fr
          ? "Pour toute question relative à ces politiques ou à vos données personnelles, contactez-nous à "
          : "For any questions regarding these policies or your personal data, contact us at "}
        <a href={`mailto:${CONTACT}`} className="text-terracotta hover:underline">{CONTACT}</a>.
      </p>
    </main>
  );
}
