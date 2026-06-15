"use client";

import { useState } from "react";
import { IconShare, IconCopy, IconSun, IconLogIn, IconLogOut, IconUtensilsCrossed, IconBrush, IconMoon, IconCar, IconEdit, IconMessageCircle } from "@/components/Icons";
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
    { id: "bonjour",   label: "Bonjour équipe",  icon: <IconSun size={14} />,             category: "Équipe",       text: `*Bonjour à toute l'équipe ${riad} !*\n\nNous sommes le ${date}.\n\n${departures.length > 0 ? `*Départs aujourd'hui :*\n${departures.map((d) => `• ${d.guestName} — ${d.rooms}`).join("\n")}\n\n` : ""}${arrivals.length > 0 ? `*Arrivées aujourd'hui :*\n${arrivals.map((a) => `• ${a.guestName} (${a.guests} pers.) — ${a.rooms}`).join("\n")}\n\n` : ""}Bonne journée à tous !` },
    { id: "accueil",   label: "Accueil client",  icon: <IconLogIn size={14} />,           category: "Client",       text: arrivals.length > 0 ? `*${riad} — Bienvenue*\n\nCher(s) ${arrivals[0].guestName},\n\nNous sommes ravis de vous accueillir au ${riad} !\n\nVotre chambre — *${arrivals[0].rooms}* — est prête.\n\nCheck-in à partir de 15h00.\nNous vous attendons à l'entrée du riad.\n\nEn cas de besoin, contactez-nous directement ici.\n\nBienvenue à Marrakech !\n— L'équipe ${riad}` : `*${riad} — Bienvenue*\n\nChers clients,\n\nNous sommes ravis de vous accueillir au ${riad} !\n\nVotre chambre est prête.\nCheck-in à partir de 15h00.\n\nEn cas de besoin, contactez-nous ici.\n\nBienvenue à Marrakech !\n— L'équipe ${riad}` },
    { id: "depart",    label: "Rappel départ",   icon: <IconLogOut size={14} />,          category: "Client",       text: departures.length > 0 ? `*${riad} — Rappel départ*\n\nCher(s) ${departures[0].guestName},\n\nNous espérons que votre séjour a été agréable !\n\nCheck-out aujourd'hui avant *11h00*.\nN'hésitez pas à laisser vos bagages à la réception si besoin.\n\nMerci de votre confiance et à très bientôt !\n— L'équipe ${riad}` : `*${riad} — Rappel départ*\n\nChers clients,\n\nCheck-out aujourd'hui avant *11h00*.\n\nMerci de votre confiance !\n— L'équipe ${riad}` },
    { id: "dejeuner",  label: "Petit-déjeuner",  icon: <IconUtensilsCrossed size={14} />, category: "Client",       text: `*Petit-déjeuner — ${riad}*\n\nBonjour !\n\nVotre petit-déjeuner marocain est servi :\nDe 7h30 à 10h30 — sur la terrasse ou dans le patio\n\nAu menu :\n• Msemen & crêpes maison\n• Pain frais & confiture locale\n• Jus d'orange fraîchement pressé\n• Café / thé à la menthe\n• Oeufs à la demande\n\nBon appétit !\n— L'équipe ${riad}` },
    { id: "menage",    label: "Ménage équipe",   icon: <IconBrush size={14} />,           category: "Équipe",       text: `*Planning ménage — ${date}*\n\n${departures.length > 0 ? `Nettoyage complet (après départ) :\n${departures.map((d) => `• ${d.rooms}`).join("\n")}\n\n` : ""}${arrivals.length > 0 ? `Préparation avant arrivée :\n${arrivals.map((a) => `• ${a.rooms}`).join("\n")}\n\n` : ""}Chambres occupées → serviettes + rangement léger\n\nMerci à toute l'équipe !` },
    { id: "bonsoir",   label: "Bonsoir",         icon: <IconMoon size={14} />,            category: "Client",       text: `*Bonsoir de la part du ${riad}*\n\nNous espérons que vous avez passé une belle journée à Marrakech !\n\nDes recommandations de restaurants ?\nBesoin d'un guide pour demain ?\nSouhaitez-vous réserver un hammam ?\n\nNous sommes disponibles pour vous aider.\n\nBonne nuit !\n— L'équipe ${riad}` },
    { id: "transport", label: "Transfert",        icon: <IconCar size={14} />,             category: "Client",       text: `*Transfert — ${riad}*\n\nBonjour,\n\nVotre transfert depuis l'aéroport Marrakech-Ménara est confirmé.\n\nPoint de rendez-vous : Sortie des arrivées\nSigne de reconnaissance : Pancarte "${riad}"\nContact chauffeur : +212 6XX XXX XXX\n\nBon voyage !\n— L'équipe ${riad}` },
    { id: "libre",     label: "Message libre",    icon: <IconEdit size={14} />,            category: "Personnalisé", text: `*${riad}*\n\n` },
  ];
}

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
              <span className="shrink-0">{t.icon}</span>
              <span>{t.label}</span>
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
                <IconCopy size={14} />
                {copied ? "Copié !" : "Copier"}
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
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-sand-200 text-muted">
              <IconMessageCircle size={18} />
            </div>
            <p className="text-sm text-muted">Choisissez un modèle ci-dessus pour le modifier et l'envoyer</p>
          </div>
        )}
      </div>
    </div>
  );
}
