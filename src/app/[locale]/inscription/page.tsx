import type { Locale } from "@/i18n/config";
import { isLocale } from "@/i18n/config";
import { RegisterForm } from "./form";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const { returnTo } = await searchParams;

  return <RegisterForm locale={locale} returnTo={returnTo || `/${locale}`} />;
}
