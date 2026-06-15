import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Conditions de réservation — Riad Dar Kader" : "Booking Terms — Riad Dar Kader",
    robots: { index: false },
  };
}

export default async function BookingTermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const fr = locale === "fr";

  const intro = fr
    ? "Ces conditions précisent le déroulement d'une réservation au Riad Dar Kader, de la demande initiale jusqu'à votre départ. Elles complètent nos conditions générales d'utilisation et s'appliquent à toute réservation effectuée en direct via ce site."
    : "These terms describe how a booking at Riad Dar Kader works, from the initial request to your departure. They supplement our general Terms & Conditions and apply to any booking made directly through this site.";

  const sections: LegalSection[] = fr
    ? [
        { heading: "Demande de réservation", blocks: [
          { type: "p", text: "Toute réservation débute par une demande adressée via le site. Cette demande n'est pas une réservation ferme : elle exprime votre intention de séjourner aux dates et conditions indiquées. Le riad vérifie la disponibilité puis vous adresse une réponse." },
        ] },
        { heading: "Confirmation", blocks: [
          { type: "p", text: "La réservation ne devient ferme et définitive qu'à la réception de la confirmation écrite du riad (par e-mail ou WhatsApp), précisant la ou les chambres, les dates, le tarif total et les modalités de paiement. Tant que cette confirmation n'a pas été émise, aucune chambre n'est garantie." },
        ] },
        { heading: "Paiement", blocks: [
          { type: "p", text: "Aucun paiement n'est prélevé au moment de la demande sur ce site. Les modalités sont indiquées dans la confirmation :" },
          { type: "list", items: [
            "Un acompte peut être demandé pour garantir la réservation.",
            "Le solde est généralement réglé à l'arrivée ou avant le séjour, selon les indications de la confirmation.",
            "Les moyens de paiement acceptés (espèces, virement, carte le cas échéant) sont précisés par le riad.",
          ] },
        ] },
        { heading: "Arrivée et départ", blocks: [
          { type: "table", head: ["", "Horaire"], rows: [
            ["Arrivée (check-in)", "À partir de 14h00"],
            ["Départ (check-out)", "Avant 12h00"],
          ] },
          { type: "p", text: "Des arrivées tardives ou des départs anticipés peuvent être organisés sur demande et selon disponibilité. Merci de communiquer votre heure d'arrivée estimée afin que l'équipe puisse vous accueillir, l'accès à la Médina se faisant parfois à pied." },
        ] },
        { heading: "Capacité et occupation", blocks: [
          { type: "p", text: "Le nombre de personnes séjournant dans une chambre ne peut excéder la capacité indiquée lors de la réservation. Tout voyageur supplémentaire doit être déclaré et accepté par le riad, et peut donner lieu à un supplément. Les enfants sont les bienvenus ; merci de préciser leur âge lors de la demande." },
        ] },
        { heading: "Taxe de séjour", blocks: [
          { type: "p", text: "Une taxe de séjour locale s'applique conformément à la réglementation de la ville de Marrakech. Selon les indications de votre confirmation, elle est soit incluse dans le tarif, soit réglée sur place. Son montant dépend de la catégorie de l'établissement et du nombre de nuits." },
        ] },
        { heading: "Règles de la maison", blocks: [
          { type: "list", items: [
            "Le riad est un lieu de calme : merci de respecter la tranquillité des autres voyageurs, en particulier la nuit.",
            "Il est généralement interdit de fumer dans les chambres ; des espaces extérieurs sont prévus à cet effet.",
            "Les animaux ne sont admis que sur accord préalable du riad.",
            "Tout dommage causé aux lieux ou au mobilier pourra être facturé.",
          ] },
        ] },
        { heading: "Modification d'une réservation", blocks: [
          { type: "p", text: "Toute demande de modification (dates, nombre de voyageurs, prestations) doit être adressée au riad dès que possible. Les modifications sont soumises à disponibilité et peuvent entraîner un ajustement du tarif. Une modification ne vaut pas annulation : les conditions d'annulation restent applicables." },
        ] },
        { heading: "Annulation", blocks: [
          { type: "p", text: "Les conditions d'annulation et de remboursement font l'objet d'un document dédié, la « Politique d'annulation & de remboursement », accessible depuis le menu des documents légaux et depuis votre confirmation." },
        ] },
      ]
    : [
        { heading: "Booking request", blocks: [
          { type: "p", text: "Every booking starts with a request submitted through the site. This request is not a confirmed reservation: it expresses your intention to stay on the dates and conditions indicated. The riad checks availability and then sends you a reply." },
        ] },
        { heading: "Confirmation", blocks: [
          { type: "p", text: "The booking becomes firm and final only upon receipt of the riad's written confirmation (by email or WhatsApp), specifying the room(s), dates, total price and payment terms. Until this confirmation is issued, no room is guaranteed." },
        ] },
        { heading: "Payment", blocks: [
          { type: "p", text: "No payment is taken at the time of the request on this site. The terms are set out in the confirmation:" },
          { type: "list", items: [
            "A deposit may be requested to secure the booking.",
            "The balance is generally paid on arrival or before the stay, as indicated in the confirmation.",
            "Accepted payment methods (cash, bank transfer, card where applicable) are specified by the riad.",
          ] },
        ] },
        { heading: "Check-in and check-out", blocks: [
          { type: "table", head: ["", "Time"], rows: [
            ["Check-in", "From 2:00 PM"],
            ["Check-out", "Before 12:00 PM"],
          ] },
          { type: "p", text: "Late arrivals or early departures can be arranged on request and subject to availability. Please share your estimated arrival time so the team can welcome you, as access within the Medina is sometimes on foot." },
        ] },
        { heading: "Capacity and occupancy", blocks: [
          { type: "p", text: "The number of people staying in a room may not exceed the capacity indicated at the time of booking. Any additional guest must be declared and accepted by the riad and may incur a supplement. Children are welcome; please specify their age when making your request." },
        ] },
        { heading: "Tourist tax", blocks: [
          { type: "p", text: "A local tourist tax applies in accordance with the regulations of the city of Marrakech. Depending on your confirmation, it is either included in the rate or paid on site. The amount depends on the establishment's category and the number of nights." },
        ] },
        { heading: "House rules", blocks: [
          { type: "list", items: [
            "The riad is a place of calm: please respect the peace of other guests, especially at night.",
            "Smoking inside the rooms is generally not permitted; outdoor areas are provided for this purpose.",
            "Pets are admitted only with the riad's prior agreement.",
            "Any damage to the premises or furnishings may be charged.",
          ] },
        ] },
        { heading: "Changing a booking", blocks: [
          { type: "p", text: "Any change request (dates, number of guests, services) should be sent to the riad as soon as possible. Changes are subject to availability and may result in a price adjustment. A change is not a cancellation: the cancellation terms remain applicable." },
        ] },
        { heading: "Cancellation", blocks: [
          { type: "p", text: "Cancellation and refund terms are covered in a dedicated document, the “Cancellation & Refund Policy”, accessible from the legal documents menu and from your confirmation." },
        ] },
      ];

  return (
    <LegalPage
      locale={locale}
      current="booking"
      updated={fr ? "juin 2025" : "June 2025"}
      intro={intro}
      sections={sections}
    />
  );
}
