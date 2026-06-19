import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function saveSetting(formData: FormData) {
  "use server";
  const entries = Array.from(formData.entries()) as [string, string][];
  for (const [key, value] of entries) {
    if (!key.startsWith("setting_")) continue;
    const settingKey = key.replace("setting_", "");
    await prisma.siteSetting.upsert({
      where: { key: settingKey },
      update: { value },
      create: { key: settingKey, value },
    });
  }
  revalidatePath("/admin/content");
}

const CONTENT_FIELDS = [
  {
    section: "Informations générales",
    fields: [
      { key: "riad_name", label: "Nom du Riad", type: "text", placeholder: "Mbn Demo Riad" },
      { key: "riad_tagline", label: "Accroche principale", type: "text", placeholder: "Séjour de luxe au cœur de Marrakech" },
      { key: "riad_email", label: "Email de contact", type: "email", placeholder: "contact@darkader.ma" },
      { key: "riad_phone", label: "Téléphone WhatsApp", type: "text", placeholder: "+212 6XX XXX XXX" },
      { key: "riad_address", label: "Adresse", type: "text", placeholder: "Derb Sidi Bouamar, Médina, Marrakech" },
    ],
  },
  {
    section: "Page d'accueil",
    fields: [
      { key: "home_hero_title", label: "Titre hero", type: "text", placeholder: "Un havre de paix au cœur de la médina" },
      { key: "home_hero_subtitle", label: "Sous-titre hero", type: "textarea", placeholder: "Découvrez l'authenticité de Marrakech..." },
      { key: "home_cta_label", label: "Bouton CTA principal", type: "text", placeholder: "Réserver votre séjour" },
    ],
  },
  {
    section: "SEO",
    fields: [
      { key: "meta_title", label: "Titre méta (SEO)", type: "text", placeholder: "Mbn Demo Riad — Riad de luxe à Marrakech" },
      { key: "meta_description", label: "Description méta (SEO)", type: "textarea", placeholder: "Séjournez dans notre riad authentique..." },
    ],
  },
  {
    section: "Réseaux sociaux",
    fields: [
      { key: "social_instagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/darkader" },
      { key: "social_facebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/darkader" },
    ],
  },
];

export default async function ContentPage() {
  const settings = await prisma.siteSetting.findMany();
  const settingMap = new Map(settings.map((s) => [s.key, s.value]));

  const totalFields = CONTENT_FIELDS.reduce((s, g) => s + g.fields.length, 0);
  const filledFields = CONTENT_FIELDS.reduce(
    (s, g) => s + g.fields.filter((f) => settingMap.has(f.key)).length,
    0
  );
  const completePct = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ink">Contenu du site</h1>
        <p className="mt-1 text-sm text-muted">Modifiez les textes et informations affichés sur le site public</p>
      </div>

      {/* Completion indicator */}
      <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink">Complétude du contenu</span>
          <span className="text-sm font-bold text-terracotta">{completePct}%</span>
        </div>
        <div className="h-2 bg-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-terracotta rounded-full transition-all"
            style={{ width: `${completePct}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-1.5">{filledFields} / {totalFields} champs renseignés</p>
      </div>

      <form action={saveSetting} className="space-y-6">
        {CONTENT_FIELDS.map((group) => (
          <div key={group.section} className="rounded-2xl bg-white border border-sand-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-sand-200 bg-sand/30">
              <h2 className="font-semibold text-ink">{group.section}</h2>
            </div>
            <div className="p-6 space-y-5">
              {group.fields.map((field) => {
                const value = settingMap.get(field.key) ?? "";
                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-ink mb-1.5" htmlFor={`field-${field.key}`}>
                      {field.label}
                      {!value && (
                        <span className="ml-2 text-[10px] font-normal text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                          Non renseigné
                        </span>
                      )}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={`field-${field.key}`}
                        name={`setting_${field.key}`}
                        defaultValue={value}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full rounded-xl border border-sand-200 px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
                      />
                    ) : (
                      <input
                        id={`field-${field.key}`}
                        type={field.type}
                        name={`setting_${field.key}`}
                        defaultValue={value}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-sand-200 px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-terracotta px-6 py-2.5 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors shadow-sm"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
