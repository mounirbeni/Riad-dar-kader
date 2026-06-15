import { useState } from 'react'
import { motion } from 'framer-motion'
import { payments } from '../data/mockData'

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  refunded: 'bg-blue-100 text-blue-700',
}
const STATUS_LABELS = { paid: 'Payé', pending: 'En attente', refunded: 'Remboursé' }

export default function Payments() {
  const [filter, setFilter] = useState('all')

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0)

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)

  return (
    <div className="p-6 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total encaissé" amount={totalPaid} color="green" onClick={() => setFilter('paid')} active={filter === 'paid'} />
        <SummaryCard label="En attente" amount={totalPending} color="amber" onClick={() => setFilter('pending')} active={filter === 'pending'} />
        <SummaryCard label="Remboursé" amount={totalRefunded} color="blue" onClick={() => setFilter('refunded')} active={filter === 'refunded'} />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-sand-dark p-1">
          {['all', 'paid', 'pending', 'refunded'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-terracotta text-white' : 'text-muted hover:text-ink'}`}>
              {f === 'all' ? 'Tous' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <button className="px-4 py-2 bg-sand border border-sand-dark text-muted text-sm rounded-xl hover:border-terracotta hover:text-terracotta transition flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          Exporter CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                {['Réf. paiement', 'Réservation', 'Client', 'Montant', 'Mode', 'Date', 'Statut', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr key={p.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-sand-dark/40 hover:bg-sand/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-muted">{p.id}</td>
                  <td className="px-5 py-4 font-mono text-xs text-terracotta">{p.resId}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {p.guest.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-ink whitespace-nowrap">{p.guest}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-ink">{p.amount.toLocaleString('fr-FR')} MAD</td>
                  <td className="px-5 py-4 text-muted">{p.method}</td>
                  <td className="px-5 py-4 text-muted whitespace-nowrap">{p.date}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {p.status === 'pending' && (
                      <button className="text-xs font-medium text-terracotta hover:underline whitespace-nowrap">
                        Marquer payé
                      </button>
                    )}
                    {p.status === 'paid' && (
                      <button className="text-xs text-muted hover:text-blue-600 transition whitespace-nowrap">
                        Rembourser
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-sand-dark flex items-center justify-between text-xs text-muted">
          <span>{filtered.length} paiement{filtered.length > 1 ? 's' : ''}</span>
          <span className="font-medium text-ink">
            Total affiché : {filtered.reduce((s, p) => s + p.amount, 0).toLocaleString('fr-FR')} MAD
          </span>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, amount, color, onClick, active }) {
  const colors = {
    green: { bg: active ? 'bg-green-600' : 'bg-white', text: active ? 'text-white' : 'text-green-700', sub: active ? 'text-white/70' : 'text-green-600/70', icon: '💚' },
    amber: { bg: active ? 'bg-amber-500' : 'bg-white', text: active ? 'text-white' : 'text-amber-700', sub: active ? 'text-white/70' : 'text-amber-600/70', icon: '🟡' },
    blue: { bg: active ? 'bg-blue-600' : 'bg-white', text: active ? 'text-white' : 'text-blue-700', sub: active ? 'text-white/70' : 'text-blue-600/70', icon: '🔵' },
  }
  const c = colors[color]
  return (
    <button onClick={onClick} className={`${c.bg} rounded-2xl shadow-sm border ${active ? 'border-transparent' : 'border-sand-dark'} p-5 text-left transition-all hover:shadow-md w-full`}>
      <p className={`text-xs font-medium mb-2 ${c.sub}`}>{label}</p>
      <p className={`text-2xl font-bold ${c.text}`}>{amount.toLocaleString('fr-FR')} <span className="text-base font-normal">MAD</span></p>
    </button>
  )
}
