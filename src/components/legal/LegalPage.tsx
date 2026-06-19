import Link from "next/link";
import type { Locale } from "@/i18n/config";

export const CONTACT_EMAIL = "contact@mbndemo.com";

export type PolicySlug =
  | "privacy"
  | "terms"
  | "booking"
  | "cancellation"
  | "cookies";

export const POLICIES: { slug: PolicySlug; fr: string; en: string }[] = [
  { slug: "privacy", fr: "Politique de confidentialité", en: "Privacy Policy" },
  { slug: "terms", fr: "Conditions générales d'utilisation", en: "Terms & Conditions" },
  { slug: "booking", fr: "Conditions de réservation", en: "Booking Terms" },
  { slug: "cancellation", fr: "Annulation & remboursement", en: "Cancellation & Refund Policy" },
  { slug: "cookies", fr: "Politique relative aux cookies", en: "Cookie Policy" },
];

export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

export type LegalSection = { heading: string; blocks: Block[] };

function renderBlock(block: Block, i: number) {
  if (block.type === "p") {
    return <p key={i} className="mt-3 first:mt-0">{block.text}</p>;
  }
  if (block.type === "list") {
    return (
      <ul key={i} className="mt-3 space-y-1.5 pl-1">
        {block.items.map((item, j) => (
          <li key={j} className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terracotta" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  // table
  return (
    <div key={i} className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-sand-300">
            {block.head.map((h, j) => (
              <th key={j} className="py-2 pr-4 font-semibold text-ink">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, j) => (
            <tr key={j} className="border-b border-sand-200">
              {row.map((cell, k) => (
                <td key={k} className="py-2.5 pr-4 align-top text-muted">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalPage({
  locale,
  current,
  updated,
  intro,
  sections,
}: {
  locale: Locale;
  current: PolicySlug;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  const fr = locale === "fr";
  const title = fr
    ? POLICIES.find((p) => p.slug === current)!.fr
    : POLICIES.find((p) => p.slug === current)!.en;

  return (
    <main className="container-page py-12 lg:py-20">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted">
        <Link href={`/${locale}`} className="hover:text-terracotta">
          {fr ? "Accueil" : "Home"}
        </Link>
        <span className="px-1.5">/</span>
        <Link href={`/${locale}/legal`} className="hover:text-terracotta">
          {fr ? "Informations légales" : "Legal"}
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-ink/70">{title}</span>
      </nav>

      <div className="mt-8 gap-12 lg:grid lg:grid-cols-[220px_1fr]">
        {/* Side nav */}
        <aside className="mb-10 lg:mb-0">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {fr ? "Documents légaux" : "Legal documents"}
            </p>
            <ul className="mt-4 space-y-1">
              {POLICIES.map((p) => {
                const active = p.slug === current;
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/${locale}/legal/${p.slug}`}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-terracotta/10 font-medium text-terracotta"
                          : "text-muted hover:bg-sand hover:text-ink"
                      }`}
                    >
                      {fr ? p.fr : p.en}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <article className="max-w-2xl">
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">
            {fr ? "Dernière mise à jour : " : "Last updated: "}
            {updated}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted">{intro}</p>

          <div className="mt-10 space-y-10">
            {sections.map((section, i) => (
              <section key={i}>
                <h2 className="font-serif text-xl text-ink">
                  <span className="text-terracotta">{i + 1}.</span> {section.heading}
                </h2>
                <div className="mt-3 text-sm leading-relaxed text-muted">
                  {section.blocks.map((block, j) => renderBlock(block, j))}
                </div>
              </section>
            ))}
          </div>

          {/* Contact footer */}
          <div className="mt-12 rounded-2xl border border-sand-200 bg-sand/50 p-6">
            <p className="text-sm text-ink">
              {fr ? "Une question sur ce document ?" : "A question about this document?"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {fr ? "Écrivez-nous à " : "Write to us at "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-terracotta hover:underline">
                {CONTACT_EMAIL}
              </a>
              {fr
                ? " — nous répondons sous 24 à 48 heures."
                : " — we reply within 24 to 48 hours."}
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
