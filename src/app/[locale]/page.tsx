import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/nav";
import { prisma } from "@/lib/prisma";
import { Placeholder } from "@/components/Placeholder";
import { formatMAD } from "@/lib/money";
import { priceTypeLabel } from "@/lib/pricing";
import { guestWhatsAppLink } from "@/lib/whatsapp";
import { RIAD, siteUrl } from "@/lib/constants";

// Rendered on-demand so the build doesn't require a live database and admin
// content changes appear immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: {
      absolute: fr
        ? "Riad Dar Kader — Riad traditionnel à Marrakech"
        : "Riad Dar Kader — Traditional riad in Marrakech",
    },
    description: fr
      ? "Riad marocain authentique dans la Médina de Marrakech, près du Musée Mouassine. Réservez votre séjour en direct."
      : "Authentic Moroccan riad in the Marrakech Medina, near Musée Mouassine. Book your stay directly.",
    alternates: {
      canonical: `/${fr ? "fr" : "en"}`,
      languages: { fr: "/fr", en: "/en" },
    },
    openGraph: {
      title: "Riad Dar Kader",
      description: fr
        ? "Riad traditionnel au cœur de la Médina de Marrakech."
        : "A traditional riad in the heart of the Marrakech Medina.",
      url: `${siteUrl()}/${fr ? "fr" : "en"}`,
      images: ["/og-image.svg"],
      type: "website",
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const dict = getDictionary(locale);
  const t = dict.home;

  const [rooms, extras] = await Promise.all([
    prisma.room.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
    prisma.extra.findMany({
      where: { isActive: true, price: { gt: 0 } },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Placeholder
          variant={0}
          rounded={false}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-terracotta-dark/70 via-terracotta/50 to-ink/60" />
        <div className="container-page relative flex min-h-[78vh] flex-col items-start justify-center py-20 text-white">
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur-sm">
            {t.heroKicker}
          </span>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl md:text-7xl">
            {t.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/90">{t.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={localePath(locale, "stay")} className="btn-primary">
              {t.heroCta}
            </Link>
            <Link
              href={localePath(locale, "riad")}
              className="btn border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              {t.heroSecondary}
            </Link>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-brass/90 px-4 py-2 text-sm font-medium text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {t.openingNote}
          </div>
        </div>
      </section>

      {/* Selling points */}
      <section className="container-page py-20">
        <h2 className="text-center font-serif text-3xl text-ink sm:text-4xl">
          {t.sellingTitle}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.selling.map((point, i) => (
            <div key={i} className="card p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                <span className="font-serif text-xl">{i + 1}</span>
              </div>
              <h3 className="mt-5 font-serif text-xl text-ink">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{point.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pattern-divider" />

      {/* Rooms preview */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Marrakech</p>
            <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
              {t.roomsTitle}
            </h2>
            <p className="mt-3 max-w-xl text-muted">{t.roomsText}</p>
          </div>
          <Link href={localePath(locale, "stay")} className="btn-outline">
            {t.roomsCta}
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <article key={room.id} className="card overflow-hidden">
              <Placeholder
                label={room.name}
                variant={i + 1}
                rounded={false}
                className="aspect-[4/3] w-full"
              />
              <div className="p-5">
                <h3 className="font-serif text-xl text-ink">{room.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {room.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {room.capacity} {dict.common.guests}
                  </span>
                  <span className="font-medium text-terracotta">
                    {dict.common.from} {formatMAD(room.basePrice, locale)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Extras preview */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Extras</p>
              <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
                {t.extrasTitle}
              </h2>
              <p className="mt-3 max-w-xl text-muted">{t.extrasText}</p>
            </div>
            <Link href={localePath(locale, "experiences")} className="btn-outline">
              {t.extrasCta}
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {extras.map((extra, i) => (
              <div key={extra.id} className="rounded-2xl bg-sand p-6">
                <Placeholder
                  variant={i + 2}
                  className="mb-4 aspect-square w-14"
                />
                <h3 className="font-serif text-lg text-ink">
                  {locale === "fr" ? extra.nameFr : extra.name}
                </h3>
                <p className="mt-2 text-sm font-medium text-brass">
                  {formatMAD(extra.price, locale)}{" "}
                  <span className="text-xs font-normal text-muted">
                    {priceTypeLabel(extra.priceType, locale)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="container-page py-20">
        <div className="card relative overflow-hidden bg-terracotta p-10 text-center text-white sm:p-16">
          <div className="absolute inset-0 bg-zellige opacity-30" />
          <div className="relative">
            <h2 className="font-serif text-3xl sm:text-4xl">{t.whatsappTitle}</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/85">{t.whatsappText}</p>
            <a
              href={guestWhatsAppLink(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-7"
            >
              {dict.common.whatsapp}
            </a>
          </div>
        </div>
      </section>

      {/* LodgingBusiness JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(lodgingSchema()),
        }}
      />
    </>
  );
}

function lodgingSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: RIAD.name,
    description:
      "Riad traditionnel marocain au cœur de la Médina de Marrakech, près du Musée Mouassine.",
    url: siteUrl(),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Marrakech",
      addressRegion: "Marrakech-Safi",
      addressCountry: "MA",
      streetAddress: "Médina, près du Musée Mouassine",
    },
    priceRange: "MAD 850 - 1600",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Patio" },
      { "@type": "LocationFeatureSpecification", name: "Terrasse" },
    ],
  };
}
