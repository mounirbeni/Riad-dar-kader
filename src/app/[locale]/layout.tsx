import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { BottomNav } from "@/components/BottomNav";
import { DemoBanner } from "@/components/DemoBanner";
import { getGuestSession } from "@/lib/guest-auth";
import { prisma } from "@/lib/prisma";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  let unreadCount: number | undefined;
  try {
    const session = await getGuestSession();
    if (session) {
      unreadCount = await prisma.bookingMessage.count({
        where: {
          booking: { OR: [{ guestUserId: session.sub }, { guestEmail: session.email }] },
          sender: "admin",
          isRead: false,
        },
      });
    }
  } catch {
    // non-fatal — badge simply won't show
  }

  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <Header locale={locale as Locale} dict={dict} />
      {/* pb-16 on mobile to clear the fixed bottom nav; removed on lg+ */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer locale={locale as Locale} dict={dict} />
      <BottomNav locale={locale as Locale} unreadCount={unreadCount} />
      <WhatsAppFloat locale={locale as Locale} />
      <DemoBanner />
    </div>
  );
}
