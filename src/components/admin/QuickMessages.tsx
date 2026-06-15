"use client";

import { useState } from "react";
import { IconShare } from "@/components/Icons";

type Arrival = { guestName: string; rooms: string; ref: string; guests: number };
type Departure = { guestName: string; rooms: string; ref: string };

type Props = {
  dateStr: string;
  arrivals: Arrival[];
  departures: Departure[];
};

function formatDateFR(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

function buildTemplates(dateStr: string, arrivals: Arrival[], departures: Departure[]) {
  const date = formatDateFR(dateStr);
  const riad = "Riad Dar Kader";

  return [
    {
      id: "bonjour",
      label: "🌅 Bonjour",
      category: "Équipe",
      text: `🌅 *Bonjour à toute l'équipe ${riad} !*\n\n📅 Nous sommes le ${date}.\n\n${
        departures.length > 0
          ? `🛫 *Départs aujourd'hui :*\n${departures.map((d) => `• ${d.guestName} — ${d.rooms}`).join("\n")}\n\n`
          : ""
      }${
        arrivals.length > 0
          ? `🛬 *Arrivées aujourd'hui :*\n${arrivals.map((a) => `• ${a.guestName} (${a.guests} pers.) — ${a.rooms}`).join("\n")}\n\n`
          : ""
      }Bonne journée à tous ! 💪`,
    },
    {
      id: "accueil",
      label: "🛬 Accueil client",
      category: "Client",
      text: arrivals.length > 0
        ? `🏡 *${riad} — Message d'accueil*\n\nChers ${arrivals[0].guestName},\n\nNous sommes ravis de vous accueillir au ${riad} ! 🌟\n\nVotre chambre — *${arrivals[0].rooms}* — est prête et vous attend.\n\n🔑 Check-in à partir de 15h00\n📍 Nous vous attendons à l'entrée du riad\n📞 En cas de besoin, contactez-nous ici\n\nBienvenue à Marrakech ! ✨`
        : `🏡 *${riad} — Message d'accueil*\n\nChers clients,\n\nNous sommes ravis de vous accueillir au ${riad} ! 🌟\n\nVotre chambre est prête et vous attend.\n\n🔑 Check-in à partir de 15h00\n📞 En cas de besoin, contactez-nous ici\n\nBienvenue à Marrakech ! ✨`,
    },
    {
      id: "depart",
      label: "🛫 Rappel départ",
      category: "Client",
      text: departures.length > 0
        ? `🏡 *${riad} — Rappel départ*\n\nCher(s) ${departures[0].guestName},\n\nNous espérons que votre séjour parmi nous a été agréable ! 😊\n\n⏰ Check-out aujourd'hui avant *11h00*\n🧳 Laissez vos bagages à la réception si besoin\n\nMerci de votre confiance et à très bientôt ! 🙏\n\n— L'équipe ${riad}`
        : `🏡 *${riad} — Rappel départ*\n\nCher(s) clients,\n\nNous espérons que votre séjour a été agréable ! 😊\n\n⏰ Check-out aujourd'hui avant *11h00*\n🧳 Laissez vos bagages à la réception si besoin\n\nMerci de votre confiance ! 🙏\n\n— L'équipe ${riad}`,
    },
    {
      id: "dejeuner",
      label: "🍳 Petit-déjeuner",
      category: "Client",
      text: `🍳 *Petit-déjeuner — ${riad}*\n\nBonjour ! 😊\n\nVotre petit-déjeuner marocain est servi :\n🕗 De 7h30 à 10h30\n☀️ Sur la terrasse ou dans le patio\n\nAu menu :\n• Msemen & crêpes maison\n• Pain frais & confiture locale\n• Jus d'orange fraîchement pressé\n• Café / thé à la menthe\n• Œufs à la demande\n\nBon appétit ! 🫖`,
    },
    {
      id: "menage",
      label: "🧹 Ménage équipe",
      category: "Équipe",
      text: `🧹 *Planning ménage — ${date}*\n\n${departures.length > 0 ? `🔴 *Nettoyage complet (après départ) :*\n${departures.map((d) => `• ${d.rooms}`).join("\n")}\n\n` : ""}${arrivals.length > 0 ? `🟢 *Préparation avant arrivée :*\n${arrivals.map((a) => `• ${a.rooms}`).join("\n")}\n\n` : ""}✅ Chambres occupées → serviettes + rangement léger\n\nMerci à toute l'équipe ! 💪`,
    },
    {
      id: "bonsoir",
      label: "🌙 Bonsoir",
      category: "Client",
      text: `🌙 *Bonsoir de la part du ${riad}*\n\nNous espérons que vous avez passé une belle journée à Marrakech ! ✨\n\n🍽️ Des recommandations de restaurants ?\n🚶 Besoin d'un guide pour demain ?\n🛁 Souhaitez-vous réserver un hammam ?\n\nNous sommes disponibles pour vous aider. Bonne nuit ! 🌟`,
    },
    {
      id: "transport",
      label: "🚗 Transfert",
      category: "Client",
      text: `🚗 *Transfert — ${riad}*\n\nBonjour,\n\nVotre transfert depuis l'aéroport Marrakech-Ménara est confirmé :\n\n📍 Point de rendez-vous : Sortie des arrivées\n🪧 Signe de reconnaissance : Pancarte "${riad}"\n📞 Contact chauffeur : +212 6XX XXX XXX\n\nBon voyage ! ✈️`,
    },
    {
      id: "libre",
      label: "✏️ Message libre",
      category: "Personnalisé",
      text: `🏡 *${riad}*\n\n`,
    },
  ];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Équipe": "bg-amber-50 border-amber-200 text-amber-700",
  "Client": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "Personnalisé": "bg-sand border-sand-200 text-muted",
};

