import { redirect } from "next/navigation";
import Link from "next/link";
import { getGuestSession } from "@/lib/guest-auth";
import { GuestSignupForm } from "@/components/guest/GuestSignupForm";
import { getDictionary } from "@/i18n/dictionaries";
import { AuthShell } from "@/components/guest/AuthShell";
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
  const fr = locale !== "en";

  return (
    <AuthShell locale={locale}>
      <div>
        <h1 className="font-serif text-3xl text-ink">{t.signupTitle}</h1>
        <p className="mt-2 text-sm text-muted">{t.signupSubtitle}</p>

        <div className="mt-8">
          <GuestSignupForm locale={locale} />
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          {t.alreadyAccount}{" "}
          <Link
            href={`/${locale}/compte/connexion`}
            className="font-semibold text-terracotta hover:underline"
          >
            {t.signIn}
          </Link>
        </p>

        <p className="mt-5 text-center text-xs leading-relaxed text-muted/70">
          {t.bookingLinkNote}
        </p>
      </div>
    </AuthShell>
  );
}
