"use client";

import { useState } from "react";

type Priority = "urgent" | "normal" | "low";
type TaskStatus = "pending" | "in_progress" | "done";

type Task = {
  id: string;
  room: string;
  task: string;
  priority: Priority;
  status: TaskStatus;
  assignee: string;
  dueTime: string;
};

const INITIAL_TASKS: Task[] = [
  { id: "1", room: "Suite Atlas", task: "Nettoyage complet après départ", priority: "urgent", status: "pending", assignee: "Fatima", dueTime: "11:00" },
  { id: "2", room: "Chambre Sahara", task: "Changement de draps et serviettes", priority: "normal", status: "in_progress", assignee: "Aicha", dueTime: "10:30" },
  { id: "3", room: "Chambre Médina", task: "Vérification minibar et amenities", priority: "low", status: "done", assignee: "Karima", dueTime: "09:00" },
  { id: "4", room: "Suite Jardin", task: "Préparation pour arrivée VIP", priority: "urgent", status: "pending", assignee: "Fatima", dueTime: "14:00" },
  { id: "5", room: "Chambre Terrace", task: "Nettoyage de la terrasse privée", priority: "normal", status: "pending", assignee: "Aicha", dueTime: "12:00" },
  { id: "6", room: "Communs", task: "Nettoyage patio & fontaine", priority: "normal", status: "in_progress", assignee: "Karima", dueTime: "13:00" },
  { id: "7", room: "Communs", task: "Vérification piscine et jardins", priority: "low", status: "pending", assignee: "Hassan", dueTime: "15:00" },
  { id: "8", room: "Suite Atlas", task: "Mise en place décoration florale", priority: "normal", status: "pending", assignee: "Fatima", dueTime: "15:30" },
];

const STATUS_ORDER: TaskStatus[] = ["pending", "in_progress", "done"];

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  function cycleStatus(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = STATUS_ORDER[(STATUS_ORDER.indexOf(t.status) + 1) % STATUS_ORDER.length];
        return { ...t, status: next };
      })
    );
  }

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ink">Ménage</h1>
        <p className="mt-1 text-sm text-muted">Tâches du jour · {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Progress cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <p className="text-xs font-medium text-amber-700 mb-1">À faire</p>
          <p className="text-3xl font-bold text-amber-700">{pending}</p>
          <div className="mt-2 h-1.5 bg-amber-200 rounded-full">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(pending / tasks.length) * 100}%` }} />
          </div>
        </div>
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5">
          <p className="text-xs font-medium text-blue-700 mb-1">En cours</p>
          <p className="text-3xl font-bold text-blue-700">{inProgress}</p>
          <div className="mt-2 h-1.5 bg-blue-200 rounded-full">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(inProgress / tasks.length) * 100}%` }} />
          </div>
        </div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
          <p className="text-xs font-medium text-emerald-700 mb-1">Terminées</p>
          <p className="text-3xl font-bold text-emerald-700">{done}</p>
          <div className="mt-2 h-1.5 bg-emerald-200 rounded-full">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(done / tasks.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink">Progression globale</span>
          <span className="text-sm font-bold text-terracotta">{Math.round((done / tasks.length) * 100)}%</span>
        </div>
        <div className="h-2.5 bg-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-terracotta rounded-full transition-all duration-500"
            style={{ width: `${(done / tasks.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-1.5">{done} / {tasks.length} tâches terminées</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "in_progress", "done"] as const).map((f) => {
          const labels = { all: "Toutes", pending: "À faire", in_progress: "En cours", done: "Terminées" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-terracotta text-white"
                  : "bg-white border border-sand-200 text-muted hover:text-ink"
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <div
            key={task.id}
            className={`rounded-2xl bg-white border shadow-sm p-4 transition-all ${
              task.status === "done" ? "border-emerald-200 opacity-70" : "border-sand-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Status toggle */}
              <button
                onClick={() => cycleStatus(task.id)}
                className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.status === "done"
                    ? "bg-emerald-500 border-emerald-500"
                    : task.status === "in_progress"
                    ? "bg-blue-400 border-blue-400"
                    : "border-sand-300 hover:border-terracotta"
                }`}
                title="Changer le statut"
              >
                {task.status === "done" && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {task.status === "in_progress" && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted" : "text-ink"}`}>
                    {task.task}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-muted">{task.room}</span>
                  <span className="text-xs text-muted">·</span>
                  <span className="text-xs text-muted">👤 {task.assignee}</span>
                  <span className="text-xs text-muted">·</span>
                  <span className="text-xs text-muted">🕐 {task.dueTime}</span>
                </div>
              </div>

              <StatusBadge status={task.status} />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl bg-white border border-sand-200 p-12 text-center">
          <p className="text-muted text-sm">Aucune tâche dans cette catégorie.</p>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map = {
    urgent: "bg-red-100 text-red-600",
    normal: "bg-sand text-muted",
    low: "bg-slate-100 text-slate-500",
  };
  const labels = { urgent: "Urgent", normal: "Normal", low: "Faible" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[priority]}`}>{labels[priority]}</span>;
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    done: "bg-emerald-100 text-emerald-700",
  };
  const labels = { pending: "À faire", in_progress: "En cours", done: "Terminé" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${map[status]}`}>{labels[status]}</span>;
}
