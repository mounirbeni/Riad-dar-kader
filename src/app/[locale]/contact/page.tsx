import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ContactForm } from "@/components/ContactForm";
import { guestWhatsAppLink } from "@/lib/whatsapp";
import { contactEmail } from "@/lib/constants";
import { IconMail, IconMapPin } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: "Contact",
    description: fr
      ? "Contactez le Mbn Riad à Marrakech par WhatsApp ou email."
      : "Contact Mbn Riad in Marrakech by WhatsApp or email.",
    alternates: { languages: { fr: "/fr/contact", en: "/en/contact" } },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "fr") as Locale;
  const dict = getDictionary(locale);
  const t = dict.contact;

  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">{t.title}</h1>
        <p className="mt-4 text-muted">{t.subtitle}</p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <a
            href={guestWhatsAppLink(locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-card transition hover:shadow-soft"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z" />
              </svg>
            </span>
            <div>
              <h2 className="font-serif text-lg text-ink">{t.whatsappTitle}</h2>
              <p className="text-sm text-muted">{t.whatsappText}</p>
            </div>
          </a>

          <a
            href={`mailto:${contactEmail()}`}
            className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-card transition hover:shadow-soft"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
              <IconMail size={22} />
            </span>
            <div>
              <h2 className="font-serif text-lg text-ink">{t.emailTitle}</h2>
              <p className="text-sm text-muted">{contactEmail()}</p>
            </div>
          </a>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brass/15 text-brass">
              <IconMapPin size={22} />
            </span>
            <div>
              <h2 className="font-serif text-lg text-ink">{t.locationTitle}</h2>
              <p className="text-sm text-muted">{t.locationText}</p>
            </div>
          </div>
        </div>

        <ContactForm dict={dict} />
      </div>
    </div>
  );
}
