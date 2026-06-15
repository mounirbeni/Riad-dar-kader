"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconShare } from "@/components/Icons";

type Entry = {
  id: string;
  time: string;
  title: string;
  description: string | null;
  location: string | null;
  assignee: string | null;
  category: string;
};

type AutoEvent = {
  time: string;
  title: string;
  location: string;
  category: string;
  bookingRef: string;
};

type Props = {
  dateStr: string;
  prevStr: string;
  nextStr: string;
  entries: Entry[];
  autoEvents: AutoEvent[];
  addAction: (fd: FormData) => Promise<void>;
  updateAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
};

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  arrival:    { label: "Arrivée",    emoji: "🛬", color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200" },
  departure:  { label: "Départ",    emoji: "🛫", color: "text-blue-700",    bg: "bg-blue-50",     border: "border-blue-200" },
  housekeeping:{ label: "Ménage",   emoji: "🧹", color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200" },
  service:    { label: "Service",   emoji: "🛎️", color: "text-purple-700",  bg: "bg-purple-50",   border: "border-purple-200" },
  meal:       { label: "Repas",     emoji: "🍽️", color: "text-orange-700",  bg: "bg-orange-50",   border: "border-orange-200" },
  general:    { label: "Général",   emoji: "📌", color: "text-ink",         bg: "bg-sand/40",     border: "border-sand-200" },
};

function formatDateFR(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function formatDateShortFR(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function PlanningBoard({ dateStr, prevStr, nextStr, entries, autoEvents, addAction, updateAction, deleteAction }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Merge auto events + custom entries into one sorted list
  type TimelineItem =
    | { kind: "auto"; event: AutoEvent; key: string }
    | { kind: "entry"; entry: Entry };

  const timeline: TimelineItem[] = [
    ...autoEvents.map((e, i) => ({ kind: "auto" as const, event: e, key: `auto-${i}` })),
    ...entries.map((e) => ({ kind: "entry" as const, entry: e })),
  ].sort((a, b) => {
    const ta = a.kind === "auto" ? a.event.time : a.entry.time;
    const tb = b.kind === "auto" ? b.event.time : b.entry.time;
    return ta.localeCompare(tb);
  });

  function shareWhatsApp() {
    const text = buildWhatsAppText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  function copyText() {
    const text = buildWhatsAppText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function navigate(to: string) {
    startTransition(() => router.push(`/admin/planning?date=${to}`));
  }

  const isToday = dateStr === new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Date navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(prevStr)}
            className="h-9 w-9 rounded-xl border border-sand-200 bg-white flex items-center justify-center text-muted hover:text-ink hover:border-ink/20 transition-colors"
            title="Jour précédent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-ink capitalize min-w-[200px] text-center">
            {formatDateFR(dateStr)}
          </div>

          <button
            onClick={() => navigate(nextStr)}
            className="h-9 w-9 rounded-xl border border-sand-200 bg-white flex items-center justify-center text-muted hover:text-ink hover:border-ink/20 transition-colors"
            title="Jour suivant"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {!isToday && (
            <button
              onClick={() => navigate(new Date().toISOString().slice(0, 10))}
              className="rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              Aujourd'hui
            </button>
          )}
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyText}
            className="flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            {copied ? "✓ Copié !" : "📋 Copier le texte"}
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ebe5d] transition-colors shadow-sm"
          >
            <IconShare size={15} />
            Partager WhatsApp
          </button>
        </div>
      </div>

      {/* Quick date picker */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {Array.from({ length: 14 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i - 2);
          const ds = d.toISOString().slice(0, 10);
          const isSelected = ds === dateStr;
          const isTodayItem = ds === new Date().toISOString().slice(0, 10);
          return (
            <button
              key={ds}
              onClick={() => navigate(ds)}
              className={`shrink-0 rounded-xl px-3 py-2 text-center transition-colors ${
                isSelected
                  ? "bg-terracotta text-white font-semibold"
                  : isTodayItem
                  ? "border-2 border-terracotta text-terracotta font-medium bg-white"
                  : "border border-sand-200 bg-white text-muted hover:text-ink"
              }`}
            >
              <div className="text-[10px] uppercase">{new Date(ds + "T00:00:00Z").toLocaleDateString("fr-FR", { weekday: "short", timeZone: "UTC" })}</div>
              <div className="text-sm font-bold">{new Date(ds + "T00:00:00Z").getUTCDate()}</div>
              <div className="text-[9px]">{formatDateShortFR(ds).split(" ")[1]}</div>
            </button>
          );
        })}
      </div>

      {/* Stats bar */}
      {(autoEvents.length > 0 || entries.length > 0) && (
        <div className="flex gap-3 flex-wrap">
          {autoEvents.filter((e) => e.category === "arrival").length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700">
              🛬 {autoEvents.filter((e) => e.category === "arrival").length} arrivée{autoEvents.filter((e) => e.category === "arrival").length > 1 ? "s" : ""}
            </span>
          )}
          {autoEvents.filter((e) => e.category === "departure").length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700">
              🛫 {autoEvents.filter((e) => e.category === "departure").length} départ{autoEvents.filter((e) => e.category === "departure").length > 1 ? "s" : ""}
            </span>
          )}
          {entries.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-sand border border-sand-200 px-3 py-1.5 text-xs font-medium text-muted">
              📌 {entries.length} tâche{entries.length > 1 ? "s" : ""} planifiée{entries.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-2xl bg-white border border-sand-200 shadow-sm overflow-hidden">
        {timeline.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="font-medium text-ink mb-1">Aucune activité ce jour</p>
            <p className="text-sm text-muted">Cliquez sur "+ Ajouter" pour planifier une tâche</p>
          </div>
        ) : (
          <div className="divide-y divide-sand-200/60">
            {timeline.map((item) => {
              if (item.kind === "auto") {
                const cfg = CATEGORY_CONFIG[item.event.category] ?? CATEGORY_CONFIG.general;
                return (
                  <div key={item.key} className={`flex items-start gap-4 px-5 py-4 ${cfg.bg}`}>
                    <div className="w-14 shrink-0 text-right">
                      <span className="text-sm font-bold text-ink">{item.event.time}</span>
                    </div>
                    <div className={`w-px self-stretch ${cfg.border.replace("border-", "bg-")}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base">{cfg.emoji}</span>
                        <span className={`text-sm font-semibold ${cfg.color}`}>{item.event.title}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          {cfg.label} · auto
                        </span>
                      </div>
                      {item.event.location && (
                        <p className="text-xs text-muted mt-0.5">📍 {item.event.location}</p>
                      )}
                      <p className="text-[10px] text-muted/60 mt-0.5 font-mono">{item.event.bookingRef}</p>
                    </div>
                  </div>
                );
              }

              const e = item.entry;
              const cfg = CATEGORY_CONFIG[e.category] ?? CATEGORY_CONFIG.general;

              if (editId === e.id) {
                return (
                  <form
                    key={e.id}
                    action={async (fd) => {
                      await updateAction(fd);
                      setEditId(null);
                    }}
                    className="px-5 py-4 bg-sand/20 space-y-3"
                  >
                    <input type="hidden" name="id" value={e.id} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Heure</label>
                        <input type="time" name="time" defaultValue={e.time} required className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" />
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Titre</label>
                        <input type="text" name="title" defaultValue={e.title} required className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Catégorie</label>
                        <select name="category" defaultValue={e.category} className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30">
                          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.emoji} {v.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Lieu</label>
                        <input type="text" name="location" defaultValue={e.location ?? ""} placeholder="Chambre, patio…" className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Responsable</label>
                        <input type="text" name="assignee" defaultValue={e.assignee ?? ""} placeholder="Prénom…" className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Note (optionnel)</label>
                      <input type="text" name="description" defaultValue={e.description ?? ""} placeholder="Détails supplémentaires…" className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors">Enregistrer</button>
                      <button type="button" onClick={() => setEditId(null)} className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors">Annuler</button>
                    </div>
                  </form>
                );
              }

              return (
                <div key={e.id} className={`flex items-start gap-4 px-5 py-4 group hover:bg-sand/20 transition-colors`}>
                  <div className="w-14 shrink-0 text-right">
                    <span className="text-sm font-bold text-ink">{e.time}</span>
                  </div>
                  <div className={`w-px self-stretch bg-sand-200`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base">{cfg.emoji}</span>
                      <span className="text-sm font-semibold text-ink">{e.title}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {e.location && <p className="text-xs text-muted">📍 {e.location}</p>}
                      {e.assignee && <p className="text-xs text-muted">👤 {e.assignee}</p>}
                      {e.description && <p className="text-xs text-muted italic">{e.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditId(e.id)}
                      className="h-7 w-7 rounded-lg border border-sand-200 bg-white flex items-center justify-center text-muted hover:text-ink transition-colors"
                      title="Modifier"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        className="h-7 w-7 rounded-lg border border-sand-200 bg-white flex items-center justify-center text-muted hover:text-red-500 hover:border-red-200 transition-colors"
                        title="Supprimer"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add entry */}
        <div className="border-t border-sand-200">
          {!showAdd ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="w-full px-5 py-3.5 flex items-center gap-2 text-sm text-muted hover:text-terracotta hover:bg-sand/30 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Ajouter une activité
            </button>
          ) : (
            <form
              action={async (fd) => {
                await addAction(fd);
                setShowAdd(false);
              }}
              className="px-5 py-4 bg-sand/10 space-y-3"
            >
              <input type="hidden" name="date" value={dateStr} />
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Nouvelle activité</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Heure *</label>
                  <input type="time" name="time" required defaultValue="09:00" className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" />
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Titre *</label>
                  <input type="text" name="title" required placeholder="Ex : Nettoyage Suite Atlas, Déjeuner terrasse…" className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" autoFocus />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Catégorie</label>
                  <select name="category" defaultValue="general" className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30">
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.emoji} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Lieu</label>
                  <input type="text" name="location" placeholder="Chambre, patio, terrasse…" className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Responsable</label>
                  <input type="text" name="assignee" placeholder="Prénom…" className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1">Note (optionnel)</label>
                <input type="text" name="description" placeholder="Détails, instructions…" className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors">
                  Ajouter
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* WhatsApp preview */}
      {timeline.length > 0 && (
        <div className="rounded-2xl bg-[#0a1929] border border-[#1a3a4a] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">Aperçu WhatsApp</p>
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 rounded-xl bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1ebe5d] transition-colors"
            >
              <IconShare size={12} />
              Envoyer dans un groupe
            </button>
          </div>
          <div className="rounded-xl bg-[#1e3a2f] p-4 max-w-sm">
            <p className="text-[#e9e9e9] text-sm font-mono whitespace-pre-line leading-relaxed">
              {buildWhatsAppText()}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  function buildWhatsAppText() {
    const dateLine = `🏡 *Riad Dar Kader — Planning du ${formatDateFR(dateStr)}*`;
    if (timeline.length === 0) return dateLine + "\n\n_(Aucune activité programmée)_";
    const lines = timeline.map((item) => {
      if (item.kind === "auto") {
        const cfg = CATEGORY_CONFIG[item.event.category] ?? CATEGORY_CONFIG.general;
        return `${cfg.emoji} *${item.event.time}* — ${item.event.title}${item.event.location ? ` _(${item.event.location})_` : ""}`;
      } else {
        const e = item.entry;
        const cfg = CATEGORY_CONFIG[e.category] ?? CATEGORY_CONFIG.general;
        const parts = [`${cfg.emoji} *${e.time}* — ${e.title}`];
        if (e.location) parts.push(`_(${e.location})_`);
        if (e.assignee) parts.push(`👤 ${e.assignee}`);
        if (e.description) parts.push(`\n   💬 ${e.description}`);
        return parts.join(" ");
      }
    });
    return dateLine + "\n\n" + lines.join("\n");
  }
}
