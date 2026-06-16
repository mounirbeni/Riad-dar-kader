import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Conditions générales d'utilisation — Mbn Riad" : "Terms & Conditions — Mbn Riad",
    robots: { index: false },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const fr = locale === "fr";

  const intro = fr
    ? "Les présentes conditions générales définissent les règles d'utilisation du site du Mbn Riad et les relations entre le riad et ses visiteurs. En naviguant sur ce site, en créant un compte ou en effectuant une demande de réservation, vous reconnaissez avoir lu et accepté ces conditions."
    : "These terms and conditions set out the rules for using the Mbn Riad website and the relationship between the riad and its visitors. By browsing this site, creating an account or submitting a booking request, you acknowledge that you have read and accepted these terms.";

  const sections: LegalSection[] = fr
    ? [
        { heading: "Objet et acceptation", blocks: [
          { type: "p", text: "Ce site a pour objet de présenter le Mbn Riad, ses chambres et ses expériences, et de permettre aux voyageurs d'adresser des demandes de réservation en direct. L'utilisation du site implique l'acceptation pleine et entière des présentes conditions. Si vous n'acceptez pas ces conditions, nous vous invitons à ne pas utiliser le site." },
        ] },
        { heading: "Éditeur et hébergement", blocks: [
          { type: "list", items: [
            "Éditeur : Mbn Riad, Médina, près du Musée Mouassine, Marrakech, Maroc.",
            "Contact : contact@mbnriad.com.",
            "Hébergement : Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA.",
          ] },
        ] },
        { heading: "Accès au site", blocks: [
          { type: "p", text: "Le site est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. Tous les frais liés à l'accès (matériel, connexion) sont à la charge de l'utilisateur. Nous nous efforçons d'assurer une disponibilité continue du site mais ne pouvons être tenus responsables des interruptions liées à la maintenance, à des incidents techniques ou à des cas de force majeure." },
        ] },
        { heading: "Compte voyageur", blocks: [
          { type: "p", text: "La création d'un compte requiert des informations exactes et à jour. Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité effectuée depuis votre compte. Le riad se réserve le droit de suspendre ou de supprimer tout compte en cas d'utilisation frauduleuse ou de non-respect des présentes conditions." },
        ] },
        { heading: "Tarifs", blocks: [
          { type: "p", text: "Les tarifs affichés sont indiqués en euros (€) à titre indicatif et peuvent évoluer à tout moment. Le prix définitif et ferme est celui communiqué par le riad dans la confirmation de réservation. Sauf indication contraire, les tarifs s'entendent par chambre et par nuit et incluent la taxe de séjour applicable." },
        ] },
        { heading: "Propriété intellectuelle", blocks: [
          { type: "p", text: "L'ensemble des éléments du site (textes, photographies, illustrations, logo, charte graphique et code) est protégé par le droit de la propriété intellectuelle et demeure la propriété exclusive du Mbn Riad ou de ses partenaires. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite." },
        ] },
        { heading: "Responsabilité", blocks: [
          { type: "p", text: "Les informations publiées sur le site sont fournies à titre indicatif et sont régulièrement mises à jour. Le riad ne saurait être tenu responsable :" },
          { type: "list", items: [
            "des erreurs ou omissions dans les contenus ;",
            "des dommages indirects résultant de l'accès ou de l'utilisation du site ;",
            "de l'indisponibilité temporaire du site ;",
            "de l'usage frauduleux des identifiants d'un utilisateur.",
          ] },
          { type: "p", text: "La responsabilité du riad ne peut être engagée qu'en cas de faute grave ou de dol dûment établi." },
        ] },
        { heading: "Liens externes", blocks: [
          { type: "p", text: "Le site peut contenir des liens vers des sites tiers (cartes, messagerie WhatsApp, réseaux sociaux). Le riad n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou à leurs pratiques en matière de données." },
        ] },
        { heading: "Droit applicable et litiges", blocks: [
          { type: "p", text: "Les présentes conditions sont régies par le droit marocain. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents de Marrakech seront seuls compétents. Les voyageurs résidant dans l'Union européenne conservent le bénéfice des dispositions impératives de leur droit national." },
        ] },
      ]
    : [
        { heading: "Purpose and acceptance", blocks: [
          { type: "p", text: "The purpose of this site is to present Mbn Riad, its rooms and experiences, and to allow travellers to submit booking requests directly. Using the site implies full acceptance of these terms. If you do not accept them, we ask that you do not use the site." },
        ] },
        { heading: "Operator and hosting", blocks: [
          { type: "list", items: [
            "Operator: Mbn Riad, Medina, near Musée Mouassine, Marrakech, Morocco.",
            "Contact: contact@mbnriad.com.",
            "Hosting: Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA.",
          ] },
        ] },
        { heading: "Access to the site", blocks: [
          { type: "p", text: "The site is freely accessible to any user with internet access. All costs related to access (equipment, connection) are borne by the user. We strive to ensure continuous availability of the site but cannot be held responsible for interruptions due to maintenance, technical incidents or force majeure." },
        ] },
        { heading: "Traveller account", blocks: [
          { type: "p", text: "Creating an account requires accurate, up-to-date information. You are responsible for the confidentiality of your password and for any activity carried out from your account. The riad reserves the right to suspend or delete any account in the event of fraudulent use or breach of these terms." },
        ] },
        { heading: "Pricing", blocks: [
          { type: "p", text: "Displayed prices are shown in euros (€) for guidance and may change at any time. The final, firm price is the one communicated by the riad in the booking confirmation. Unless stated otherwise, prices are per room per night and include applicable tourist tax." },
        ] },
        { heading: "Intellectual property", blocks: [
          { type: "p", text: "All elements of the site (text, photographs, illustrations, logo, design and code) are protected by intellectual property law and remain the exclusive property of Mbn Riad or its partners. Any reproduction, representation or use, in whole or in part, without prior written permission, is prohibited." },
        ] },
        { heading: "Liability", blocks: [
          { type: "p", text: "Information published on the site is provided for guidance and is updated regularly. The riad cannot be held responsible for:" },
          { type: "list", items: [
            "errors or omissions in the content;",
            "indirect damage resulting from access to or use of the site;",
            "temporary unavailability of the site;",
            "fraudulent use of a user's credentials.",
          ] },
          { type: "p", text: "The riad's liability can only be engaged in the event of duly established gross negligence or wilful misconduct." },
        ] },
        { heading: "External links", blocks: [
          { type: "p", text: "The site may contain links to third-party sites (maps, WhatsApp messaging, social media). The riad has no control over these sites and accepts no responsibility for their content or data practices." },
        ] },
        { heading: "Governing law and disputes", blocks: [
          { type: "p", text: "These terms are governed by Moroccan law. In the event of a dispute, and failing an amicable resolution, the competent courts of Marrakech shall have sole jurisdiction. Travellers residing in the European Union retain the benefit of the mandatory provisions of their national law." },
        ] },
      ];

  return (
    <LegalPage
      locale={locale}
      current="terms"
      updated={fr ? "juin 2025" : "June 2025"}
      intro={intro}
      sections={sections}
    />
  );
}
