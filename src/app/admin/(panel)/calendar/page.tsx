import { prisma } from "@/lib/prisma";
import { todayUTC, formatDateHuman } from "@/lib/dates";
import { BlockDatesForm } from "@/components/admin/BlockDatesForm";
import { UnblockButton } from "@/components/admin/UnblockButton";
import { OccupancyGrid } from "@/components/admin/OccupancyGrid";
import { IconCalendar } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function CalendarAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: rawOffset } = await searchParams;
  const offsetDays = Math.max(0, Math.min(180, parseInt(rawOffset || "0", 10)));

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

  const prevOffset = Math.max(0, offsetDays - 28);
  const nextOffset = offsetDays + 28;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-ink">Planning</h1>
        <p className="mt-1 text-sm text-muted">
          Vue d'occupation par chambre et par date.
        </p>
      </div>

      {/* Occupancy grid */}
      <section>
        {/* Navigation */}
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
              <IconCalendar size={14} />
            </span>
            <h2 className="font-serif text-lg text-ink">Grille d'occupation · 28 jours</h2>
          </div>
          <div className="flex items-center gap-2">
            {offsetDays > 0 && (
              <a
                href={`/admin/calendar?offset=${prevOffset}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-terracotta/30 hover:text-terracotta"
              >
                ← Précédent
              </a>
            )}
            {offsetDays === 0 ? (
              <span className="rounded-xl bg-terracotta/10 px-3 py-2 text-sm font-semibold text-terracotta">
                Aujourd'hui
              </span>
            ) : (
              <a
                href="/admin/calendar"
                className="rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-terracotta/30"
              >
                Aujourd'hui
              </a>
            )}
            <a
              href={`/admin/calendar?offset=${nextOffset}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-terracotta/30 hover:text-terracotta"
            >
              Suivant →
            </a>
          </div>
        </div>

        <OccupancyGrid days={28} offsetDays={offsetDays} />
      </section>

      {/* Block dates + blocked list */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <BlockDatesForm rooms={rooms} />
        </div>

        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
            <div className="border-b border-sand-100 bg-sand/30 px-5 py-4">
              <h2 className="font-serif text-lg text-ink">Dates bloquées à venir</h2>
            </div>
            {blocked.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                Aucune date bloquée à venir.
              </p>
            ) : (
              <ul className="divide-y divide-sand-100">
                {blocked.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-8 w-8 shrink-0 rounded-lg"
                        style={{
                          background:
                            "repeating-linear-gradient(-45deg, #D5C9B8 0, #D5C9B8 2px, transparent 2px, transparent 8px)",
                        }}
                      />
                      <div>
                        <span className="text-sm font-medium text-ink">
                          {formatDateHuman(b.date, "fr")}
                        </span>
                        <p className="text-xs text-muted">
                          {b.room ? b.room.name : "Tout le riad"}
                          {b.reason ? ` · ${b.reason}` : ""}
                        </p>
                      </div>
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
