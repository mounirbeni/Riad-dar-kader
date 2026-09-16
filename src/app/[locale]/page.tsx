import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/nav";
import { prisma } from "@/lib/prisma";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { MobileNightHero } from "@/components/MobileNightHero";
import { formatEUR } from "@/lib/money";
import { priceTypeLabel } from "@/lib/pricing";
import { guestWhatsAppLink } from "@/lib/whatsapp";
import { RIAD, siteUrl } from "@/lib/constants";
import { IconArrowRight, IconCalendar, IconStar, IconMapPin, IconShield, IconWifi, IconWind, IconBath, IconCoffee, IconSun } from "@/components/Icons";
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
        ? "MBN DEMO RIAD — Riad traditionnel à Marrakech"
        : "MBN DEMO RIAD — Traditional riad in Marrakech",
    },
    description: fr
      ? "Riad marocain authentique dans la Médina de Marrakech, près du Musée Mouassine. Réservez votre séjour en direct."
      : "Authentic Moroccan riad in the Marrakech Medina, near Musée Mouassine. Book your stay directly.",
    alternates: {
      canonical: `/${fr ? "fr" : "en"}`,
      languages: { fr: "/fr", en: "/en" },
    },
    openGraph: {
      title: "MBN DEMO RIAD",
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
      <MobileNightHero locale={locale} stayHref={localePath(locale, "stay")} />

      {/* Desktop hero — unified with the mobile Night Arrival identity. */}
      <section className="relative hidden min-h-[720px] overflow-hidden bg-[#18130f] xl:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/riad/hero-night-arrival.webp" alt={locale === "fr" ? "Entrée illuminée de MBN DEMO RIAD" : "Illuminated entrance of MBN DEMO RIAD"} className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[#120c08]/65" />
        <div className="container-page relative grid min-h-[720px] grid-cols-[1.05fr_0.95fr] items-center gap-20 py-24">
          <div className="max-w-xl text-white">
            <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.26em] text-[#d8b56a] before:h-px before:w-10 before:bg-[#d8b56a]">
              {locale === "fr" ? "Marrakech · Médina" : "Marrakech · Medina"}
            </p>
            <h1 className="mt-7 whitespace-pre-line font-serif text-7xl leading-[0.88] tracking-[-0.045em] text-white">
              {locale === "fr" ? "Votre séjour\ncommence ici" : "Your stay\nbegins here"}
            </h1>
            <p className="mt-7 max-w-md font-serif text-2xl leading-relaxed text-white/75">
              {locale === "fr" ? "L’authenticité marocaine, le luxe tout en douceur." : "Moroccan authenticity, gentle luxury."}
            </p>
            <p className="mt-12 flex items-center gap-2 text-sm text-white/65"><IconMapPin size={17} className="text-[#d8b56a]" /> {locale === "fr" ? "À deux pas du Musée Mouassine" : "Steps from Musée Mouassine"}</p>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-[#1b130e]/95 p-8 text-white shadow-2xl backdrop-blur-xl">
            <p className="text-center text-xs font-medium uppercase tracking-[0.25em] text-[#d8b56a]">MBN DEMO RIAD</p>
            <h2 className="mt-4 text-center font-serif text-4xl leading-none">{locale === "fr" ? "Réservez votre parenthèse" : "Reserve your escape"}</h2>
            <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.05]">
              <Link href={localePath(locale, "stay")} className="border-r border-white/15 p-5 transition-colors hover:bg-white/5"><span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/55"><IconCalendar size={17} /> {locale === "fr" ? "Arrivée" : "Arrival"}</span><span className="mt-2 block font-serif text-2xl">12 oct. 2026</span></Link>
              <Link href={localePath(locale, "stay")} className="p-5 transition-colors hover:bg-white/5"><span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/55"><IconCalendar size={17} /> {locale === "fr" ? "Départ" : "Departure"}</span><span className="mt-2 block font-serif text-2xl">15 oct. 2026</span></Link>
            </div>
            <Link href={localePath(locale, "stay")} className="mt-4 flex min-h-[62px] items-center justify-center gap-3 rounded-2xl bg-[#bd5a40] px-6 font-serif text-xl text-white transition hover:bg-[#cc694d]"><span>{locale === "fr" ? "Vérifier les disponibilités" : "Check availability"}</span><IconArrowRight size={21} /></Link>
            <p className="mt-5 flex items-center justify-center gap-2 font-serif text-base text-white/70"><IconShield size={19} className="text-[#e8d6b9]" /> {locale === "fr" ? "Réservation directe · sans commission" : "Direct booking · no commission"}</p>
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
                  <PhotoSlot
                    label={locale === "fr" ? extra.nameFr : extra.name}
                    code={`E${i + 1}`}
                    rounded
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
