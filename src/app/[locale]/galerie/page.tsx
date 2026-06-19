import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Reveal } from "@/components/Reveal";
import { GalleryGrid } from "@/components/GalleryGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Galerie" : "Gallery",
    description: fr
      ? "Les visuels du Mbn Demo Riad à Marrakech. Photos réelles à venir."
      : "Visuals of Mbn Demo Riad in Marrakech. Real photos coming soon.",
    alternates: { languages: { fr: "/fr/galerie", en: "/en/galerie" } },
  };
}

const CAPTIONS_FR = [
  "Patio central",
  "Terrasse panoramique",
  "Chambre Mouassine",
  "Salon marocain",
  "Détail zellige",
  "Cour intérieure",
  "Coin thé",
  "Façade discrète",
  "Suite Terrasse",
  "Escalier traditionnel",
  "Lanternes",
  "Petit-déjeuner",
];
const CAPTIONS_EN = [
  "Central patio",
  "Rooftop terrace",
  "Mouassine room",
  "Moroccan lounge",
  "Zellige detail",
  "Inner courtyard",
  "Tea corner",
  "Discreet façade",
  "Terrace suite",
  "Traditional staircase",
  "Lanterns",
  "Breakfast",
];

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const dict = getDictionary(locale);
  const captions = locale === "fr" ? CAPTIONS_FR : CAPTIONS_EN;

  return (
    <div className="container-page py-16">
      <Reveal>
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            {dict.gallery.title}
          </h1>
          <p className="mt-4 text-muted">{dict.gallery.subtitle}</p>
          <span className="mt-4 inline-block rounded-full bg-brass/10 px-3 py-1 text-xs font-medium text-brass">
            {dict.gallery.placeholderNote}
          </span>
        </div>
      </Reveal>

      <GalleryGrid captions={captions} />
    </div>
  );
}
