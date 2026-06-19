import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/nav";
import { Placeholder } from "@/components/Placeholder";
import { PhotoSlot } from "@/components/PhotoSlot";
import { IconWalk } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Le Riad" : "The Riad",
    description: fr
      ? "Découvrez Mbn Demo Riad, riad traditionnel restauré au cœur de la Médina de Marrakech."
      : "Discover Mbn Demo Riad, a traditional riad restored in the heart of the Marrakech Medina.",
    alternates: { languages: { fr: "/fr/le-riad", en: "/en/le-riad" } },
  };
}

export default async function RiadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const dict = getDictionary(locale);
  const t = dict.riad;

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <Placeholder variant={2} rounded={false} className="h-[42vh] w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        <span className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-terracotta">
          LR1 · Photo — {locale === "fr" ? "Ambiance du riad" : "Riad ambiance"}
        </span>
        <div className="container-page absolute inset-0 flex flex-col justify-end pb-10 text-white">
          <p className="kicker text-brass-light">{t.kicker}</p>
          <h1 className="mt-2 font-serif text-5xl sm:text-6xl">{t.title}</h1>
        </div>
      </section>

      {/* Story */}
      <section className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">
              {t.storyTitle}
            </h2>
            <p className="mt-5 leading-relaxed text-muted">{t.story}</p>
          </div>
          <PhotoSlot label={locale === "fr" ? "Le patio" : "The patio"} code="LR2" ratio="4:3" variant={3} className="aspect-[4/3]" />
        </div>
      </section>

      {/* Style + architecture */}
      <section className="bg-white py-16">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl bg-sand p-8">
            <h3 className="font-serif text-2xl text-terracotta">{t.styleTitle}</h3>
            <p className="mt-3 leading-relaxed text-muted">{t.styleText}</p>
          </div>
          <div className="rounded-2xl bg-sand p-8">
            <h3 className="font-serif text-2xl text-terracotta">
              {t.architectureTitle}
            </h3>
            <p className="mt-3 leading-relaxed text-muted">
              {t.architectureText}
            </p>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <PhotoSlot
            label={locale === "fr" ? "La Médina" : "The Medina"}
            code="LR3"
            ratio="4:3"
            variant={4}
            className="order-2 aspect-[4/3] lg:order-1"
          />
          <div className="order-1 lg:order-2">
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">
              {t.locationTitle}
            </h2>
            <p className="mt-5 leading-relaxed text-muted">{t.locationText}</p>

            <h3 className="mt-8 font-serif text-xl text-terracotta">
              {t.walkingTitle}
            </h3>
            <ul className="mt-4 space-y-3">
              {t.walking.map((w) => (
                <li
                  key={w.place}
                  className="flex items-center justify-between border-b border-sand-200 pb-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-ink">
                    <IconWalk size={14} className="shrink-0 text-muted" />
                    {w.place}
                  </span>
                  <span className="font-medium text-brass">{w.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Placeholder gallery */}
      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="font-serif text-3xl text-ink">{dict.gallery.title}</h2>
          <p className="mt-2 text-sm text-muted">{dict.gallery.placeholderNote}</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <PhotoSlot
                key={i}
                label={locale === "fr" ? "Photo galerie" : "Gallery photo"}
                code={`G${i + 1}`}
                ratio="1:1"
                variant={i}
                className="aspect-square"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Future positioning */}
      <section className="container-page py-16">
        <div className="card bg-terracotta p-10 text-center text-white sm:p-14">
          <h2 className="font-serif text-3xl sm:text-4xl">{t.futureTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">{t.futureText}</p>
          <Link href={localePath(locale, "stay")} className="btn-gold mt-7">
            {dict.nav.book}
          </Link>
        </div>
      </section>
    </>
  );
}
