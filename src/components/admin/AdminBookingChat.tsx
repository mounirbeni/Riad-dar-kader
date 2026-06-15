"use client";

import { useActionState, useRef, useEffect } from "react";
import { sendAdminMessageAction, markAdminMessagesReadAction } from "@/app/actions/chat";

type Message = {
  id: string;
  sender: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
};

function fmtTime(d: Date) {
  return new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function AdminBookingChat({
  bookingId,
  messages,
  guestName,
}: {
  bookingId: string;
  messages: Message[];
  guestName: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [, formAction, pending] = useActionState(sendAdminMessageAction, undefined);

  useEffect(() => {
    markAdminMessagesReadAction(bookingId).catch(() => {});
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const unread = messages.filter(m => m.sender === "guest" && !m.isRead).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
      <div className="border-b border-sand-100 bg-sand/30 px-5 py-3.5 flex items-center justify-between">
        <h2 className="font-serif text-lg text-ink">Chat client</h2>
        {unread > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white">{unread}</span>
        )}
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted py-4">
            Aucun message. Confirmez la réservation pour envoyer le message de bienvenue automatique.
          </p>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.sender === "admin";
            return (
              <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${isAdmin ? "bg-terracotta text-white rounded-br-sm" : "bg-sand border border-sand-200 text-ink rounded-bl-sm"}`}>
                  {!isAdmin && (
                    <p className="text-[10px] font-semibold text-terracotta mb-1 uppercase tracking-wide">{guestName}</p>
                  )}
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isAdmin ? "text-white/60" : "text-muted"}`}>{fmtTime(msg.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send */}
      <div className="border-t border-sand-200 p-4">
        <form action={formAction} className="flex gap-2">
          <input type="hidden" name="bookingId" value={bookingId} />
          <input
            name="content"
            type="text"
            required
            placeholder="Écrire au client…"
            className="flex-1 rounded-xl border border-sand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta/90 disabled:opacity-60 transition-colors shrink-0"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
