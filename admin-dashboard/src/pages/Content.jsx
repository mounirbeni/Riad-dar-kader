import { useState } from 'react'
import { motion } from 'framer-motion'

const TABS = ['homepage', 'rooms', 'extras']
const TAB_LABELS = { homepage: 'Page d\'accueil', rooms: 'Chambres', extras: 'Extras & Services' }

const DEFAULT_CONTENT = {
  homepage: {
    heroTitle: 'Une parenthèse de sérénité au cœur de la Médina',
    heroSubtitle: 'Riad traditionnel marocain niché dans les ruelles de Marrakech, à deux pas du Musée Mouassine.',
    heroKicker: 'Riad de charme — Marrakech',
    sellingTitle: 'Pourquoi choisir Dar Kader ?',
    whatsappTitle: 'Réservez directement avec nous',
    whatsappText: 'Bénéficiez des meilleurs tarifs et d\'un service personnalisé en réservant via WhatsApp.',
  },
  rooms: {
    title: 'Nos chambres & suites',
    subtitle: 'Sept chambres uniques, chacune habillée d\'artisanat marocain authentique — zellige, tadelakt et bois sculpté.',
    kicker: 'Hébergement',
  },
  extras: {
    title: 'Expériences & Services',
    subtitle: 'Des moments inoubliables soigneusement sélectionnés pour enrichir votre séjour.',
    kicker: 'À votre service',
  }
}

export default function Content() {
  const [tab, setTab] = useState('homepage')
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [saved, setSaved] = useState(false)

  function update(field, value) {
    setContent(prev => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }))
    setSaved(false)
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const fields = content[tab]

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-sand-dark p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-terracotta text-white' : 'text-muted hover:text-ink'}`}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">{TAB_LABELS[tab]}</h2>
            <div className="flex items-center gap-3">
              {saved && (
                <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-medium text-green-600 flex items-center gap-1.5">
                  <span>✓</span> Sauvegardé
                </motion.span>
              )}
              <button onClick={save} className="px-4 py-2 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition">
                Enregistrer
              </button>
            </div>
          </div>

          {Object.entries(fields).map(([key, val]) => (
            <div key={key}>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                {fieldLabel(key)}
              </label>
              {val.length > 80 ? (
                <textarea
                  value={val}
                  onChange={e => update(key, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={e => update(key, e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition"
                />
              )}
            </div>
          ))}
        </div>

        {/* Preview card */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <h3 className="text-sm font-medium text-muted">Aperçu</h3>
          </div>
          {tab === 'homepage' && (
            <div className="bg-terracotta rounded-xl p-6 text-white">
              <p className="text-[11px] uppercase tracking-widest text-white/60 mb-2">{fields.heroKicker}</p>
              <h2 className="font-serif text-2xl leading-tight mb-3">{fields.heroTitle}</h2>
              <p className="text-sm text-white/80 leading-relaxed">{fields.heroSubtitle}</p>
            </div>
          )}
          {tab === 'rooms' && (
            <div className="border border-sand-dark rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-terracotta mb-1">{fields.kicker}</p>
              <h2 className="font-serif text-xl text-ink mb-2">{fields.title}</h2>
              <p className="text-sm text-muted">{fields.subtitle}</p>
            </div>
          )}
          {tab === 'extras' && (
            <div className="border border-sand-dark rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-terracotta mb-1">{fields.kicker}</p>
              <h2 className="font-serif text-xl text-ink mb-2">{fields.title}</h2>
              <p className="text-sm text-muted">{fields.subtitle}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function fieldLabel(key) {
  const labels = {
    heroTitle: 'Titre principal (héro)',
    heroSubtitle: 'Sous-titre (héro)',
    heroKicker: 'Étiquette au-dessus du titre',
    sellingTitle: 'Titre — section avantages',
    whatsappTitle: 'Titre — section WhatsApp',
    whatsappText: 'Texte — section WhatsApp',
    title: 'Titre de la page',
    subtitle: 'Sous-titre de la page',
    kicker: 'Étiquette de section',
  }
  return labels[key] || key
}
