import { prisma } from "@/lib/prisma";
import { todayUTC, formatDateHuman } from "@/lib/dates";
import { BlockDatesForm } from "@/components/admin/BlockDatesForm";
import { UnblockButton } from "@/components/admin/UnblockButton";
import { OccupancyGrid } from "@/components/admin/OccupancyGrid";
import { IconCalendar, IconArrowLeft, IconArrowRight } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function CalendarAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: rawYear } = await searchParams;
  const currentYear = todayUTC().getUTCFullYear();
  const year = rawYear ? Math.min(Math.max(parseInt(rawYear, 10), 2020), currentYear + 5) : currentYear;

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-ink">Planning</h1>
        <p className="mt-1 text-sm text-muted">Vue d'occupation par chambre — année complète.</p>
      </div>

      {/* Occupancy grid */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
              <IconCalendar size={14} />
            </span>
            <h2 className="font-serif text-lg text-ink">Grille d'occupation</h2>
          </div>

          {/* Year navigation */}
          <div className="flex items-center gap-1.5">
            <a
              href={`/admin/calendar?year=${year - 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-sand-200 bg-white text-muted hover:border-terracotta/30 hover:text-terracotta transition-colors"
            >
              <IconArrowLeft size={14} />
            </a>
            <span className="rounded-xl border border-terracotta/20 bg-terracotta/5 px-4 py-1.5 text-sm font-bold text-terracotta min-w-[72px] text-center">
              {year}
            </span>
            <a
              href={`/admin/calendar?year=${year + 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-sand-200 bg-white text-muted hover:border-terracotta/30 hover:text-terracotta transition-colors"
            >
              <IconArrowRight size={14} />
            </a>
            {year !== currentYear && (
              <a
                href="/admin/calendar"
                className="ml-2 rounded-lg border border-sand-200 bg-white px-3 py-1.5 text-xs font-medium text-muted hover:border-terracotta/30 hover:text-terracotta transition-colors"
              >
                Année courante
              </a>
            )}
          </div>
        </div>

        <OccupancyGrid year={year} />
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
              <p className="px-5 py-8 text-center text-sm text-muted">Aucune date bloquée à venir.</p>
            ) : (
              <ul className="divide-y divide-sand-100">
                {blocked.map((b) => (
                  <li key={b.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-8 w-8 shrink-0 rounded-lg"
                        style={{ background: "repeating-linear-gradient(-45deg, #D5C9B8 0, #D5C9B8 2px, transparent 2px, transparent 8px)" }}
                      />
                      <div>
                        <span className="text-sm font-medium text-ink">{formatDateHuman(b.date, "fr")}</span>
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
