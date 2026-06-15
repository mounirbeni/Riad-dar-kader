import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { reservations, rooms } from '../data/mockData'

const TABS = ['all', 'confirmed', 'pending', 'cancelled']
const TAB_LABELS = { all: 'Toutes', confirmed: 'Confirmées', pending: 'En attente', cancelled: 'Annulées' }

export default function Reservations() {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = reservations.filter(r => {
    const matchTab = tab === 'all' || r.status === tab
    const matchSearch = r.guestName.toLowerCase().includes(search.toLowerCase()) ||
      r.roomName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-sand-dark p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-terracotta text-white shadow-sm' : 'text-muted hover:text-ink'}`}>
              {TAB_LABELS[t]}
              <span className={`ml-1.5 text-xs ${tab === t ? 'text-white/80' : 'text-muted/60'}`}>
                {tab === t || t === 'all' ? (t === 'all' ? reservations.length : reservations.filter(r => r.status === t).length) : reservations.filter(r => r.status === t).length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm bg-white rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta transition w-52" />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <button className="px-4 py-2 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition flex items-center gap-2">
            <span>＋</span> Nouvelle
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                {['Réf.', 'Client', 'Chambre', 'Arrivée', 'Départ', 'Nuits', 'Total', 'Paiement', 'Statut', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(r)}
                    className="border-b border-sand-dark/40 hover:bg-sand/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-muted">{r.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {r.guestName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-ink whitespace-nowrap">{r.guestName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted whitespace-nowrap">{r.roomName}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{fmt(r.checkIn)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{fmt(r.checkOut)}</td>
                    <td className="px-4 py-3.5 text-center">{r.nights}</td>
                    <td className="px-4 py-3.5 font-medium text-ink whitespace-nowrap">{r.total.toLocaleString('fr-FR')} MAD</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {r.paid ? 'Payé' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3.5">
                      <button className="text-muted hover:text-terracotta transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center py-12 text-muted">Aucune réservation trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-sand-dark flex items-center justify-between text-xs text-muted">
          <span>{filtered.length} réservation{filtered.length > 1 ? 's' : ''}</span>
          <span>Page 1 / 1</span>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-terracotta px-6 py-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-white/60">{selected.id}</p>
                    <h3 className="text-xl font-serif mt-1">{selected.guestName}</h3>
                    <p className="text-sm text-white/80 mt-0.5">{selected.roomName}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-xl leading-none mt-1">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Detail label="Arrivée" value={fmt(selected.checkIn)} />
                  <Detail label="Départ" value={fmt(selected.checkOut)} />
                  <Detail label="Nuits" value={selected.nights} />
                  <Detail label="Source" value={selected.source} />
                  <Detail label="Total" value={`${selected.total.toLocaleString('fr-FR')} MAD`} />
                  <Detail label="Paiement" value={selected.paid ? '✅ Payé' : '⏳ En attente'} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="flex-1 py-2.5 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition">
                    Modifier
                  </button>
                  <button className="flex-1 py-2.5 border border-sand-dark text-muted text-sm font-medium rounded-xl hover:border-red-300 hover:text-red-500 transition">
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function fmt(d) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }

function StatusBadge({ status }) {
  const map = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-600' }
  const labels = { confirmed: 'Confirmé', pending: 'En attente', cancelled: 'Annulé' }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${map[status]}`}>{labels[status]}</span>
}

function Detail({ label, value }) {
  return <div><p className="text-xs text-muted mb-0.5">{label}</p><p className="text-sm font-medium text-ink">{value}</p></div>
}
