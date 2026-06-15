"use client";

import { useState } from "react";

type Task = {
  id: string;
  roomName: string;
  task: string;
  priority: string;
  status: string;
  assignee: string | null;
  notes: string | null;
};

type Props = {
  tasks: Task[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
};

const STATUS_CYCLE: Record<string, string> = {
  pending: "in_progress",
  in_progress: "done",
  done: "pending",
};

export function HousekeepingBoard({ tasks, updateAction, deleteAction }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "in_progress", "done"] as const).map((f) => {
          const labels = { all: "Toutes", pending: "À faire", in_progress: "En cours", done: "Terminées" };
          const count = f === "all" ? tasks.length : tasks.filter((t) => t.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                filter === f ? "bg-terracotta text-white" : "bg-white border border-sand-200 text-muted hover:text-ink"
              }`}
            >
              {labels[f]}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-sand"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.map((task) => (
          <div
            key={task.id}
            className={`rounded-2xl bg-white border shadow-sm p-4 transition-all ${
              task.status === "done" ? "border-emerald-200 opacity-70" : "border-sand-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <form action={updateAction} className="mt-0.5 shrink-0">
                <input type="hidden" name="id" value={task.id} />
                <input type="hidden" name="status" value={STATUS_CYCLE[task.status] ?? "pending"} />
                <button
                  type="submit"
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
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
                  {task.status === "in_progress" && <div className="h-2 w-2 rounded-full bg-white" />}
                </button>
              </form>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted" : "text-ink"}`}>
                    {task.task}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-muted">{task.roomName}</span>
                  {task.assignee && (
                    <>
                      <span className="text-xs text-muted">·</span>
                      <span className="text-xs text-muted">👤 {task.assignee}</span>
                    </>
                  )}
                  {task.notes && (
                    <>
                      <span className="text-xs text-muted">·</span>
                      <span className="text-xs text-muted italic">{task.notes}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={task.status} />
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={task.id} />
                  <button
                    type="submit"
                    className="h-6 w-6 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Supprimer"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    urgent: "bg-red-100 text-red-600",
    normal: "bg-sand text-muted",
    low: "bg-slate-100 text-slate-500",
  };
  const labels: Record<string, string> = { urgent: "Urgent", normal: "Normal", low: "Faible" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[priority] ?? "bg-sand text-muted"}`}>{labels[priority] ?? priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    done: "bg-emerald-100 text-emerald-700",
  };
  const labels: Record<string, string> = { pending: "À faire", in_progress: "En cours", done: "Terminé" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${map[status] ?? "bg-sand text-muted"}`}>{labels[status] ?? status}</span>;
}
