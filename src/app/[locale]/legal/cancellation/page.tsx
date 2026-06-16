import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Annulation & remboursement — Mbn Riad" : "Cancellation & Refund Policy — Mbn Riad",
    robots: { index: false },
  };
}

export default async function CancellationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const fr = locale === "fr";

  const intro = fr
    ? "Nous savons que des imprévus peuvent survenir. Cette politique décrit les conditions d'annulation, les éventuels frais applicables et les modalités de remboursement. Les conditions spécifiques de votre séjour figurent toujours dans votre confirmation de réservation et prévalent en cas de différence (par exemple pour les tarifs non remboursables ou les périodes de forte affluence)."
    : "We know that the unexpected can happen. This policy describes cancellation conditions, any applicable fees and refund arrangements. The specific conditions of your stay always appear in your booking confirmation and prevail in the event of a difference (for example, for non-refundable rates or peak periods).";

  const sections: LegalSection[] = fr
    ? [
        { heading: "Comment annuler", blocks: [
          { type: "p", text: "Pour annuler ou modifier une réservation, contactez le riad le plus tôt possible par e-mail à contact@mbnriad.com ou via WhatsApp. La date de réception de votre demande fait foi pour le calcul des éventuels frais." },
        ] },
        { heading: "Barème d'annulation", blocks: [
          { type: "p", text: "Sauf condition particulière indiquée dans votre confirmation, le barème standard est le suivant :" },
          { type: "table", head: ["Délai avant l'arrivée", "Frais d'annulation"], rows: [
            ["Plus de 7 jours", "Aucun frais — annulation gratuite"],
            ["Entre 7 et 2 jours", "Montant de la première nuit"],
            ["Moins de 48 heures", "Totalité du séjour"],
            ["Non-présentation (no-show)", "Totalité du séjour"],
          ] },
        ] },
        { heading: "Non-présentation", blocks: [
          { type: "p", text: "En l'absence d'annulation préalable et si vous ne vous présentez pas le jour de l'arrivée, la réservation est considérée comme une non-présentation. Le montant correspondant, tel qu'indiqué dans le barème, pourra être retenu et les nuits réservées libérées." },
        ] },
        { heading: "Tarifs non remboursables", blocks: [
          { type: "p", text: "Certaines offres promotionnelles ou réservations à tarif réduit peuvent être non remboursables. Dans ce cas, l'information est clairement indiquée avant la confirmation : aucune somme versée ne sera remboursée en cas d'annulation, quelle qu'en soit la date." },
        ] },
        { heading: "Modalités de remboursement", blocks: [
          { type: "p", text: "Lorsqu'un remboursement est dû :" },
          { type: "list", items: [
            "Il est effectué par le même moyen de paiement que celui utilisé initialement.",
            "Le délai de traitement est de 14 jours maximum à compter de la confirmation de l'annulation.",
            "Les éventuels frais bancaires de transfert restent à la charge du voyageur lorsqu'ils s'appliquent.",
          ] },
        ] },
        { heading: "Départ anticipé", blocks: [
          { type: "p", text: "En cas de départ avant la date prévue, les nuits réservées et non effectuées restent dues, sauf accord exprès du riad. Nous étudions toutefois chaque situation avec bienveillance." },
        ] },
        { heading: "Annulation par le riad", blocks: [
          { type: "p", text: "Dans le cas exceptionnel où le riad se trouverait dans l'impossibilité d'honorer votre réservation (incident technique, événement imprévu), nous vous en informerions dans les meilleurs délais et procéderions au remboursement intégral des sommes versées, ou vous proposerions une solution équivalente." },
        ] },
        { heading: "Force majeure", blocks: [
          { type: "p", text: "En cas d'événement de force majeure indépendant de votre volonté et de la nôtre (catastrophe naturelle, restriction sanitaire ou administrative empêchant le voyage, etc.), nous privilégions une solution souple : report du séjour ou avoir valable sur une future réservation. Un justificatif pourra être demandé." },
        ] },
      ]
    : [
        { heading: "How to cancel", blocks: [
          { type: "p", text: "To cancel or change a booking, contact the riad as early as possible by email at contact@mbnriad.com or via WhatsApp. The date your request is received is what counts for calculating any fees." },
        ] },
        { heading: "Cancellation schedule", blocks: [
          { type: "p", text: "Unless a specific condition is stated in your confirmation, the standard schedule is as follows:" },
          { type: "table", head: ["Time before arrival", "Cancellation fee"], rows: [
            ["More than 7 days", "No charge — free cancellation"],
            ["Between 7 and 2 days", "First night's amount"],
            ["Less than 48 hours", "Full stay"],
            ["No-show", "Full stay"],
          ] },
        ] },
        { heading: "No-show", blocks: [
          { type: "p", text: "If you do not cancel in advance and do not arrive on the check-in day, the booking is treated as a no-show. The corresponding amount, as shown in the schedule, may be retained and the booked nights released." },
        ] },
        { heading: "Non-refundable rates", blocks: [
          { type: "p", text: "Some promotional offers or discounted bookings may be non-refundable. In such cases, this is clearly indicated before confirmation: no amount paid will be refunded in the event of cancellation, whatever the date." },
        ] },
        { heading: "Refund arrangements", blocks: [
          { type: "p", text: "When a refund is due:" },
          { type: "list", items: [
            "It is made using the same payment method as originally used.",
            "Processing takes up to 14 days from confirmation of the cancellation.",
            "Any bank transfer fees remain the traveller's responsibility where they apply.",
          ] },
        ] },
        { heading: "Early departure", blocks: [
          { type: "p", text: "If you leave before the planned date, the booked and unused nights remain payable, unless the riad expressly agrees otherwise. We nonetheless review each situation with goodwill." },
        ] },
        { heading: "Cancellation by the riad", blocks: [
          { type: "p", text: "In the exceptional event that the riad is unable to honour your booking (technical incident, unforeseen event), we would inform you as soon as possible and proceed with a full refund of the amounts paid, or offer you an equivalent solution." },
        ] },
        { heading: "Force majeure", blocks: [
          { type: "p", text: "In the event of force majeure beyond your control and ours (natural disaster, health or administrative restriction preventing travel, etc.), we favour a flexible solution: postponement of the stay or a credit valid for a future booking. Supporting evidence may be requested." },
        ] },
      ];

  return (
    <LegalPage
      locale={locale}
      current="cancellation"
      updated={fr ? "juin 2025" : "June 2025"}
      intro={intro}
      sections={sections}
    />
  );
}
