import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { prisma } from "@/lib/prisma";
import { getGuestSession } from "@/lib/guest-auth";
import { BookingFlow, type ClientExtra } from "@/components/booking/BookingFlow";

// Rendered on-demand (reads active extras from the database).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Réserver votre séjour" : "Book your stay",
    description: fr
      ? "Vérifiez les disponibilités du Mbn Demo Riad et envoyez votre demande de réservation en direct."
      : "Check availability at Mbn Demo Riad and send your reservation request directly.",
    alternates: { languages: { fr: "/fr/sejour", en: "/en/sejour" } },
  };
}

export default async function StayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const dict = getDictionary(locale);

  const [extrasRaw, guestSession] = await Promise.all([
    prisma.extra.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getGuestSession(),
  ]);

  let guestProfile: { id: string; name: string; email: string; phone: string | null } | null = null;
  if (guestSession) {
    const guestUser = await prisma.guestUser.findUnique({ where: { id: guestSession.sub } });
    if (guestUser) guestProfile = { id: guestUser.id, name: guestUser.name, email: guestUser.email, phone: guestUser.phone };
  }

  const extras: ClientExtra[] = extrasRaw.map((e) => ({
    id: e.id,
    name: locale === "fr" ? e.nameFr : e.name,
    description: locale === "fr" ? e.descriptionFr : e.description,
    price: e.price,
    priceType: e.priceType,
  }));

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">
          {dict.stay.title}
        </h1>
        <p className="mt-3 text-muted">{dict.stay.subtitle}</p>
      </div>

      <BookingFlow locale={locale} dict={dict} extras={extras} guestProfile={guestProfile} />
    </div>
  );
}
