import { useState } from 'react'
import { motion } from 'framer-motion'

const SECTIONS = ['general', 'booking', 'notifications', 'account']
const SECTION_LABELS = { general: 'Informations générales', booking: 'Règles de réservation', notifications: 'Notifications', account: 'Compte admin' }

export default function Settings() {
  const [section, setSection] = useState('general')
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-6 flex gap-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar nav */}
      <nav className="w-56 flex-shrink-0 space-y-1">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${section === s ? 'bg-terracotta text-white' : 'text-muted hover:bg-white hover:text-ink'}`}>
            {SECTION_LABELS[s]}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-sand-dark p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-sand-dark">
            <h2 className="font-semibold text-ink text-lg">{SECTION_LABELS[section]}</h2>
            <div className="flex items-center gap-3">
              {saved && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-green-600">
                  ✓ Enregistré
                </motion.span>
              )}
              <button onClick={save} className="px-4 py-2 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition">
                Enregistrer
              </button>
            </div>
          </div>

          {section === 'general' && <GeneralSettings />}
          {section === 'booking' && <BookingSettings />}
          {section === 'notifications' && <NotifSettings />}
          {section === 'account' && <AccountSettings />}
        </motion.div>
      </div>
    </div>
  )
}

function GeneralSettings() {
  return (
    <div className="space-y-5">
      <Row label="Nom de l'établissement" defaultValue="Riad Dar Kader" />
      <Row label="Adresse" defaultValue="Médina, près du Musée Mouassine, Marrakech" />
      <Row label="Numéro WhatsApp" defaultValue="+212 600 000 000" />
      <Row label="Email de contact" type="email" defaultValue="contact@riadarkader.com" />
      <Row label="Site web" defaultValue="https://riadarkader.com" />
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Devise</label>
        <select className="w-full px-4 py-3 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta">
          <option value="MAD">MAD — Dirham marocain</option>
          <option value="EUR">EUR — Euro</option>
          <option value="USD">USD — Dollar américain</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Langue par défaut</label>
        <select className="w-full px-4 py-3 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta">
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  )
}

function BookingSettings() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <Row label="Durée minimale de séjour (nuits)" type="number" defaultValue="2" />
        <Row label="Durée maximale de séjour (nuits)" type="number" defaultValue="30" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <Row label="Heure d'arrivée (check-in)" type="time" defaultValue="15:00" />
        <Row label="Heure de départ (check-out)" type="time" defaultValue="11:00" />
      </div>
      <Row label="Délai de confirmation (heures)" type="number" defaultValue="24" />
      <Toggle label="Réservation directe en ligne" defaultChecked={true} />
      <Toggle label="Confirmation automatique des réservations" defaultChecked={false} />
      <Toggle label="Autoriser les annulations gratuites (72h avant)" defaultChecked={true} />
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Politique d'annulation</label>
        <textarea defaultValue="Annulation gratuite jusqu'à 72h avant l'arrivée. Au-delà, une nuitée sera facturée." rows={3}
          className="w-full px-4 py-3 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta resize-none" />
      </div>
    </div>
  )
}

function NotifSettings() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Choisissez quand et comment recevoir les notifications.</p>
      <div className="space-y-4">
        {[
          { label: 'Nouvelle réservation', sub: 'Alerte immédiate à chaque réservation', checked: true },
          { label: 'Message WhatsApp entrant', sub: 'Notification quand un client envoie un message', checked: true },
          { label: 'Paiement reçu', sub: 'Confirmation de chaque paiement', checked: true },
          { label: 'Annulation', sub: 'Alerte en cas d\'annulation', checked: true },
          { label: 'Rappel ménage', sub: 'Rappel quotidien à 8h avec les tâches du jour', checked: false },
          { label: 'Rapport hebdomadaire', sub: 'Résumé du lundi matin avec stats de la semaine', checked: true },
        ].map(n => (
          <div key={n.label} className="flex items-center justify-between py-3 border-b border-sand-dark last:border-0">
            <div>
              <p className="text-sm font-medium text-ink">{n.label}</p>
              <p className="text-xs text-muted mt-0.5">{n.sub}</p>
            </div>
            <Toggle defaultChecked={n.checked} />
          </div>
        ))}
      </div>
      <Row label="Email de notification" type="email" defaultValue="kader@riadarkader.com" />
    </div>
  )
}

function AccountSettings() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 p-4 bg-sand rounded-xl border border-sand-dark">
        <div className="h-14 w-14 rounded-2xl bg-terracotta text-white text-xl font-bold font-serif flex items-center justify-center flex-shrink-0">
          KD
        </div>
        <div>
          <p className="font-semibold text-ink">Kader Mouassine</p>
          <p className="text-sm text-muted">Propriétaire · Administrateur</p>
        </div>
        <button className="ml-auto text-sm text-terracotta hover:underline">Changer photo</button>
      </div>
      <Row label="Prénom" defaultValue="Kader" />
      <Row label="Nom" defaultValue="Mouassine" />
      <Row label="Email" type="email" defaultValue="kader@riadarkader.com" />
      <hr className="border-sand-dark" />
      <h3 className="font-semibold text-ink text-sm">Changer le mot de passe</h3>
      <Row label="Mot de passe actuel" type="password" defaultValue="" placeholder="••••••••" />
      <Row label="Nouveau mot de passe" type="password" defaultValue="" placeholder="••••••••" />
      <Row label="Confirmer le nouveau mot de passe" type="password" defaultValue="" placeholder="••••••••" />
      <hr className="border-sand-dark" />
      <div>
        <h3 className="font-semibold text-red-500 text-sm mb-2">Zone de danger</h3>
        <button className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition">
          Supprimer le compte
        </button>
      </div>
    </div>
  )
}

function Row({ label, type = 'text', defaultValue, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">{label}</label>
      <input type={type} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full px-4 py-3 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition" />
    </div>
  )
}

function Toggle({ label, sub, defaultChecked }) {
  const [on, setOn] = useState(defaultChecked)
  return label ? (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
      <ToggleSwitch on={on} onToggle={() => setOn(v => !v)} />
    </div>
  ) : (
    <ToggleSwitch on={on} onToggle={() => setOn(v => !v)} />
  )
}

function ToggleSwitch({ on, onToggle }) {
  return (
    <button onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${on ? 'bg-terracotta' : 'bg-sand-dark'}`}>
      <motion.span layout className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}
