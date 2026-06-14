import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/nav";
import { prisma } from "@/lib/prisma";
import { PhotoSlot } from "@/components/PhotoSlot";
import { formatMAD } from "@/lib/money";
import { priceTypeLabel } from "@/lib/pricing";

// Rendered on-demand (reads extras from the database).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Expériences & extras" : "Experiences & extras",
    description: fr
      ? "Petit-déjeuner marocain, dîner sur la terrasse, hammam, visites guidées et plus encore à Marrakech."
      : "Moroccan breakfast, dinner on the terrace, hammam, guided tours and more in Marrakech.",
    alternates: { languages: { fr: "/fr/experiences", en: "/en/experiences" } },
  };
}

export default async function ExperiencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const dict = getDictionary(locale);
  const t = dict.experiences;

  const extras = await prisma.extra.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <p className="kicker">Marrakech</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">{t.title}</h1>
        <p className="mt-4 text-muted">{t.subtitle}</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {extras.map((extra, i) => (
          <article key={extra.id} className="card overflow-hidden">
            <PhotoSlot
              label={locale === "fr" ? extra.nameFr : extra.name}
              code={`E${i + 1}`}
              ratio="16:10"
              variant={i}
              rounded={false}
              className="aspect-[16/10] w-full"
            />
            <div className="p-6">
              <h2 className="font-serif text-xl text-ink">
                {locale === "fr" ? extra.nameFr : extra.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {locale === "fr" ? extra.descriptionFr : extra.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium text-terracotta">
                  {extra.price > 0
                    ? formatMAD(extra.price, locale)
                    : locale === "fr"
                      ? "Sur demande"
                      : "On request"}
                </span>
                {extra.price > 0 && (
                  <span className="text-xs text-muted">
                    {priceTypeLabel(extra.priceType, locale)}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-white p-8 text-center">
        <p className="text-muted">{t.addAtBooking}</p>
        <Link href={localePath(locale, "stay")} className="btn-primary mt-5">
          {dict.nav.book}
        </Link>
      </div>
    </div>
  );
}
