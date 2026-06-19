"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconMail, IconMessageCircle, IconClipboardList, IconX, IconArrowRight,
} from "@/components/Icons";

// ── Types ──────────────────────────────────────────────────────────────────

type BookingThread = {
  id: string;
  reference: string;
  guestName: string;
  guestEmail: string;
  roomName: string;
  latestMessage: { content: string; sender: string; createdAt: Date } | null;
  unreadCount: number;
};

type ContactMsg = {
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
  bookingThreads: BookingThread[];
  contactMessages: ContactMsg[];
  markReadAction: (fd: FormData) => Promise<void>;
  replyAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function relativeTime(d: Date) {
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return date.toLocaleDateString("fr-FR", { weekday: "short" });
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function ChannelBadge({ channel }: { channel: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    email:     { label: "Email",      cls: "bg-blue-50 text-blue-600 border-blue-100",     icon: <IconMail size={10} /> },
    whatsapp:  { label: "WhatsApp",   cls: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <IconMessageCircle size={10} /> },
    form:      { label: "Formulaire", cls: "bg-sand text-muted border-sand-200",           icon: <IconClipboardList size={10} /> },
  };
  const c = map[channel] ?? map.form;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${c.cls}`}>
      {c.icon}{c.label}
    </span>
  );
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

// ── Unified list item types ────────────────────────────────────────────────

type ListItem =
  | { kind: "booking"; thread: BookingThread; sortDate: Date }
  | { kind: "contact"; msg: ContactMsg; sortDate: Date };

// ── Main component ─────────────────────────────────────────────────────────

export function UnifiedInbox({
  bookingThreads,
  contactMessages,
  markReadAction,
  replyAction,
  deleteAction,
}: Props) {
  const [selectedContact, setSelectedContact] = useState<ContactMsg | null>(
    contactMessages[0] ?? null
  );
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<"Tous" | "Clients" | "Formulaires">("Tous");

  // Merge and sort by latest activity
  const allItems: ListItem[] = [
    ...bookingThreads.map((t) => ({
      kind: "booking" as const,
      thread: t,
      sortDate: t.latestMessage ? new Date(t.latestMessage.createdAt) : new Date(0),
    })),
    ...contactMessages.map((m) => ({
      kind: "contact" as const,
      msg: m,
      sortDate: new Date(m.createdAt),
    })),
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  const filtered = allItems.filter((item) => {
    if (filter === "Clients") return item.kind === "booking";
    if (filter === "Formulaires") return item.kind === "contact";
    return true;
  });

  function selectContact(m: ContactMsg) {
    setSelectedContact(m);
    setReplyText("");
    if (m.status === "new") {
      const fd = new FormData();
      fd.set("id", m.id);
      void markReadAction(fd);
    }
  }

  const isEmpty = filtered.length === 0;

  return (
    <div className="grid lg:grid-cols-5 gap-4" style={{ minHeight: "65vh" }}>
      {/* ── Left: unified list ── */}
      <div className="lg:col-span-2 rounded-2xl bg-white border border-sand-200 shadow-sm flex flex-col overflow-hidden">
        {/* Header + filters */}
        <div className="px-4 py-3 border-b border-sand-200 bg-sand/30 shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-ink uppercase tracking-wide">Toutes les conversations</p>
            {allItems.filter(i =>
              (i.kind === "booking" && i.thread.unreadCount > 0) ||
              (i.kind === "contact" && i.msg.status === "new")
            ).length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
                {allItems.filter(i =>
                  (i.kind === "booking" && i.thread.unreadCount > 0) ||
                  (i.kind === "contact" && i.msg.status === "new")
                ).length}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {(["Tous", "Clients", "Formulaires"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  filter === f ? "bg-terracotta text-white" : "text-muted hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-sand-100">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-4">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-sm text-muted">Aucune conversation</p>
            </div>
          ) : (
            filtered.map((item) => {
              if (item.kind === "booking") {
                const t = item.thread;
                const hasUnread = t.unreadCount > 0;
                const latest = t.latestMessage;
                const isGuestLatest = latest?.sender === "guest";
                return (
                  <Link
                    key={`b-${t.id}`}
                    href={`/admin/bookings/${t.id}`}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-sand/30 transition-colors border-l-2 border-transparent hover:border-terracotta/30 group"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${hasUnread ? "bg-terracotta text-white" : "bg-sand text-muted"}`}>
                        {initials(t.guestName)}
                      </span>
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                          <span className="h-2.5 w-2.5 rounded-full bg-terracotta" />
                        </span>
                      )}
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-sm truncate ${hasUnread ? "font-semibold text-ink" : "font-medium text-ink/80"}`}>
                          {t.guestName}
                        </span>
                        <span className="text-[10px] text-muted whitespace-nowrap shrink-0">
                          {latest ? relativeTime(latest.createdAt) : ""}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-ink/60 truncate mb-1">
                        {t.reference} · {t.roomName}
                      </p>
                      {latest && (
                        <p className={`text-xs truncate ${hasUnread && isGuestLatest ? "font-semibold text-ink" : "text-muted"}`}>
                          {isGuestLatest ? "" : "Vous : "}
                          {latest.content.split("\n")[0].slice(0, 60)}
                          {latest.content.length > 60 ? "…" : ""}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-sand-200 bg-sand px-2 py-0.5 text-[10px] font-medium text-muted">
                          <IconMessageCircle size={9} />
                          Chat client
                        </span>
                        {hasUnread && (
                          <span className="inline-flex items-center justify-center rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] font-semibold text-terracotta">
                            {t.unreadCount} non lu{t.unreadCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <IconArrowRight size={13} className="text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </Link>
                );
              }

              // Contact message
              const m = item.msg;
              const isSelected = selectedContact?.id === m.id;
              const isNew = m.status === "new";
              return (
                <button
                  key={`c-${m.id}`}
                  onClick={() => selectContact(m)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-sand/30 border-l-2 ${
                    isSelected ? "bg-terracotta/5 border-terracotta" : "border-transparent"
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${isNew ? "bg-ink/80 text-white" : "bg-sand text-muted"}`}>
                      {initials(m.from)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-sm truncate ${isNew ? "font-semibold text-ink" : "font-medium text-ink/80"}`}>
                        {m.from}
                      </span>
                      <span className="text-[10px] text-muted whitespace-nowrap shrink-0">
                        {relativeTime(m.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-ink/70 truncate mb-1">{m.subject}</p>
                    <p className="text-xs text-muted truncate">{m.body.slice(0, 60)}{m.body.length > 60 ? "…" : ""}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <StatusBadge status={m.status} />
                      <ChannelBadge channel={m.channel} />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: detail panel ── */}
      <div className="lg:col-span-3 rounded-2xl bg-white border border-sand-200 shadow-sm flex flex-col overflow-hidden">
        {selectedContact ? (
          <ContactDetail
            msg={selectedContact}
            replyText={replyText}
            setReplyText={setReplyText}
            replyAction={replyAction}
            deleteAction={deleteAction}
            onDelete={() => setSelectedContact(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand/60 text-2xl">
              💬
            </span>
            <div>
              <p className="font-medium text-ink/60 text-sm">Sélectionnez une conversation</p>
              <p className="text-xs text-muted mt-1 max-w-[220px]">
                Les chats clients s'ouvrent directement dans la fiche réservation
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-muted hover:text-terracotta hover:border-terracotta/30 transition-colors"
            >
              <IconArrowRight size={13} />
              Voir les réservations
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Contact message detail ─────────────────────────────────────────────────

function ContactDetail({
  msg,
  replyText,
  setReplyText,
  replyAction,
  deleteAction,
  onDelete,
}: {
  msg: ContactMsg;
  replyText: string;
  setReplyText: (v: string) => void;
  replyAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
  onDelete: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="px-6 py-4 border-b border-sand-200 bg-sand/20 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold mt-0.5 ${msg.status === "new" ? "bg-ink/80 text-white" : "bg-sand text-muted"}`}>
              {initials(msg.from)}
            </span>
            <div className="min-w-0">
              <h2 className="font-semibold text-ink truncate">{msg.subject}</h2>
              <p className="text-xs text-muted mt-0.5">
                <span className="font-medium text-ink/80">{msg.from}</span>
                <span className="mx-1.5 text-sand-300">·</span>
                <span className="font-mono">{msg.email}</span>
              </p>
              <p className="text-[10px] text-muted mt-0.5">
                {new Date(msg.createdAt).toLocaleString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ChannelBadge channel={msg.channel} />
            <form action={deleteAction}>
              <input type="hidden" name="id" value={msg.id} />
              <button
                type="submit"
                onClick={onDelete}
                className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 transition-colors"
              >
                <IconX size={11} />
                Supprimer
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-xs font-semibold text-muted mt-0.5">
            {initials(msg.from)}
          </span>
          <div className="rounded-2xl rounded-tl-sm bg-sand/50 border border-sand-200 px-4 py-3.5 flex-1">
            <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{msg.body}</p>
          </div>
        </div>

        {msg.reply && (
          <div className="flex items-start gap-3 justify-end">
            <div className="rounded-2xl rounded-tr-sm bg-terracotta/10 border border-terracotta/20 px-4 py-3.5 flex-1">
              <p className="text-[10px] font-semibold text-terracotta uppercase tracking-wide mb-2">
                Votre réponse
              </p>
              <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{msg.reply}</p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta text-white text-xs font-bold mt-0.5">
              R
            </span>
          </div>
        )}
      </div>

      {/* Reply box */}
      {msg.status !== "replied" ? (
        <div className="border-t border-sand-200 p-4 bg-white shrink-0">
          <form
            action={async (fd) => {
              fd.set("reply", replyText);
              await replyAction(fd);
              setReplyText("");
            }}
          >
            <input type="hidden" name="id" value={msg.id} />
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">Répondre</p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Écrivez votre réponse…"
              rows={3}
              className="w-full rounded-xl border border-sand-200 bg-sand/30 px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:bg-white resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-muted">Via formulaire de contact</p>
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
      ) : (
        <div className="border-t border-sand-200 px-6 py-3 bg-emerald-50/50 shrink-0">
          <p className="text-xs text-emerald-700 font-medium text-center">✓ Réponse enregistrée</p>
        </div>
      )}
    </>
  );
}
