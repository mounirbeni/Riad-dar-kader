import { prisma } from "@/lib/prisma";
import { ExtraForm } from "@/components/admin/ExtraForm";

export const dynamic = "force-dynamic";

export default async function ExtrasAdminPage() {
  const extras = await prisma.extra.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-ink">Extras & expériences</h1>
        <p className="mt-1 text-sm text-muted">
          Activez, désactivez et fixez les prix des extras proposés aux voyageurs.
        </p>
      </div>

      <div className="space-y-5">
        {extras.map((extra) => (
          <div key={extra.id} className="relative">
            {!extra.isActive && (
              <span className="absolute right-4 top-4 z-10 rounded-full bg-sand-300 px-3 py-1 text-xs text-muted">
                Désactivé
              </span>
            )}
            <ExtraForm
              extra={{
                id: extra.id,
                slug: extra.slug,
                name: extra.name,
                nameFr: extra.nameFr,
                description: extra.description,
                descriptionFr: extra.descriptionFr,
                price: extra.price,
                priceType: extra.priceType,
                isActive: extra.isActive,
                sortOrder: extra.sortOrder,
              }}
            />
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-serif text-xl text-ink">Ajouter un extra</h2>
        <ExtraForm />
      </div>
    </div>
  );
}
