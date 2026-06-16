import { redirect } from "next/navigation";
import Link from "next/link";
import { getGuestSession } from "@/lib/guest-auth";
import { GuestLoginForm } from "@/components/guest/GuestLoginForm";
import { getDictionary } from "@/i18n/dictionaries";
import { AuthShell } from "@/components/guest/AuthShell";
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
  const fr = locale !== "en";

  return (
    <AuthShell locale={locale}>
      <div>
        <h1 className="font-serif text-3xl text-ink">{t.loginTitle}</h1>
        <p className="mt-2 text-sm text-muted">{t.loginSubtitle}</p>

        <div className="mt-8">
          <GuestLoginForm locale={locale} />
        </div>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Link
              href={`/${locale}/compte/mot-de-passe-oublie`}
              className="text-sm text-muted transition hover:text-terracotta"
            >
              {t.forgotPassword}
            </Link>
          </div>
          <div className="relative flex items-center gap-4">
            <div className="h-px flex-1 bg-sand-200" />
            <span className="text-[11px] uppercase tracking-widest text-muted/50">
              {fr ? "ou" : "or"}
            </span>
            <div className="h-px flex-1 bg-sand-200" />
          </div>
          <p className="text-center text-sm text-muted">
            {t.noAccount}{" "}
            <Link
              href={`/${locale}/compte/inscription`}
              className="font-semibold text-terracotta hover:underline"
            >
              {t.createAccount}
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
