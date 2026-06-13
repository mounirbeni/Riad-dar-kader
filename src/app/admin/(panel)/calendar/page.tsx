import { prisma } from "@/lib/prisma";
import { todayUTC, formatDateHuman } from "@/lib/dates";
import { BlockDatesForm } from "@/components/admin/BlockDatesForm";
import { UnblockButton } from "@/components/admin/UnblockButton";

export const dynamic = "force-dynamic";

export default async function CalendarAdminPage() {
  const today = todayUTC();
  const [rooms, blocked] = await Promise.all([
    prisma.room.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.blockedDate.findMany({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
      include: { room: { select: { name: true } } },
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-ink">Dates bloquées</h1>
        <p className="mt-1 text-sm text-muted">
          Empêchez les réservations sur certaines dates (tout le riad ou une chambre).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <BlockDatesForm rooms={rooms} />
        </div>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="border-b border-sand-200 px-5 py-4">
              <h2 className="font-serif text-lg text-ink">Dates bloquées à venir</h2>
            </div>
            {blocked.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                Aucune date bloquée à venir.
              </p>
            ) : (
              <ul className="divide-y divide-sand-200">
                {blocked.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <span className="text-sm font-medium text-ink">
                        {formatDateHuman(b.date, "fr")}
                      </span>
                      <span className="ml-2 text-xs text-muted">
                        {b.room ? b.room.name : "Tout le riad"}
                        {b.reason ? ` · ${b.reason}` : ""}
                      </span>
                    </div>
                    <UnblockButton id={b.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
