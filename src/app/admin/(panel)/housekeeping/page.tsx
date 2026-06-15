import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { HousekeepingBoard } from "@/components/admin/HousekeepingBoard";

export const dynamic = "force-dynamic";

async function updateTaskStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;
  await prisma.housekeepingTask.update({ where: { id }, data: { status } });
  revalidatePath("/admin/housekeeping");
}

async function generateTodayTasks(formData: FormData) {
  "use server";
  void formData;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [departures, arrivals] = await Promise.all([
    prisma.booking.findMany({
      where: { checkOut: today, status: { in: ["confirmed", "completed"] } },
      include: { rooms: { include: { room: true } } },
    }),
    prisma.booking.findMany({
      where: { checkIn: today, status: { in: ["confirmed", "pending"] } },
      include: { rooms: { include: { room: true } } },
    }),
  ]);

  const tasks: { roomName: string; task: string; priority: string; dueDate: Date }[] = [];

  for (const b of departures) {
    for (const br of b.rooms) {
      tasks.push({ roomName: br.room.name, task: "Nettoyage complet après départ", priority: "urgent", dueDate: today });
    }
  }
  for (const b of arrivals) {
    for (const br of b.rooms) {
      tasks.push({ roomName: br.room.name, task: "Préparation chambre avant arrivée", priority: "urgent", dueDate: today });
    }
  }

  // Always add general tasks for the day
  tasks.push({ roomName: "Communs", task: "Nettoyage patio & fontaine", priority: "normal", dueDate: today });
  tasks.push({ roomName: "Communs", task: "Vérification terrasse et jardins", priority: "low", dueDate: today });

  if (tasks.length > 0) {
    await prisma.housekeepingTask.createMany({ data: tasks, skipDuplicates: false });
  }
  revalidatePath("/admin/housekeeping");
}

async function deleteTask(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (id) await prisma.housekeepingTask.delete({ where: { id } });
  revalidatePath("/admin/housekeeping");
}

export default async function HousekeepingPage() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const tasks = await prisma.housekeepingTask.findMany({
    where: { dueDate: today },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });

  const [departures, arrivals] = await Promise.all([
    prisma.booking.count({ where: { checkOut: today, status: { in: ["confirmed", "completed"] } } }),
    prisma.booking.count({ where: { checkIn: today, status: { in: ["confirmed", "pending"] } } }),
  ]);

  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Ménage</h1>
          <p className="mt-1 text-sm text-muted">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}
            {departures} départ{departures !== 1 ? "s" : ""} · {arrivals} arrivée{arrivals !== 1 ? "s" : ""} aujourd'hui
          </p>
        </div>
        {tasks.length === 0 && (
          <form action={generateTodayTasks}>
            <button
              type="submit"
              className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors shadow-sm"
            >
              Générer les tâches du jour
            </button>
          </form>
        )}
      </div>

      {/* Stats */}
      {tasks.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
              <p className="text-xs font-medium text-amber-700 mb-1">À faire</p>
              <p className="text-3xl font-bold text-amber-700">{pending}</p>
              <div className="mt-2 h-1.5 bg-amber-200 rounded-full">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${tasks.length ? (pending / tasks.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5">
              <p className="text-xs font-medium text-blue-700 mb-1">En cours</p>
              <p className="text-3xl font-bold text-blue-700">{inProgress}</p>
              <div className="mt-2 h-1.5 bg-blue-200 rounded-full">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${tasks.length ? (inProgress / tasks.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
              <p className="text-xs font-medium text-emerald-700 mb-1">Terminées</p>
              <p className="text-3xl font-bold text-emerald-700">{done}</p>
              <div className="mt-2 h-1.5 bg-emerald-200 rounded-full">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ink">Progression globale</span>
              <span className="text-sm font-bold text-terracotta">{Math.round((done / tasks.length) * 100)}%</span>
            </div>
            <div className="h-2.5 bg-sand rounded-full overflow-hidden">
              <div className="h-full bg-terracotta rounded-full transition-all duration-500" style={{ width: `${(done / tasks.length) * 100}%` }} />
            </div>
            <p className="text-xs text-muted mt-1.5">{done} / {tasks.length} tâches terminées</p>
          </div>
        </>
      )}

      <HousekeepingBoard tasks={tasks} updateAction={updateTaskStatus} deleteAction={deleteTask} />

      {tasks.length === 0 && (
        <div className="rounded-2xl bg-white border border-sand-200 p-12 text-center">
          <p className="text-2xl mb-3">🧹</p>
          <p className="font-medium text-ink mb-1">Aucune tâche pour aujourd'hui</p>
          <p className="text-sm text-muted">Cliquez sur "Générer les tâches du jour" pour créer automatiquement les tâches basées sur les arrivées et départs.</p>
        </div>
      )}
    </div>
  );
}
