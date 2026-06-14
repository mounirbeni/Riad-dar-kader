import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/nav";
import { prisma } from "@/lib/prisma";
import { Placeholder } from "@/components/Placeholder";
import { PhotoSlot } from "@/components/PhotoSlot";
import { formatMAD } from "@/lib/money";
import { guestWhatsAppLink } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/constants";
import {
  IconUser,
  IconBed,
  IconEye,
  IconMaximize,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconWifi,
  IconWind,
  IconThermometer,
  IconBath,
  IconCoffee,
  IconShield,
  IconSun,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

// Recommended real photos per room: 1 main + 3 detail shots.
const ROOM_PHOTO_TARGET = 4;

type IconCmp = ComponentType<{ size?: number; className?: string }>;

// amenity key → icon
const AMENITY_ICON: Record<string, IconCmp> = {
  wifi: IconWifi,
  ac: IconWind,
  heating: IconThermometer,
  ensuite: IconBath,
  breakfast: IconCoffee,
  safe: IconShield,
  terrace: IconSun,
  tea: IconCoffee,
};

async function getRoom(slug: string) {
  return prisma.room.findFirst({ where: { slug, isActive: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const fr = locale !== "en";
  const room = await getRoom(slug);
  if (!room) return { title: fr ? "Chambre" : "Room" };
  const desc = fr ? room.description : room.descriptionEn || room.description;
  return {
    title: room.name,
    description: desc.slice(0, 160),
    alternates: {
      languages: {
        fr: `/fr/chambres/${slug}`,
        en: `/en/chambres/${slug}`,
      },
    },
    openGraph: {
      title: `${room.name} · Riad Dar Kader`,
      description: desc.slice(0, 160),
      url: `${siteUrl()}/${fr ? "fr" : "en"}/chambres/${slug}`,
      type: "website",
    },
  };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const dict = getDictionary(locale);
  const t = dict.rooms;

  const room = await getRoom(slug);
  if (!room) notFound();

  const fr = locale === "fr";
  const desc = fr ? room.description : room.descriptionEn || room.description;
  const bedKey = room.bedType as keyof typeof t.bed | null;
  const viewKey = room.view as keyof typeof t.views | null;

  const otherRooms = await prisma.room.findMany({
    where: { isActive: true, slug: { not: slug } },
    orderBy: { sortOrder: "asc" },
    take: 3,
  });

  const specs: { icon: IconCmp; label: string; value: string }[] = [
    {
      icon: IconUser,
      label: t.capacityLabel,
      value: `${t.upTo} ${room.capacity} ${dict.common.guests}`,
    },
  ];
  if (bedKey && t.bed[bedKey]) {
    specs.push({ icon: IconBed, label: t.bedLabel, value: t.bed[bedKey] });
  }
  if (viewKey && t.views[viewKey]) {
    specs.push({ icon: IconEye, label: t.viewLabel, value: t.views[viewKey] });
  }
  if (room.sizeM2) {
    specs.push({ icon: IconMaximize, label: t.sizeLabel, value: `${room.sizeM2} m²` });
  }

  const photos = room.photos ?? [];

  return (
    <div className="pb-4">
      {/* Hero */}
      <section className="relative">
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[0]} alt={room.name} className="h-[44vh] w-full object-cover" />
        ) : (
          <PhotoSlot
            label={`${room.name} — ${fr ? "photo principale" : "main photo"}`}
            code={`${room.slug}-1`}
            ratio="16:9"
            variant={room.sortOrder}
            rounded={false}
            className="h-[44vh] w-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="container-page absolute inset-0 flex flex-col justify-end pb-8 text-white">
          <Link
            href={localePath(locale, "rooms")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/80 transition hover:text-white"
          >
            <IconArrowLeft size={15} />
            {t.backToRooms}
          </Link>
          <p className="kicker text-brass-light">{t.kicker}</p>
          <h1 className="mt-1 font-serif text-4xl sm:text-5xl">{room.name}</h1>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Left: details */}
        <div className="space-y-10">
          {/* Specs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {specs.map((s) => (
              <div key={s.label} className="rounded-2xl border border-sand-200 bg-white p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
                  <s.icon size={18} />
                </span>
                <p className="mt-3 text-[11px] uppercase tracking-wide text-muted">{s.label}</p>
                <p className="text-sm font-medium text-ink">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Overview */}
          <div>
            <h2 className="font-serif text-2xl text-ink">{t.overview}</h2>
            <p className="mt-3 leading-relaxed text-muted">{desc}</p>
          </div>

          {/* Amenities */}
          {room.amenities.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl text-ink">{t.amenitiesTitle}</h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {room.amenities.map((key) => {
                  const Icon = AMENITY_ICON[key] || IconCheck;
                  const label = (t.amenities as Record<string, string>)[key] || key;
                  return (
                    <li
                      key={key}
                      className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 text-brass">
                        <Icon size={16} />
                      </span>
                      <span className="text-sm text-ink">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Extra photos — real ones if present, otherwise numbered slots */}
          {photos.length > 1 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photos.slice(1).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`${room.name} ${i + 2}`}
                  className="aspect-square w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          ) : (
            <div>
              <h2 className="font-serif text-2xl text-ink">
                {fr ? "Photos de la chambre" : "Room photos"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {fr
                  ? `${ROOM_PHOTO_TARGET} photos recommandées pour cette chambre.`
                  : `${ROOM_PHOTO_TARGET} photos recommended for this room.`}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: ROOM_PHOTO_TARGET - 1 }).map((_, i) => (
                  <PhotoSlot
                    key={i}
                    label={fr ? `Détail ${i + 1}` : `Detail ${i + 1}`}
                    code={`${room.slug}-${i + 2}`}
                    ratio="1:1"
                    variant={room.sortOrder + i + 1}
                    className="aspect-square w-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: booking card (sticky on desktop) */}
        <aside className="lg:sticky lg:top-20">
          <div className="card p-6">
            <p className="text-sm text-muted">{dict.common.from}</p>
            <p className="font-serif text-3xl text-terracotta">
              {formatMAD(room.basePrice, locale)}
              <span className="ml-1 text-sm font-normal text-muted">{t.perNight}</span>
            </p>
            <Link href={localePath(locale, "stay")} className="btn-primary mt-5 w-full">
              {t.checkAvailability}
            </Link>
            <a
              href={guestWhatsAppLink(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-3 w-full"
            >
              {dict.common.whatsapp}
            </a>
            <p className="mt-4 text-center text-xs text-muted">
              {dict.common.finalConfirmation}
            </p>
          </div>
        </aside>
      </div>

      {/* Other rooms */}
      {otherRooms.length > 0 && (
        <section className="bg-white py-14">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-2xl text-ink sm:text-3xl">{t.otherRooms}</h2>
              <Link
                href={localePath(locale, "rooms")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta"
              >
                {t.backToRooms}
                <IconArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {otherRooms.map((r, i) => (
                <Link
                  key={r.id}
                  href={`${localePath(locale, "rooms")}/${r.slug}`}
                  className="card group overflow-hidden"
                >
                  <Placeholder
                    label={r.name}
                    variant={i + 2}
                    rounded={false}
                    className="aspect-[4/3] w-full"
                  />
                  <div className="flex items-center justify-between p-4">
                    <span className="font-serif text-lg text-ink">{r.name}</span>
                    <span className="text-sm font-medium text-terracotta">
                      {formatMAD(r.basePrice, locale)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
