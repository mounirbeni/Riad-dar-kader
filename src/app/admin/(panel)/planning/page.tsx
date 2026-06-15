import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PlanningBoard } from "@/components/admin/PlanningBoard";
import { QuickMessages } from "@/components/admin/QuickMessages";

export const dynamic = "force-dynamic";

function toDateOnly(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function addEntryAction(formData: FormData) {
  "use server";
  const dateStr = String(formData.get("date") || "");
  const time = String(formData.get("time") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const assignee = String(formData.get("assignee") || "").trim() || null;
  const category = String(formData.get("category") || "general");
  if (!dateStr || !time || !title) return;
  const date = new Date(dateStr + "T00:00:00Z");
  await prisma.scheduleEntry.create({ data: { date, time, title, description, location, assignee, category } });
  revalidatePath("/admin/planning");
}

async function updateEntryAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const time = String(formData.get("time") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const assignee = String(formData.get("assignee") || "").trim() || null;
  const category = String(formData.get("category") || "general");
  if (!id || !time || !title) return;
  await prisma.scheduleEntry.update({ where: { id }, data: { time, title, description, location, assignee, category } });
  revalidatePath("/admin/planning");
}

async function deleteEntryAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (id) await prisma.scheduleEntry.delete({ where: { id } });
  revalidatePath("/admin/planning");
}

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;

  // Parse requested date or default to today
  const selectedDate = dateParam
    ? new Date(dateParam + "T00:00:00Z")
    : toDateOnly(new Date());

  const nextDay = new Date(selectedDate);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const prevDay = new Date(selectedDate);
  prevDay.setUTCDate(prevDay.getUTCDate() - 1);

  const dateStr = selectedDate.toISOString().slice(0, 10);
  const prevStr = prevDay.toISOString().slice(0, 10);
  const nextStr = nextDay.toISOString().slice(0, 10);

  // Fetch custom schedule entries for this day
  const entries = await prisma.scheduleEntry.findMany({
    where: { date: selectedDate },
    orderBy: { time: "asc" },
  });

  // Fetch real bookings for this day (arrivals + departures)
  const [arrivals, departures] = await Promise.all([
    prisma.booking.findMany({
      where: { checkIn: selectedDate, status: { in: ["confirmed", "pending"] } },
      include: { rooms: { include: { room: true } } },
    }),
    prisma.booking.findMany({
      where: { checkOut: selectedDate, status: { in: ["confirmed", "completed"] } },
      include: { rooms: { include: { room: true } } },
    }),
  ]);

  // Auto-events derived from live bookings (not stored, just shown)
  type AutoEvent = { time: string; title: string; location: string; category: string; bookingRef: string };
  const autoEvents: AutoEvent[] = [
    ...arrivals.map((b) => ({
      time: "15:00",
      title: `Arrivée — ${b.guestName}`,
      location: b.rooms.map((r) => r.room.name).join(", "),
      category: "arrival",
      bookingRef: b.reference,
    })),
    ...departures.map((b) => ({
      time: "11:00",
      title: `Départ — ${b.guestName}`,
      location: b.rooms.map((r) => r.room.name).join(", "),
      category: "departure",
      bookingRef: b.reference,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  const arrivalProps = arrivals.map((b) => ({
    guestName: b.guestName,
    rooms: b.rooms.map((r) => r.room.name).join(", "),
    ref: b.reference,
    guests: b.guests,
  }));
  const departureProps = departures.map((b) => ({
    guestName: b.guestName,
    rooms: b.rooms.map((r) => r.room.name).join(", "),
    ref: b.reference,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ink">Planning</h1>
        <p className="mt-1 text-sm text-muted">Planification journalière · messages WhatsApp</p>
      </div>

      <PlanningBoard
        dateStr={dateStr}
        prevStr={prevStr}
        nextStr={nextStr}
        entries={entries}
        autoEvents={autoEvents}
        addAction={addEntryAction}
        updateAction={updateEntryAction}
        deleteAction={deleteEntryAction}
      />

      <QuickMessages
        dateStr={dateStr}
        arrivals={arrivalProps}
        departures={departureProps}
      />
    </div>
  );
}
