"use client";

import { useState } from "react";

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

const CHANNEL_ICONS: Record<string, string> = { email: "✉️", whatsapp: "💬", form: "📋" };

export function MessagesUI({ messages, markReadAction, replyAction, deleteAction }: Props) {
  const [selected, setSelected] = useState<Message | null>(messages[0] ?? null);
  const [replyText, setReplyText] = useState("");

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
    <div className="grid lg:grid-cols-5 gap-4" style={{ minHeight: "60vh" }}>
      {/* List */}
      <div className="lg:col-span-2 rounded-2xl bg-white border border-sand-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-sand-200 bg-sand/40">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Boîte de réception</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-sand-200/60">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => selectMessage(m)}
              className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-sand/30 ${selected?.id === m.id ? "bg-sand/50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {m.status === "new" && <span className="h-2 w-2 shrink-0 rounded-full bg-terracotta" />}
                  <span className={`text-sm truncate ${m.status === "new" ? "font-semibold text-ink" : "font-medium text-ink/80"}`}>
                    {m.from}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px]">{CHANNEL_ICONS[m.channel] ?? "📋"}</span>
                  <span className="text-[10px] text-muted whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
              <p className="text-xs font-medium text-ink/70 mt-0.5 truncate">{m.subject}</p>
              <p className="text-xs text-muted mt-0.5 truncate">{m.body.slice(0, 80)}...</p>
              <div className="mt-1.5">
                <StatusBadge status={m.status} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="lg:col-span-3 rounded-2xl bg-white border border-sand-200 shadow-sm flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="px-6 py-4 border-b border-sand-200 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">{selected.subject}</h2>
                <p className="text-xs text-muted mt-0.5">
                  De : <span className="text-ink/80">{selected.from}</span>
                  <span className="mx-1">·</span>
                  <span>{selected.email}</span>
                  <span className="mx-1">·</span>
                  {new Date(selected.createdAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg">{CHANNEL_ICONS[selected.channel] ?? "📋"}</span>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={selected.id} />
                  <button
                    type="submit"
                    onClick={() => setSelected(null)}
                    className="rounded-xl border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="rounded-xl bg-sand/40 border border-sand-200 p-4">
                <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{selected.body}</p>
              </div>

              {selected.reply && (
                <div className="rounded-xl bg-terracotta/5 border border-terracotta/20 p-4">
                  <p className="text-[10px] font-semibold text-terracotta uppercase tracking-wide mb-2">Votre réponse</p>
                  <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{selected.reply}</p>
                </div>
              )}
            </div>

            {selected.status !== "replied" && (
              <div className="border-t border-sand-200 p-4">
                <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">Répondre</p>
                <form
                  action={async (fd) => {
                    fd.set("reply", replyText);
                    await replyAction(fd);
                    setReplyText("");
                  }}
                >
                  <input type="hidden" name="id" value={selected.id} />
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Écrivez votre réponse..."
                    rows={3}
                    className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted">
                      Canal : {selected.channel === "whatsapp" ? "WhatsApp" : selected.channel === "email" ? "Email" : "Formulaire"}
                    </p>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="rounded-xl bg-terracotta px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-terracotta/90 transition-colors"
                    >
                      Enregistrer la réponse
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted">Sélectionnez un message</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-terracotta/10 text-terracotta",
    read: "bg-sand text-muted",
    replied: "bg-emerald-100 text-emerald-700",
  };
  const labels: Record<string, string> = { new: "Nouveau", read: "Lu", replied: "Répondu" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[status] ?? "bg-sand text-muted"}`}>{labels[status] ?? status}</span>;
}