export function QuickMessages({ dateStr, arrivals, departures }: Props) {
  const templates = buildTemplates(dateStr, arrivals, departures);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  function selectTemplate(id: string) {
    const t = templates.find((t) => t.id === id);
    if (!t) return;
    setSelectedId(id);
    setText(t.text);
    setCopied(false);
  }

  function shareWhatsApp() {
    if (!text.trim()) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function copyText() {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-2xl bg-white border border-sand-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-sand-200 bg-sand/30 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-ink">Messages rapides</h2>
          <p className="text-xs text-muted mt-0.5">Sélectionnez un modèle · modifiez · envoyez sur WhatsApp</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Template chips */}
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTemplate(t.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border transition-all ${
                selectedId === t.id
                  ? "bg-terracotta text-white border-terracotta shadow-sm scale-[1.02]"
                  : "bg-white border-sand-200 text-ink hover:border-terracotta/40 hover:bg-sand/30"
              }`}
            >
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
                selectedId === t.id ? "bg-white/20 border-white/30 text-white" : CATEGORY_COLORS[t.category] ?? "bg-sand text-muted border-sand-200"
              }`}>
                {t.category}
              </span>
            </button>
          ))}
        </div>

        {/* Editor */}
        {selectedId && (
          <div className="space-y-3">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Editable textarea */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wide">
                  Modifier avant d'envoyer
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-ink font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none"
                />
              </div>

              {/* Live WhatsApp preview */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wide">
                  Aperçu WhatsApp
                </label>
                <div className="rounded-xl bg-[#0b1929] p-4 min-h-[250px]">
                  <div className="rounded-xl bg-[#1e3a2f] p-3 inline-block max-w-full">
                    <p className="text-[#e9e9e9] text-xs font-mono whitespace-pre-line leading-relaxed break-words">
                      {text || "…"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={shareWhatsApp}
                disabled={!text.trim()}
                className="flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe5d] disabled:opacity-40 transition-colors shadow-sm"
              >
                <IconShare size={15} />
                Envoyer sur WhatsApp
              </button>
              <button
                onClick={copyText}
                disabled={!text.trim()}
                className="flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm font-medium text-muted hover:text-ink disabled:opacity-40 transition-colors"
              >
                {copied ? "✓ Copié !" : "📋 Copier"}
              </button>
              <button
                onClick={() => {
                  const t = templates.find((t) => t.id === selectedId);
                  if (t) setText(t.text);
                }}
                className="text-xs text-muted hover:text-terracotta transition-colors"
              >
                ↩ Réinitialiser
              </button>
            </div>
          </div>
        )}

        {!selectedId && (
          <div className="rounded-xl bg-sand/40 border border-sand-200 py-8 text-center">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm text-muted">Choisissez un modèle ci-dessus pour le modifier et l'envoyer</p>
          </div>
        )}
      </div>
    </div>
  );
}
