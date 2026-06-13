import { prisma } from "@/lib/prisma";
import { RoomForm } from "@/components/admin/RoomForm";

export const dynamic = "force-dynamic";

export default async function RoomsAdminPage() {
  const rooms = await prisma.room.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-ink">Chambres</h1>
        <p className="mt-1 text-sm text-muted">
          Gérez les {rooms.length} chambres, leurs capacités et leurs prix.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {rooms.map((room) => (
          <RoomForm
            key={room.id}
            room={{
              id: room.id,
              name: room.name,
              slug: room.slug,
              description: room.description,
              capacity: room.capacity,
              basePrice: room.basePrice,
              isActive: room.isActive,
              sortOrder: room.sortOrder,
            }}
          />
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-serif text-xl text-ink">Ajouter une chambre</h2>
        <div className="max-w-2xl">
          <RoomForm />
        </div>
      </div>
    </div>
  );
}
