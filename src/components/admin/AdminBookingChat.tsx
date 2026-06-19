"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { sendAdminMessageAction, markAdminMessagesReadAction } from "@/app/actions/chat";
import {
  IconStar, IconMessageCircle, IconCar, IconUtensilsCrossed,
  IconCoffee, IconSun, IconLogOut, IconBell, IconEdit, IconX,
} from "@/components/Icons";

type Message = {
  id: string;
  sender: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
};

type Tpl = {
  id: string;
  icon: React.ReactNode;
  label: string;
  category: string;
  build: (firstName: string, checkInFr: string) => string;
};

const RIAD = "Riad Dar Kader";

const TEMPLATES: Tpl[] = [
  // ── Confirmation ─────────────────────────────────────────────────
  {
    id: "eta",
    icon: <IconCar size={13} />,
    label: "Heure d'arrivée",
    category: "Confirmation",
    build: (name, date) =>
      `Bonjour ${name},\n\nVotre réservation est confirmée et toute l'équipe du ${RIAD} est impatiente de vous accueillir.\n\nPourriez-vous nous indiquer votre heure d'arrivée prévue le ${date} ? Cela nous permettra de tout préparer à votre intention.\n\nCordialement,\nL'équipe du ${RIAD}`,
  },
  {
    id: "transfer-in",
    icon: <IconCar size={13} />,
    label: "Transfert aéroport",
    category: "Confirmation",
    build: (name) =>
      `Bonjour ${name},\n\nSouhaitez-vous que nous organisions votre transfert privé depuis l'aéroport Marrakech-Ménara jusqu'au riad ?\n\nNous travaillons avec des chauffeurs de confiance pour que votre arrivée soit aussi sereine que possible.\n\nBien à vous,\nL'équipe du ${RIAD}`,
  },
  {
    id: "baggage",
    icon: <IconBell size={13} />,
    label: "Bagages en avance",
    category: "Confirmation",
    build: (name) =>
      `Bonjour ${name},\n\nSi vous arrivez avant l'heure du check-in (15h00), nous serons ravis de conserver vos bagages en toute sécurité au riad — vous pourrez ainsi visiter la médina librement.\n\nN'hésitez pas à nous le signaler.\n\nBien à vous,\nL'équipe du ${RIAD}`,
  },

  // ── Préférences ──────────────────────────────────────────────────
  {
    id: "diet",
    icon: <IconUtensilsCrossed size={13} />,
    label: "Régime alimentaire",
    category: "Préférences",
    build: (name) =>
      `Bonjour ${name},\n\nNous préparons chaque matin un petit-déjeuner marocain fait maison pour nos hôtes.\n\nAvez-vous des restrictions alimentaires, des allergies ou des préférences particulières dont nous devrions tenir compte ? Nous nous adaptons avec plaisir.\n\nBien cordialement,\nL'équipe du ${RIAD}`,
  },
  {
    id: "occasion",
    icon: <IconStar size={13} />,
    label: "Occasion spéciale",
    category: "Préférences",
    build: (name) =>
      `Bonjour ${name},\n\nCélébrez-vous une occasion particulière durant votre séjour — anniversaire, lune de miel, anniversaire de mariage ou un moment précieux ?\n\nNous adorons rendre ces instants inoubliables et pouvons préparer une attention en toute discrétion.\n\nAvec plaisir,\nL'équipe du ${RIAD}`,
  },
  {
    id: "room-prefs",
    icon: <IconEdit size={13} />,
    label: "Préférences chambre",
    category: "Préférences",
    build: (name) =>
      `Bonjour ${name},\n\nAvez-vous des préférences pour votre chambre — oreillers supplémentaires, couvertures légères ou chaudes, décoration florale, lit de bébé... ?\n\nVotre confort est notre priorité et nous ferons tout pour préparer votre chambre à votre goût.\n\nBien à vous,\nL'équipe du ${RIAD}`,
  },

  // ── Services ─────────────────────────────────────────────────────
  {
    id: "hammam",
    icon: <IconSun size={13} />,
    label: "Hammam & Spa",
    category: "Services",
    build: (name) =>
      `Bonjour ${name},\n\nSaviez-vous que nous pouvons organiser pour vous une séance de hammam traditionnel ou un massage relaxant dans nos établissements partenaires de confiance ?\n\nC'est une expérience authentique à ne pas manquer à Marrakech. Souhaitez-vous une réservation ?\n\nBien à vous,\nL'équipe du ${RIAD}`,
  },
  {
    id: "excursions",
    icon: <IconStar size={13} />,
    label: "Excursions & Visites",
    category: "Services",
    build: (name) =>
      `Bonjour ${name},\n\nNous proposons des excursions sur mesure au départ du riad :\n• Souks historiques & artisanat\n• Jardin Majorelle & Musée YSL\n• Palais Bahia & Mellah\n• Désert d'Agafay & Atlas\n• Vallée de l'Ourika\n\nSouhaitez-vous qu'un guide de confiance vous accompagne ?\n\nBien à vous,\nL'équipe du ${RIAD}`,
  },
  {
    id: "restaurant",
    icon: <IconUtensilsCrossed size={13} />,
    label: "Restaurants",
    category: "Services",
    build: (name) =>
      `Bonjour ${name},\n\nSouhaitez-vous des recommandations de restaurants à Marrakech, ou que nous effectuions une réservation dans nos adresses préférées ?\n\nNous connaissons les meilleures tables — de la cuisine marocaine authentique aux restaurants gastronomiques.\n\nBien à vous,\nL'équipe du ${RIAD}`,
  },

  // ── Pré-arrivée ──────────────────────────────────────────────────
  {
    id: "checkin-info",
    icon: <IconMessageCircle size={13} />,
    label: "Instructions check-in",
    category: "Pré-arrivée",
    build: (name, date) =>
      `Bonjour ${name},\n\nNous approchons de votre arrivée le ${date} et avons hâte de vous accueillir !\n\nQuelques informations pratiques :\n• Check-in à partir de 15h00\n• Le riad est au cœur de la médina — appelez-nous dès votre arrivée à Marrakech, nous vous guiderons jusqu'à la porte\n• Un membre de l'équipe vous attendra\n\nBon voyage !\nL'équipe du ${RIAD}`,
  },

  // ── Durant le séjour ─────────────────────────────────────────────
  {
    id: "during-stay",
    icon: <IconCoffee size={13} />,
    label: "Comment se passe votre séjour ?",
    category: "Durant le séjour",
    build: (name) =>
      `Bonjour ${name},\n\nNous espérons que vous profitez pleinement de Marrakech et de votre séjour au riad !\n\nTout se passe bien ? Avez-vous besoin de quoi que ce soit ? Nous sommes disponibles à toute heure pour vous.\n\nBien à vous,\nL'équipe du ${RIAD}`,
  },
  {
    id: "breakfast",
    icon: <IconCoffee size={13} />,
    label: "Petit-déjeuner",
    category: "Durant le séjour",
    build: (name) =>
      `Bonjour ${name},\n\nVotre petit-déjeuner marocain fait maison sera servi demain matin entre 7h30 et 10h30 sur la terrasse ou dans le patio.\n\nAvez-vous une préférence d'horaire ? Et souhaitez-vous des oeufs préparés d'une façon particulière ?\n\nBonne nuit,\nL'équipe du ${RIAD}`,
  },

  // ── Départ ───────────────────────────────────────────────────────
  {
    id: "checkout",
    icon: <IconLogOut size={13} />,
    label: "Rappel check-out",
    category: "Départ",
    build: (name) =>
      `Bonjour ${name},\n\nNous espérons que votre séjour a été à la hauteur de vos attentes et que vous repartez avec de beaux souvenirs de Marrakech.\n\nUn rappel : le check-out est prévu demain avant 11h00. Nous pouvons garder vos bagages après le départ si vous souhaitez profiter de la ville avant de partir.\n\nAvez-vous besoin d'un transfert pour l'aéroport ?\n\nÀ très bientôt, j'espère !\nL'équipe du ${RIAD}`,
  },
  {
    id: "transfer-out",
    icon: <IconCar size={13} />,
    label: "Transfert départ",
    category: "Départ",
    build: (name) =>
      `Bonjour ${name},\n\nSouhaitez-vous que nous organisions votre transfert vers l'aéroport Marrakech-Ménara pour votre départ ?\n\nMerci de nous indiquer votre heure de vol, nous planifierons le départ au mieux.\n\nBien à vous,\nL'équipe du ${RIAD}`,
  },
  {
    id: "review",
    icon: <IconStar size={13} />,
    label: "Avis & Fidélité",
    category: "Départ",
    build: (name) =>
      `Cher ${name},\n\nCe fut un véritable honneur de vous accueillir au ${RIAD}.\n\nSi votre séjour vous a plu, un avis de votre part nous aiderait beaucoup à faire connaître le riad. Et n'oubliez pas — nos clients fidèles bénéficient toujours d'attentions particulières lors d'un prochain séjour.\n\nÀ très bientôt à Marrakech !\nL'équipe du ${RIAD}`,
  },
];

