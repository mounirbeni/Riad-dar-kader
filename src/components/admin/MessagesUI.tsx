"use client";

import { useState } from "react";
import { IconMail, IconMessageCircle, IconClipboardList, IconX } from "@/components/Icons";

type Message = {
  id: string;
  from: string;
  email: string;
  subject: string;
  body: string;
  channel: string;
  status: string;
  reply: string | null;
  createdAt: Date;
};

type Props = {
  messages: Message[];
  markReadAction: (fd: FormData) => Promise<void>;
  replyAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
};

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  form: "Formulaire",
};

const CHANNEL_COLORS: Record<string, string> = {
  email: "bg-blue-50 text-blue-600 border-blue-100",
  whatsapp: "bg-emerald-50 text-emerald-600 border-emerald-100",
  form: "bg-sand text-muted border-sand-200",
};

const STATUS_FILTERS = ["Tous", "Nouveau", "Lu", "Répondu"] as const;
type Filter = (typeof STATUS_FILTERS)[number];

function ChannelIcon({ channel, size = 13 }: { channel: string; size?: number }) {
  if (channel === "email") return <IconMail size={size} />;
  if (channel === "whatsapp") return <IconMessageCircle size={size} />;
  return <IconClipboardList size={size} />;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function fmtDate(d: Date) {
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return date.toLocaleDateString("fr-FR", { weekday: "short" });
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-terracotta/10 text-terracotta",
    read: "bg-sand text-muted",
    replied: "bg-emerald-100 text-emerald-700",
  };
  const labels: Record<string, string> = { new: "Nouveau", read: "Lu", replied: "Répondu" };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[status] ?? "bg-sand text-muted"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export function MessagesUI({ messages, markReadAction, replyAction, deleteAction }: Props) {
  const [selected, setSelected] = useState<Message | null>(messages[0] ?? null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<Filter>("Tous");

  const filterMap: Record<Filter, string | null> = {
    Tous: null, Nouveau: "new", Lu: "read", Répondu: "replied",
  };

  const filtered = filterMap[filter]
    ? messages.filter((m) => m.status === filterMap[filter])
    : messages;

  const newCount = messages.filter((m) => m.status === "new").length;

  function selectMessage(m: Message) {
    setSelected(m);
    setReplyText("");
    if (m.status === "new") {
      const fd = new FormData();
      fd.set("id", m.id);
      void markReadAction(fd);
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-4" style={{ minHeight: "65vh" }}>
      {/* ── Left: conversation list ── */}
      <div className="lg:col-span-2 rounded-2xl bg-white border border-sand-200 shadow-sm flex flex-col overflow-hidden">
        {/* List header */}
        <div className="px-4 py-3 border-b border-sand-200 bg-sand/30 shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-ink uppercase tracking-wide">Boîte de réception</p>
            {newCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
                {newCount}
              </span>
            )}
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  filter === f
                    ? "bg-terracotta text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-sand-100">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <span className="text-2xl mb-2">📭</span>
              <p className="text-sm text-muted">Aucun message dans cette catégorie</p>
            </div>
          ) : (
            filtered.map((m) => {
              const isSelected = selected?.id === m.id;
              const isNew = m.status === "new";
              return (
                <button
                  key={m.id}
                  onClick={() => selectMessage(m)}
                  className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-sand/30 ${
                    isSelected ? "bg-terracotta/5 border-l-2 border-terracotta" : "border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                        isNew ? "bg-terracotta text-white" : "bg-sand text-muted"
                      }`}>
                        {initials(m.from)}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-sm truncate ${isNew ? "font-semibold text-ink" : "font-medium text-ink/80"}`}>
                          {m.from}
                        </span>
                        <span className="text-[10px] text-muted whitespace-nowrap shrink-0">
                          {fmtDate(m.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-ink/70 truncate mb-1">{m.subject}</p>
                      <p className="text-xs text-muted truncate">{m.body.slice(0, 70)}{m.body.length > 70 ? "…" : ""}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <StatusBadge status={m.status} />
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${CHANNEL_COLORS[m.channel] ?? "bg-sand text-muted border-sand-200"}`}>
                          <ChannelIcon channel={m.channel} size={10} />
                          {CHANNEL_LABELS[m.channel] ?? m.channel}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: message detail ── */}
      <div className="lg:col-span-3 rounded-2xl bg-white border border-sand-200 shadow-sm flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Detail header */}
            <div className="px-6 py-4 border-b border-sand-200 bg-sand/20 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold mt-0.5 ${
                    selected.status === "new" ? "bg-terracotta text-white" : "bg-sand text-muted"
                  }`}>
                    {initials(selected.from)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-ink truncate">{selected.subject}</h2>
                    <p className="text-xs text-muted mt-0.5">
                      <span className="font-medium text-ink/80">{selected.from}</span>
                      <span className="mx-1.5 text-sand-300">·</span>
                      <span className="font-mono">{selected.email}</span>
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">
                      {new Date(selected.createdAt).toLocaleString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${CHANNEL_COLORS[selected.channel] ?? "bg-sand text-muted border-sand-200"}`}>
                    <ChannelIcon channel={selected.channel} />
                    {CHANNEL_LABELS[selected.channel] ?? selected.channel}
                  </span>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={selected.id} />
                    <button
                      type="submit"
                      onClick={() => setSelected(null)}
                      className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <IconX size={11} />
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Message body + reply thread */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Guest message */}
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-xs font-semibold text-muted mt-0.5">
                  {initials(selected.from)}
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-sand/50 border border-sand-200 px-4 py-3.5 flex-1">
                  <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{selected.body}</p>
                </div>
              </div>

              {/* Admin reply */}
              {selected.reply && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="rounded-2xl rounded-tr-sm bg-terracotta/10 border border-terracotta/20 px-4 py-3.5 flex-1">
                    <p className="text-[10px] font-semibold text-terracotta uppercase tracking-wide mb-2">
                      Votre réponse
                    </p>
                    <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{selected.reply}</p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta text-white text-xs font-bold mt-0.5">
                    R
                  </span>
                </div>
              )}
            </div>

            {/* Reply input */}
            {selected.status !== "replied" && (
              <div className="border-t border-sand-200 p-4 bg-white shrink-0">
                <form
                  action={async (fd) => {
                    fd.set("reply", replyText);
                    await replyAction(fd);
                    setReplyText("");
                  }}
                >
                  <input type="hidden" name="id" value={selected.id} />
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">Répondre</p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Écrivez votre réponse…"
                    rows={3}
                    className="w-full rounded-xl border border-sand-200 bg-sand/30 px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:bg-white resize-none transition-all"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted">
                      Via {CHANNEL_LABELS[selected.channel] ?? selected.channel}
                    </p>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="rounded-xl bg-terracotta px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-terracotta/90 transition-colors"
                    >
                      Enregistrer la réponse
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Replied state */}
            {selected.status === "replied" && (
              <div className="border-t border-sand-200 px-6 py-3 bg-emerald-50/50 shrink-0">
                <p className="text-xs text-emerald-700 font-medium text-center">✓ Réponse enregistrée</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sand/60">
              <IconMail size={22} className="text-muted" />
            </span>
            <div>
              <p className="font-medium text-ink/60 text-sm">Sélectionnez un message</p>
              <p className="text-xs text-muted mt-0.5">Cliquez sur une conversation à gauche</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
