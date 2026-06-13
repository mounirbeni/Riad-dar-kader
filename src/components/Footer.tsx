import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath, type NavKey } from "@/i18n/nav";
import type { Dictionary } from "@/i18n/dictionaries";
import { guestWhatsAppLink } from "@/lib/whatsapp";
import { contactEmail } from "@/lib/constants";

const LINKS: NavKey[] = ["home", "riad", "stay", "experiences", "gallery", "contact"];

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-24 border-t border-sand-200 bg-terracotta text-sand">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <h3 className="font-serif text-2xl text-white">Riad Dar Kader</h3>
          <p className="mt-3 max-w-sm text-sm text-sand/80">{dict.footer.tagline}</p>
          <p className="mt-4 text-xs uppercase tracking-widest text-brass-light">
            {dict.footer.directBooking}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brass-light">
            {dict.footer.explore}
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {LINKS.map((key) => (
              <li key={key}>
                <Link
                  href={localePath(locale, key)}
                  className="text-sand/80 transition hover:text-white"
                >
                  {dict.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brass-light">
            {dict.footer.contact}
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-sand/80">
            <li>{dict.contact.locationText}</li>
            <li>
              <a href={`mailto:${contactEmail()}`} className="hover:text-white">
                {contactEmail()}
              </a>
            </li>
            <li>
              <a
                href={guestWhatsAppLink(locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-sand/60 sm:flex-row">
          <span>
            © {new Date().getFullYear()} Riad Dar Kader. {dict.footer.rights}
          </span>
          <span>Marrakech · Maroc</span>
        </div>
      </div>
    </footer>
  );
}
