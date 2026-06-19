import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Politique relative aux cookies — Mbn Demo Riad" : "Cookie Policy — Mbn Demo Riad",
    robots: { index: false },
  };
}

export default async function CookiePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const fr = locale === "fr";

  const intro = fr
    ? "Cette politique explique ce que sont les cookies, lesquels sont utilisés sur le site du Mbn Demo Riad et comment vous pouvez les gérer. Notre approche est volontairement minimaliste : nous n'utilisons que les cookies strictement nécessaires au fonctionnement du site, sans publicité ni profilage."
    : "This policy explains what cookies are, which ones are used on the Mbn Demo Riad website and how you can manage them. Our approach is deliberately minimal: we use only the cookies strictly necessary for the site to work, with no advertising or profiling.";

  const sections: LegalSection[] = fr
    ? [
        { heading: "Qu'est-ce qu'un cookie ?", blocks: [
          { type: "p", text: "Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone) par le site que vous consultez. Il permet de mémoriser certaines informations, comme votre session de connexion ou votre langue préférée, afin d'améliorer votre expérience de navigation." },
        ] },
        { heading: "Cookies utilisés sur ce site", blocks: [
          { type: "p", text: "Nous utilisons uniquement des cookies dits « essentiels » ou « strictement nécessaires » :" },
          { type: "table", head: ["Cookie", "Finalité", "Durée"], rows: [
            ["Session voyageur", "Vous garder connecté à votre compte de façon sécurisée", "Durée de la session / jusqu'à la déconnexion"],
            ["Préférence de langue", "Mémoriser le choix FR / EN", "Jusqu'à 12 mois"],
          ] },
          { type: "p", text: "Ces cookies ne nécessitent pas votre consentement car ils sont indispensables au fonctionnement du site et à la fourniture du service que vous demandez." },
        ] },
        { heading: "Ce que nous n'utilisons pas", blocks: [
          { type: "list", items: [
            "Aucun cookie publicitaire ou de reciblage (retargeting).",
            "Aucun outil de mesure d'audience tiers à des fins marketing.",
            "Aucun cookie de réseaux sociaux déposé à votre insu.",
            "Aucune revente ni partage de données de navigation.",
          ] },
        ] },
        { heading: "Cookies tiers", blocks: [
          { type: "p", text: "Lorsque vous cliquez sur un lien externe (par exemple WhatsApp ou une carte), le site tiers concerné peut déposer ses propres cookies, soumis à sa propre politique. Nous vous invitons à consulter les politiques de ces services." },
        ] },
        { heading: "Gérer ou supprimer les cookies", blocks: [
          { type: "p", text: "Vous pouvez à tout moment configurer votre navigateur pour accepter, refuser ou supprimer les cookies. La marche à suivre figure dans la rubrique d'aide de votre navigateur (Chrome, Safari, Firefox, Edge, etc.). Notez toutefois que le blocage des cookies essentiels peut vous empêcher de vous connecter à votre compte ou d'utiliser certaines fonctionnalités." },
        ] },
        { heading: "Mise à jour de la politique", blocks: [
          { type: "p", text: "Si nous venions à introduire de nouveaux cookies, cette page serait mise à jour en conséquence et, le cas échéant, votre consentement serait recueilli avant tout dépôt de cookie non essentiel." },
        ] },
      ]
    : [
        { heading: "What is a cookie?", blocks: [
          { type: "p", text: "A cookie is a small text file placed on your device (computer, tablet, smartphone) by the website you are visiting. It stores certain information, such as your login session or preferred language, to improve your browsing experience." },
        ] },
        { heading: "Cookies used on this site", blocks: [
          { type: "p", text: "We use only so-called “essential” or “strictly necessary” cookies:" },
          { type: "table", head: ["Cookie", "Purpose", "Duration"], rows: [
            ["Traveller session", "Keep you securely signed in to your account", "Session duration / until sign-out"],
            ["Language preference", "Remember the FR / EN choice", "Up to 12 months"],
          ] },
          { type: "p", text: "These cookies do not require your consent because they are essential to the operation of the site and to delivering the service you request." },
        ] },
        { heading: "What we do not use", blocks: [
          { type: "list", items: [
            "No advertising or retargeting cookies.",
            "No third-party audience-measurement tools for marketing.",
            "No social-media cookies placed without your knowledge.",
            "No resale or sharing of browsing data.",
          ] },
        ] },
        { heading: "Third-party cookies", blocks: [
          { type: "p", text: "When you click an external link (for example WhatsApp or a map), the third-party site concerned may set its own cookies, subject to its own policy. We encourage you to review the policies of those services." },
        ] },
        { heading: "Managing or deleting cookies", blocks: [
          { type: "p", text: "You can configure your browser at any time to accept, refuse or delete cookies. Instructions are available in your browser's help section (Chrome, Safari, Firefox, Edge, etc.). Please note that blocking essential cookies may prevent you from logging into your account or using certain features." },
        ] },
        { heading: "Updates to this policy", blocks: [
          { type: "p", text: "Should we introduce new cookies, this page would be updated accordingly and, where applicable, your consent would be obtained before any non-essential cookie is set." },
        ] },
      ];

  return (
    <LegalPage
      locale={locale}
      current="cookies"
      updated={fr ? "juin 2025" : "June 2025"}
      intro={intro}
      sections={sections}
    />
  );
}
