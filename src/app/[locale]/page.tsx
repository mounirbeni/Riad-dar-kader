import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/nav";
import { prisma } from "@/lib/prisma";
import { Placeholder } from "@/components/Placeholder";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { HeroText } from "@/components/HeroText";
import { formatEUR } from "@/lib/money";
import { priceTypeLabel } from "@/lib/pricing";
import { guestWhatsAppLink } from "@/lib/whatsapp";
import { RIAD, siteUrl } from "@/lib/constants";
import { IconStar, IconMapPin, IconShield, IconWifi, IconWind, IconBath, IconCoffee, IconSun } from "@/components/Icons";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";

// Icons that correspond to the 3 selling points (atmosphere, location, direct booking)
const SELLING_ICONS: ReactNode[] = [
  <IconStar key="star" size={22} />,
  <IconMapPin key="pin" size={22} />,
  <IconShield key="shield" size={22} />,
];

// Icons for the 8 amenity items
const AMENITY_ICONS: ReactNode[] = [
  <IconSun key="patio" size={18} />,
  <IconSun key="terrace" size={18} />,
  <IconBath key="hammam" size={18} />,
  <IconCoffee key="breakfast" size={18} />,
  <IconWifi key="wifi" size={18} />,
  <IconWind key="ac" size={18} />,
  <IconStar key="welcome" size={18} />,
  <IconMapPin key="medina" size={18} />,
];

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
        ? "Mbn Riad — Riad traditionnel à Marrakech"
        : "Mbn Riad — Traditional riad in Marrakech",
    },
    description: fr
      ? "Riad marocain authentique dans la Médina de Marrakech, près du Musée Mouassine. Réservez votre séjour en direct."
      : "Authentic Moroccan riad in the Marrakech Medina, near Musée Mouassine. Book your stay directly.",
    alternates: {
      canonical: `/${fr ? "fr" : "en"}`,
      languages: { fr: "/fr", en: "/en" },
    },
    openGraph: {
      title: "Mbn Riad",
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
      {/* Hero — mobile/tablet: full-bleed; desktop xl+: two-column split */}
      <section className="relative overflow-hidden xl:flex xl:min-h-screen">
        {/* Full-bleed background (mobile/tablet only) */}
        <Placeholder
          variant={0}
          rounded={false}
          className="absolute inset-0 h-full w-full xl:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-terracotta-dark/75 via-terracotta/55 to-ink/70 xl:hidden" />
        {/* Photo-slot marker for the hero background (mobile/tablet) */}
        <span className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-terracotta xl:hidden">
          H1 · Photo — {locale === "fr" ? "Façade / Patio" : "Façade / Patio"}
        </span>

        {/* Left pane — text */}
        <div className="relative xl:flex xl:w-[52%] xl:shrink-0 xl:flex-col xl:items-start xl:justify-center xl:bg-terracotta-dark">
          {/* Zellige overlay on desktop */}
          <div className="absolute inset-0 hidden bg-zellige opacity-10 xl:block" />
          <HeroText
            kicker={t.heroKicker}
            title={t.heroTitle}
            subtitle={t.heroSubtitle}
            ctaLabel={t.heroCta}
            ctaHref={localePath(locale, "stay")}
            secondaryLabel={t.heroSecondary}
            secondaryHref={localePath(locale, "riad")}
            openingNote={t.openingNote}
            directLabel={
              locale === "fr"
                ? "Réservation directe · sans frais de plateforme"
                : "Direct booking · no platform fees"
            }
          />
        </div>

        {/* Right pane — visual (xl+ only) */}
        <div className="relative hidden xl:block xl:flex-1">
          <PhotoSlot
            label={locale === "fr" ? "Ambiance du riad — patio / terrasse" : "Riad ambiance — patio / terrace"}
            code="H2"
            ratio="Portrait"
            variant={1}
            rounded={false}
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-terracotta-dark/25" />
          <div className="absolute bottom-8 left-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/30 px-5 py-2.5 text-sm text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brass-light" />
              Médina de Marrakech · Maroc
            </span>
          </div>
        </div>
      </section>

      {/* Selling points */}
      <section className="container-page py-20">
        <Reveal>
          <h2 className="text-center font-serif text-3xl text-ink sm:text-4xl">
            {t.sellingTitle}
          </h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {t.selling.map((point, i) => (
            <RevealItem key={i} className="card p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                {SELLING_ICONS[i]}
              </div>
              <h3 className="mt-5 font-serif text-xl text-ink">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{point.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Amenities */}
      <section className="bg-white py-16">
        <div className="container-page">
          <Reveal>
            <h2 className="text-center font-serif text-2xl text-ink sm:text-3xl">
              {t.amenitiesTitle}
            </h2>
          </Reveal>
          <RevealGroup className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {t.amenities.map((label, i) => (
              <RevealItem key={i} className="flex items-center gap-3 rounded-xl border border-sand-200 bg-sand px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                  {AMENITY_ICONS[i]}
                </span>
                <span className="text-sm text-ink/80">{label}</span>
              </RevealItem>
            ))}
          </RevealGroup>
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
          <Link href={localePath(locale, "rooms")} className="btn-outline">
            {t.roomsCta}
          </Link>
        </div>
        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <RevealItem key={room.id}>
              <Link
                href={`${localePath(locale, "rooms")}/${room.slug}`}
                className="card group block h-full overflow-hidden transition-shadow hover:shadow-soft"
              >
                {room.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={room.photos[0]}
                    alt={room.name}
                    className="aspect-[4/3] w-full object-cover transition group-hover:opacity-95"
                  />
                ) : (
                  <PhotoSlot
                    label={`${room.name} — ${locale === "fr" ? "photo principale" : "main photo"}`}
                    code={`${room.slug}-1`}
                    ratio="4:3"
                    variant={i + 1}
                    rounded={false}
                    className="aspect-[4/3] w-full"
                  />
                )}
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
                      {dict.common.from} {formatEUR(room.basePrice, locale)}
                    </span>
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
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
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {extras.map((extra, i) => (
              <RevealItem key={extra.id}>
                <div className="rounded-2xl bg-sand p-6 h-full">
                  <Placeholder
                    variant={i + 2}
                    className="mb-4 aspect-square w-14"
                  />
                  <h3 className="font-serif text-lg text-ink">
                    {locale === "fr" ? extra.nameFr : extra.name}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-brass">
                    {formatEUR(extra.price, locale)}{" "}
                    <span className="text-xs font-normal text-muted">
                      {priceTypeLabel(extra.priceType, locale)}
                    </span>
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <TestimonialsCarousel reviews={t.testimonials} title={t.testimonialsTitle} />

      {/* Gallery teaser */}
      <section className="container-page py-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Galerie</p>
              <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">{t.galleryTitle}</h2>
            </div>
            <Link href={localePath(locale, "gallery")} className="btn-outline">
              {t.galleryCta}
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <PhotoSlot
              key={i}
              label={locale === "fr" ? `Galerie ${i + 1}` : `Gallery ${i + 1}`}
              code={`G${i + 1}`}
              ratio="Square"
              variant={i + 2}
              rounded
              className="aspect-square w-full"
            />
          ))}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="container-page py-20">
        <Reveal>
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
        </Reveal>
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
    priceRange: "€85 - €160",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Patio" },
      { "@type": "LocationFeatureSpecification", name: "Terrasse" },
    ],
  };
}
