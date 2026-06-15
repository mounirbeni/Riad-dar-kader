import type { Locale } from "@/i18n/config";
import { isLocale } from "@/i18n/config";
import { LoginForm } from "./form";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const { returnTo } = await searchParams;

  return <LoginForm locale={locale} returnTo={returnTo || `/${locale}`} />;
}