const CATEGORIES = ["Confirmation", "Préférences", "Services", "Pré-arrivée", "Durant le séjour", "Départ"];

function fmtTime(d: Date) {
  const date = new Date(d);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  if (isYesterday) return `Hier ${time}`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) + " " + time;
}

function fmtDateFr(d: Date) {
  return new Date(d).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
  });
}

export function AdminBookingChat({
  bookingId,
  messages,
  guestName,
  checkIn,
}: {
  bookingId: string;
  messages: Message[];
  guestName: string;
  checkIn: Date;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wasPending = useRef(false);
  const [, formAction, pending] = useActionState(sendAdminMessageAction, undefined);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    markAdminMessagesReadAction(bookingId).catch(() => {});
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (wasPending.current && !pending) setDraft("");
    wasPending.current = pending;
  }, [pending]);

  const unread = messages.filter((m) => m.sender === "guest" && !m.isRead).length;
  const firstName = guestName.split(" ")[0];
  const initials = guestName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const checkInFr = fmtDateFr(checkIn);

  function applyTemplate(tpl: Tpl) {
    setDraft(tpl.build(firstName, checkInFr));
    setShowTemplates(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(9999, 9999);
    }, 30);
  }

  const filtered = TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm flex flex-col">
      {/* Header */}
      <div className="border-b border-sand-100 bg-gradient-to-r from-terracotta/5 to-sand/20 px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta/15 text-sm font-semibold text-terracotta">
              {initials}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{guestName}</p>
            <p className="text-[10px] text-muted">
              Canal privé · {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {unread > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold border transition-all ${
              showTemplates
                ? "bg-terracotta text-white border-terracotta shadow-sm"
                : "bg-white border-sand-200 text-muted hover:text-terracotta hover:border-terracotta/40"
            }`}
          >
            <IconStar size={11} />
            Conciergerie
          </button>
        </div>
      </div>

      {/* Concierge templates panel */}
      {showTemplates && (
        <div className="border-b border-sand-200 bg-sand/20 p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta">
              ✦ Messages conciergerie 5 étoiles
            </p>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-muted hover:text-ink transition-colors rounded-lg p-0.5"
            >
              <IconX size={13} />
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-terracotta text-white shadow-sm"
                    : "bg-white border border-sand-200 text-muted hover:text-ink hover:border-sand-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template buttons */}
          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
            {filtered.map((tpl) => {
              const preview = tpl.build(firstName, checkInFr).split("\n").filter(Boolean)[2] ?? "";
              return (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-3 py-2.5 text-left hover:border-terracotta/40 hover:bg-terracotta/5 transition-all group"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta group-hover:bg-terracotta/20 transition-colors">
                    {tpl.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{tpl.label}</p>
                    <p className="text-[10px] text-muted truncate mt-0.5">{preview}</p>
                  </div>
                  <span className="text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Utiliser →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="overflow-y-auto p-4 space-y-1 flex-1" style={{ minHeight: "260px", maxHeight: showTemplates ? "200px" : "360px" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand/60 mb-3">
              <IconMessageCircle size={20} className="text-muted" />
            </span>
            <p className="text-sm font-medium text-ink/60">Aucun message encore</p>
            <p className="text-xs text-muted mt-1 max-w-[200px]">
              Utilisez la Conciergerie pour envoyer un premier message personnalisé
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isAdmin = msg.sender === "admin";
            const prev = messages[i - 1];
            const showDateSep =
              !prev ||
              new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();

            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div className="flex items-center gap-3 py-3">
                    <div className="h-px flex-1 bg-sand-200/70" />
                    <span className="text-[10px] font-medium text-muted whitespace-nowrap px-1">
                      {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                        weekday: "short", day: "numeric", month: "short",
                      })}
                    </span>
                    <div className="h-px flex-1 bg-sand-200/70" />
                  </div>
                )}

                <div className={`flex items-end gap-2 mb-2 ${isAdmin ? "justify-end" : "justify-start"}`}>
                  {!isAdmin && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-[11px] font-semibold text-terracotta mb-0.5">
                      {initials}
                    </span>
                  )}

                  <div className={`flex flex-col gap-0.5 max-w-[82%] ${isAdmin ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 ${
                        isAdmin
                          ? "bg-terracotta text-white rounded-br-sm"
                          : "bg-sand/60 border border-sand-200 text-ink rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-1 ${isAdmin ? "flex-row-reverse" : ""}`}>
                      <span className="text-[10px] text-muted">{fmtTime(msg.createdAt)}</span>
                      {isAdmin && (
                        <span className={`text-[10px] ${msg.isRead ? "text-emerald-500" : "text-muted"}`}>
                          {msg.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terracotta text-white text-[10px] font-bold mb-0.5">
                      R
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-sand-200 p-3 bg-white shrink-0">
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="bookingId" value={bookingId} />
          <textarea
            ref={textareaRef}
            name="content"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            required
            placeholder={`Écrire à ${firstName}…`}
            rows={draft.split("\n").length > 3 ? Math.min(draft.split("\n").length + 1, 7) : 2}
            className="w-full rounded-xl border border-sand-200 bg-sand/30 px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:bg-white resize-none transition-all"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted select-none">⌘↵ pour envoyer</p>
            <button
              type="submit"
              disabled={pending || !draft.trim()}
              className="rounded-xl bg-terracotta px-4 py-1.5 text-sm font-semibold text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
            >
              {pending ? "…" : "Envoyer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
