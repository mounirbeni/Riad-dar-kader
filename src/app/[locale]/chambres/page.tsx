import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/nav";
import { prisma } from "@/lib/prisma";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { formatEUR } from "@/lib/money";
import { IconUser, IconArrowRight, IconEye } from "@/components/Icons";

// Reads rooms from the database — render on demand.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Chambres & suites" : "Rooms & suites",
    description: fr
      ? "Découvrez les sept chambres et suites du Mbn Demo Riad à Marrakech, chacune habillée d'artisanat marocain."
      : "Discover the seven rooms and suites of Mbn Demo Riad in Marrakech, each dressed in Moroccan craftsmanship.",
    alternates: { languages: { fr: "/fr/chambres", en: "/en/chambres" } },
  };
}

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const dict = getDictionary(locale);
  const t = dict.rooms;

  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container-page py-16">
      <Reveal>
        <div className="max-w-2xl">
          <p className="kicker">{t.kicker}</p>
          <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">{t.title}</h1>
          <p className="mt-4 text-muted">{t.subtitle}</p>
        </div>
      </Reveal>

      <RevealGroup className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, i) => {
          const href = `${localePath(locale, "rooms")}/${room.slug}`;
          const desc =
            locale === "fr" ? room.description : room.descriptionEn || room.description;
          const viewKey = room.view as keyof typeof t.views | null;
          return (
            <RevealItem key={room.id}>
            <article className="card group flex flex-col overflow-hidden h-full">
              <Link href={href} className="relative block">
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
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-terracotta backdrop-blur-sm">
                  {dict.common.from} {formatEUR(room.basePrice, locale)}
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-serif text-xl text-ink">{room.name}</h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <IconUser size={13} />
                    {t.upTo} {room.capacity} {dict.common.guests}
                  </span>
                  {viewKey && t.views[viewKey] && (
                    <span className="flex items-center gap-1">
                      <IconEye size={13} />
                      {t.views[viewKey]}
                    </span>
                  )}
                </div>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                  {desc}
                </p>
                <Link
                  href={href}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-terracotta transition hover:gap-2.5"
                >
                  {t.viewRoom}
                  <IconArrowRight size={15} />
                </Link>
              </div>
            </article>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
}
