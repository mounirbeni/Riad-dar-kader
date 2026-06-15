import { redirect } from "next/navigation";
import Link from "next/link";
import { getGuestSession } from "@/lib/guest-auth";
import { GuestLoginForm } from "@/components/guest/GuestLoginForm";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export default async function GuestLoginPage({
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
          <h1 className="font-serif text-2xl text-ink">{t.loginTitle}</h1>
          <p className="mt-1.5 text-sm text-muted">{t.loginSubtitle}</p>
        </div>

        <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-7">
          <GuestLoginForm locale={locale} />

          <div className="mt-5 pt-5 border-t border-sand-200 space-y-3 text-center">
            <p className="text-sm text-muted">
              <Link href={`/${locale}/compte/mot-de-passe-oublie`} className="font-medium text-terracotta hover:underline">
                {t.forgotPassword}
              </Link>
            </p>
            <p className="text-sm text-muted">
              {t.noAccount}{" "}
              <Link href={`/${locale}/compte/inscription`} className="font-medium text-terracotta hover:underline">
                {t.createAccount}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
