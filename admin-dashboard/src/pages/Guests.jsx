import { useState } from 'react'
import { motion } from 'framer-motion'
import { guests, reservations } from '../data/mockData'

export default function Guests() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  )

  const guestStays = selected
    ? reservations.filter(r => r.guestId === selected.id)
    : []

  return (
    <div className="p-6 flex gap-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* List */}
      <div className={`flex flex-col min-w-0 transition-all ${selected ? 'w-1/2' : 'w-full'}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <input type="text" placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta transition" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <button className="px-4 py-2.5 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition whitespace-nowrap">
            ＋ Ajouter
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                {['Client', 'Contact', 'Nationalité', 'Séjours', 'Dépenses totales', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, i) => (
                <motion.tr key={g.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(g === selected ? null : g)}
                  className={`border-b border-sand-dark/40 hover:bg-sand/50 transition-colors cursor-pointer ${selected?.id === g.id ? 'bg-terracotta/5 border-l-2 border-l-terracotta' : ''}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-terracotta text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {g.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-ink">{g.name}</p>
                        <p className="text-xs text-muted">{g.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted text-xs">{g.phone}</td>
                  <td className="px-4 py-3.5 text-muted text-xs">{g.nationality}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex h-7 w-7 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold items-center justify-center">{g.totalStays}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-ink">{g.totalSpent.toLocaleString('fr-FR')} MAD</td>
                  <td className="px-4 py-3.5">
                    <button className="text-muted hover:text-terracotta transition">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-sand-dark text-xs text-muted">{filtered.length} client{filtered.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Guest profile panel */}
      {selected && (
        <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="w-80 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
            <div className="bg-terracotta px-5 py-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-white/20 text-white text-xl font-bold font-serif flex items-center justify-center mb-3">
                    {selected.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-lg font-serif">{selected.name}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{selected.nationality}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">{selected.totalStays}</p>
                  <p className="text-[11px] text-white/70">séjours</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">{(selected.totalSpent / 1000).toFixed(1)}k</p>
                  <p className="text-[11px] text-white/70">MAD dépensés</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <Info icon="✉️" label="Email" value={selected.email} />
              <Info icon="📱" label="Téléphone" value={selected.phone} />
              <Info icon="📅" label="Dernier séjour" value={new Date(selected.lastStay).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
            </div>
          </div>

          {guestStays.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5">
              <h4 className="font-semibold text-ink text-sm mb-3">Historique des séjours</h4>
              <div className="space-y-3">
                {guestStays.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-ink">{r.roomName}</p>
                      <p className="text-xs text-muted">{new Date(r.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → {new Date(r.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-terracotta">{r.total.toLocaleString('fr-FR')} MAD</p>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <a href={`https://wa.me/${selected.phone?.replace(/\s/g, '').replace('+', '')}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-[#25D366] text-white text-sm font-medium rounded-xl hover:bg-[#1EA855] transition flex items-center justify-center gap-2">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/></svg>
              WhatsApp
            </a>
            <button className="flex-1 py-2.5 border border-sand-dark text-muted text-sm rounded-xl hover:border-terracotta hover:text-terracotta transition">
              Modifier
            </button>
          </div>
        </motion.aside>
      )}
    </div>
  )
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
        <p className="text-sm text-ink truncate">{value}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-600' }
  const labels = { confirmed: 'Confirmé', pending: 'Att.', cancelled: 'Annulé' }
  return <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${map[status]}`}>{labels[status]}</span>
}
