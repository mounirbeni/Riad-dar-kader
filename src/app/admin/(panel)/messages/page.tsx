"use client";

import { useState } from "react";

type MessageStatus = "new" | "read" | "replied";

type Message = {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  status: MessageStatus;
  channel: "email" | "whatsapp" | "form";
};

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    from: "Sophie Martin",
    email: "sophie.martin@email.com",
    subject: "Demande de disponibilité — juillet",
    preview: "Bonjour, nous souhaitons réserver la Suite Atlas du 15 au 22 juillet...",
    body: "Bonjour,\n\nNous souhaitons réserver la Suite Atlas du 15 au 22 juillet pour 2 personnes. Pourriez-vous confirmer la disponibilité et le tarif?\n\nMerci d'avance,\nSophie Martin",
    date: "2026-06-15T09:23:00",
    status: "new",
    channel: "form",
  },
  {
    id: "2",
    from: "Ahmed Benali",
    email: "a.benali@gmail.com",
    subject: "Question sur les extras",
    preview: "Bonjour, est-ce que vous proposez un service de transfert depuis l'aéroport...",
    body: "Bonjour,\n\nJ'ai une réservation (DK-3F2A1) pour le mois prochain. Est-ce que vous proposez un service de transfert depuis l'aéroport de Marrakech-Ménara?\n\nCordialement,\nAhmed",
    date: "2026-06-14T16:45:00",
    status: "read",
    channel: "email",
  },
  {
    id: "3",
    from: "Emma Wilson",
    email: "+33612345678",
    subject: "Confirmation réservation",
    preview: "Hello! Just wanted to confirm our booking for next week...",
    body: "Hello!\n\nJust wanted to confirm our booking for next week (DK-9B4C2). We're very excited to visit your beautiful riad!\n\nBest regards,\nEmma",
    date: "2026-06-14T11:10:00",
    status: "replied",
    channel: "whatsapp",
  },
  {
    id: "4",
    from: "Jean-Pierre Dupont",
    email: "jp.dupont@orange.fr",
    subject: "Modification dates séjour",
    preview: "Bonjour, serait-il possible de décaler notre arrivée d'un jour...",
    body: "Bonjour,\n\nNous avons une réservation (DK-7E1D5) du 20 au 25 juin. Serait-il possible de décaler notre arrivée au 21 juin?\n\nMerci,\nJean-Pierre Dupont",
    date: "2026-06-13T14:30:00",
    status: "new",
    channel: "email",
  },
  {
    id: "5",
    from: "Laila Chraibi",
    email: "laila.c@hotmail.com",
    subject: "Demande de devis — séjour de noces",
    preview: "Bonjour, nous préparons notre lune de miel et le riad Dar Kader...",
    body: "Bonjour,\n\nNous préparons notre lune de miel et le riad Dar Kader nous a été chaleureusement recommandé. Pourriez-vous nous proposer un forfait pour 5 nuits en août, avec décoration romantique et petit-déjeuner inclus?\n\nMerci,\nLaila & Youssef",
    date: "2026-06-12T10:00:00",
    status: "read",
    channel: "form",
  },
];

const CHANNEL_ICONS: Record<string, string> = {
  email: "✉️",
  whatsapp: "💬",
  form: "📋",
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [selected, setSelected] = useState<Message | null>(messages[0] ?? null);
  const [reply, setReply] = useState("");

  function markRead(id: string) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id && m.status === "new" ? { ...m, status: "read" } : m))
    );
  }

  function sendReply() {
    if (!reply.trim() || !selected) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === selected.id ? { ...m, status: "replied" } : m))
    );
    setSelected((prev) => (prev ? { ...prev, status: "replied" } : prev));
    setReply("");
  }

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ink">Messages</h1>
        <p className="mt-1 text-sm text-muted">
          {newCount > 0 ? (
            <span className="text-terracotta font-medium">{newCount} nouveau{newCount > 1 ? "x" : ""} message{newCount > 1 ? "s" : ""}</span>
          ) : (
            "Tous les messages sont lus"
          )}
          {" · "}
          {messages.length} au total
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4" style={{ minHeight: "60vh" }}>
        {/* Message list */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-sand-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-sand-200 bg-sand/40">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">Boîte de réception</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-sand-200/60">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  markRead(m.id);
                }}
                className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-sand/30 ${
                  selected?.id === m.id ? "bg-sand/50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {m.status === "new" && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-terracotta" />
                    )}
                    <span className={`text-sm truncate ${m.status === "new" ? "font-semibold text-ink" : "font-medium text-ink/80"}`}>
                      {m.from}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px]">{CHANNEL_ICONS[m.channel]}</span>
                    <span className="text-[10px] text-muted whitespace-nowrap">
                      {new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-medium text-ink/70 mt-0.5 truncate">{m.subject}</p>
                <p className="text-xs text-muted mt-0.5 truncate">{m.preview}</p>
                <div className="mt-1.5">
                  <StatusBadge status={m.status} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message detail */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-sand-200 shadow-sm flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-sand-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-ink">{selected.subject}</h2>
                    <p className="text-xs text-muted mt-0.5">
                      De : <span className="text-ink/80">{selected.from}</span>
                      <span className="mx-1">·</span>
                      <span>{selected.email}</span>
                      <span className="mx-1">·</span>
                      {new Date(selected.date).toLocaleString("fr-FR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-lg">{CHANNEL_ICONS[selected.channel]}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="rounded-xl bg-sand/40 border border-sand-200 p-4">
                  <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{selected.body}</p>
                </div>
              </div>

              <div className="border-t border-sand-200 p-4">
                <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">Répondre</p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  rows={3}
                  className="w-full rounded-xl border border-sand-200 px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-muted">La réponse sera envoyée par {selected.channel === "whatsapp" ? "WhatsApp" : "email"}</p>
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    className="rounded-xl bg-terracotta px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-terracotta/90 transition-colors"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted">Sélectionnez un message</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: MessageStatus }) {
  const map: Record<MessageStatus, string> = {
    new: "bg-terracotta/10 text-terracotta",
    read: "bg-sand text-muted",
    replied: "bg-emerald-100 text-emerald-700",
  };
  const labels: Record<MessageStatus, string> = { new: "Nouveau", read: "Lu", replied: "Répondu" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${map[status]}`}>{labels[status]}</span>;
}
