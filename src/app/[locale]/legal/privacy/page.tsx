import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Politique de confidentialité — Mbn Riad" : "Privacy Policy — Mbn Riad",
    robots: { index: false },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const fr = locale === "fr";

  const intro = fr
    ? "La présente politique explique comment le Mbn Riad collecte, utilise, conserve et protège vos données personnelles lorsque vous visitez notre site, créez un compte voyageur ou effectuez une demande de réservation. Nous nous engageons à traiter vos données de manière transparente et conforme au Règlement Général sur la Protection des Données (RGPD) ainsi qu'à la loi marocaine n° 09-08 relative à la protection des personnes physiques."
    : "This policy explains how Mbn Riad collects, uses, stores and protects your personal data when you visit our site, create a traveller account or submit a booking request. We are committed to handling your data transparently and in compliance with the General Data Protection Regulation (GDPR) and Moroccan law No. 09-08 on the protection of individuals.";

  const sections: LegalSection[] = fr
    ? [
        {
          heading: "Responsable du traitement",
          blocks: [
            { type: "p", text: "Le responsable du traitement des données est le Mbn Riad, situé dans la Médina, près du Musée Mouassine, Marrakech, Maroc. Pour toute question relative à vos données, vous pouvez nous contacter à contact@mbnriad.com." },
          ],
        },
        {
          heading: "Données que nous collectons",
          blocks: [
            { type: "p", text: "Nous ne collectons que les données strictement nécessaires à la gestion de votre séjour et de votre compte :" },
            { type: "list", items: [
              "Données d'identité : nom et prénom.",
              "Coordonnées : adresse e-mail, numéro de téléphone (WhatsApp), pays de résidence.",
              "Données de réservation : dates d'arrivée et de départ, nombre de voyageurs, chambre(s) et prestations choisies, demandes particulières.",
              "Données de compte : mot de passe (stocké de façon chiffrée et irréversible), historique de vos réservations et messages échangés avec le riad.",
              "Données techniques : type d'appareil et préférence de langue, nécessaires au bon fonctionnement du site.",
            ] },
          ],
        },
        {
          heading: "Finalités et bases légales",
          blocks: [
            { type: "p", text: "Chaque traitement repose sur une base légale précise :" },
            { type: "table", head: ["Finalité", "Base légale"], rows: [
              ["Traiter et confirmer votre demande de réservation", "Exécution de mesures précontractuelles et contractuelles"],
              ["Gérer votre compte voyageur et la messagerie", "Exécution du contrat"],
              ["Vous envoyer des informations relatives à votre séjour", "Intérêt légitime et exécution du contrat"],
              ["Respecter nos obligations légales et comptables", "Obligation légale"],
              ["Améliorer la qualité de nos services", "Intérêt légitime"],
            ] },
          ],
        },
        {
          heading: "Destinataires des données",
          blocks: [
            { type: "p", text: "Vos données sont traitées par l'équipe du riad et ne sont jamais vendues. Elles peuvent être communiquées uniquement à :" },
            { type: "list", items: [
              "Notre hébergeur technique (Vercel Inc.) et notre base de données, pour le fonctionnement du site.",
              "Les autorités compétentes lorsque la loi l'exige (par exemple, registre des voyageurs).",
              "Les prestataires de paiement, le cas échéant, pour le règlement de votre séjour.",
            ] },
            { type: "p", text: "Certains prestataires peuvent être situés hors du Maroc ou de l'Union européenne ; dans ce cas, nous veillons à ce que des garanties appropriées encadrent le transfert." },
          ],
        },
        {
          heading: "Durée de conservation",
          blocks: [
            { type: "p", text: "Nous conservons vos données pendant la durée nécessaire aux finalités décrites :" },
            { type: "list", items: [
              "Données de réservation : 3 ans à compter de votre dernier séjour.",
              "Données de compte : jusqu'à la suppression de votre compte, puis archivées 1 an avant effacement définitif.",
              "Documents comptables : 10 ans, conformément aux obligations légales.",
            ] },
          ],
        },
        {
          heading: "Vos droits",
          blocks: [
            { type: "p", text: "Conformément au RGPD et à la loi 09-08, vous disposez des droits suivants, exerçables à tout moment :" },
            { type: "list", items: [
              "Droit d'accès : obtenir une copie des données vous concernant.",
              "Droit de rectification : corriger des informations inexactes.",
              "Droit à l'effacement : demander la suppression de vos données.",
              "Droit à la limitation et à l'opposition au traitement.",
              "Droit à la portabilité : recevoir vos données dans un format structuré.",
            ] },
            { type: "p", text: "Pour exercer ces droits, écrivez à contact@mbnriad.com. Nous répondons sous 30 jours. Vous pouvez également introduire une réclamation auprès de l'autorité de protection des données compétente." },
          ],
        },
        {
          heading: "Sécurité",
          blocks: [
            { type: "p", text: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées : chiffrement des mots de passe, connexions sécurisées (HTTPS), accès restreint aux données et sauvegardes régulières, afin de protéger vos informations contre tout accès non autorisé, perte ou divulgation." },
          ],
        },
        {
          heading: "Modifications",
          blocks: [
            { type: "p", text: "Cette politique peut être mise à jour pour refléter des évolutions légales ou de nos services. La date de dernière mise à jour figure en haut de la page. Nous vous invitons à la consulter régulièrement." },
          ],
        },
      ]
    : [
        {
          heading: "Data controller",
          blocks: [
            { type: "p", text: "The data controller is Mbn Riad, located in the Medina, near Musée Mouassine, Marrakech, Morocco. For any question regarding your data, you can contact us at contact@mbnriad.com." },
          ],
        },
        {
          heading: "Data we collect",
          blocks: [
            { type: "p", text: "We only collect the data strictly necessary to manage your stay and your account:" },
            { type: "list", items: [
              "Identity data: first and last name.",
              "Contact details: email address, phone number (WhatsApp), country of residence.",
              "Booking data: arrival and departure dates, number of guests, room(s) and services chosen, special requests.",
              "Account data: password (stored encrypted and irreversibly), your booking history and messages exchanged with the riad.",
              "Technical data: device type and language preference, required for the site to function.",
            ] },
          ],
        },
        {
          heading: "Purposes and legal bases",
          blocks: [
            { type: "p", text: "Each processing activity is based on a specific legal ground:" },
            { type: "table", head: ["Purpose", "Legal basis"], rows: [
              ["Process and confirm your booking request", "Pre-contractual and contractual measures"],
              ["Manage your traveller account and messaging", "Performance of the contract"],
              ["Send you information about your stay", "Legitimate interest and performance of the contract"],
              ["Comply with our legal and accounting obligations", "Legal obligation"],
              ["Improve the quality of our services", "Legitimate interest"],
            ] },
          ],
        },
        {
          heading: "Data recipients",
          blocks: [
            { type: "p", text: "Your data is handled by the riad's team and is never sold. It may be shared only with:" },
            { type: "list", items: [
              "Our technical host (Vercel Inc.) and our database, for the operation of the site.",
              "The competent authorities where required by law (for example, the guest register).",
              "Payment providers, where applicable, for the settlement of your stay.",
            ] },
            { type: "p", text: "Some providers may be located outside Morocco or the European Union; in such cases, we ensure that appropriate safeguards govern the transfer." },
          ],
        },
        {
          heading: "Data retention",
          blocks: [
            { type: "p", text: "We keep your data for as long as necessary for the purposes described:" },
            { type: "list", items: [
              "Booking data: 3 years from your last stay.",
              "Account data: until your account is deleted, then archived for 1 year before permanent erasure.",
              "Accounting documents: 10 years, in accordance with legal obligations.",
            ] },
          ],
        },
        {
          heading: "Your rights",
          blocks: [
            { type: "p", text: "Under the GDPR and Moroccan law 09-08, you have the following rights, which you may exercise at any time:" },
            { type: "list", items: [
              "Right of access: obtain a copy of the data concerning you.",
              "Right to rectification: correct inaccurate information.",
              "Right to erasure: request the deletion of your data.",
              "Right to restriction of and objection to processing.",
              "Right to portability: receive your data in a structured format.",
            ] },
            { type: "p", text: "To exercise these rights, write to contact@mbnriad.com. We respond within 30 days. You may also lodge a complaint with the competent data protection authority." },
          ],
        },
        {
          heading: "Security",
          blocks: [
            { type: "p", text: "We implement appropriate technical and organisational measures: password encryption, secure connections (HTTPS), restricted data access and regular backups, to protect your information against unauthorised access, loss or disclosure." },
          ],
        },
        {
          heading: "Changes",
          blocks: [
            { type: "p", text: "This policy may be updated to reflect legal or service changes. The last-updated date appears at the top of the page. We encourage you to review it regularly." },
          ],
        },
      ];

  return (
    <LegalPage
      locale={locale}
      current="privacy"
      updated={fr ? "juin 2025" : "June 2025"}
      intro={intro}
      sections={sections}
    />
  );
}
