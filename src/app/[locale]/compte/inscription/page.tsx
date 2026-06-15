import { redirect } from "next/navigation";
import Link from "next/link";
import { getGuestSession } from "@/lib/guest-auth";
import { GuestSignupForm } from "@/components/guest/GuestSignupForm";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export default async function GuestSignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getGuestSession();
  if (session) redirect(`/${locale}/compte`);
  const dict = getDictionary(locale as Locale);
  const t = dict.account;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10 ring-1 ring-terracotta/20">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-ink">{t.signupTitle}</h1>
          <p className="mt-1.5 text-sm text-muted">{t.signupSubtitle}</p>
        </div>

        <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-7">
          <GuestSignupForm locale={locale} />

          <div className="mt-5 pt-5 border-t border-sand-200 text-center">
            <p className="text-sm text-muted">
              {t.alreadyAccount}{" "}
              <Link href={`/${locale}/compte/connexion`} className="font-medium text-terracotta hover:underline">
                {t.signIn}
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          {t.bookingLinkNote}
        </p>
      </div>
    </div>
  );
}
