import { motion } from 'framer-motion'
import { monthlyRevenue, reservations } from '../data/mockData'

const maxRev = Math.max(...monthlyRevenue.map(m => m.revenue))

const sources = [
  { label: 'Direct / WhatsApp', value: 45, color: '#8B3A2A' },
  { label: 'Airbnb', value: 25, color: '#B8943F' },
  { label: 'Booking.com', value: 20, color: '#5B7A4A' },
  { label: 'Autres', value: 10, color: '#C4B49A' },
]

export default function Reports() {
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0)
  const totalBookings = monthlyRevenue.reduce((s, m) => s + m.bookings, 0)
  const avgNightly = Math.round(totalRevenue / totalBookings / 3.2)

  return (
    <div className="p-6 space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenu annuel', value: `${(totalRevenue / 1000).toFixed(0)}k MAD`, icon: '💰' },
          { label: 'Réservations', value: totalBookings, icon: '📋' },
          { label: 'Prix moyen / nuit', value: `${avgNightly.toLocaleString('fr-FR')} MAD`, icon: '🏨' },
          { label: 'Taux d\'annulation', value: '8%', icon: '❌' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5">
            <div className="text-2xl mb-2">{k.icon}</div>
            <p className="text-xs text-muted">{k.label}</p>
            <p className="text-2xl font-bold text-ink mt-1">{k.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue bar chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-sand-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-ink">Revenu mensuel 2026</h2>
            <span className="text-xs text-muted">en MAD</span>
          </div>
          <div className="flex items-end gap-1.5 h-48">
            {monthlyRevenue.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-lg bg-terracotta cursor-pointer hover:bg-terracotta-light transition-colors relative group"
                  style={{ height: `${(m.revenue / maxRev) * 100}%` }}
                  initial={{ scaleY: 0, originY: 1 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {m.revenue.toLocaleString('fr-FR')} MAD
                  </div>
                </motion.div>
                <span className="text-[10px] text-muted">{m.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Booking sources */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-sand-dark p-6">
          <h2 className="font-semibold text-ink mb-6">Sources de réservation</h2>
          {/* Simple donut SVG */}
          <div className="flex items-center justify-center mb-5">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {sources.reduce((acc, s, i) => {
                const startAngle = acc.angle
                const sweep = (s.value / 100) * 360
                const endAngle = startAngle + sweep
                const r = 45
                const cx = 60, cy = 60
                const startRad = (startAngle - 90) * Math.PI / 180
                const endRad = (endAngle - 90) * Math.PI / 180
                const x1 = cx + r * Math.cos(startRad)
                const y1 = cy + r * Math.sin(startRad)
                const x2 = cx + r * Math.cos(endRad)
                const y2 = cy + r * Math.sin(endRad)
                const largeArc = sweep > 180 ? 1 : 0
                acc.paths.push(
                  <motion.path key={s.label}
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={s.color}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
                  />
                )
                acc.angle = endAngle
                return acc
              }, { angle: 0, paths: [] }).paths}
              <circle cx="60" cy="60" r="28" fill="white" />
              <text x="60" y="58" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1A1A1A">100%</text>
              <text x="60" y="70" textAnchor="middle" fontSize="8" fill="#7A6A58">occupé</text>
            </svg>
          </div>
          <div className="space-y-2.5">
            {sources.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-ink flex-1">{s.label}</span>
                <span className="text-xs font-semibold text-ink">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly comparison table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
        <div className="px-5 py-4 border-b border-sand-dark">
          <h2 className="font-semibold text-ink">Détail mensuel</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                {['Mois', 'Réservations', 'Revenu', 'Rev. moyen / rés.', 'Taux occupation'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyRevenue.map((m, i) => (
                <tr key={m.month} className={`border-b border-sand-dark/40 hover:bg-sand/30 ${i % 2 === 0 ? '' : 'bg-sand/20'}`}>
                  <td className="px-5 py-3 font-medium text-ink">{m.month}</td>
                  <td className="px-5 py-3 text-muted">{m.bookings}</td>
                  <td className="px-5 py-3 font-medium text-ink">{m.revenue.toLocaleString('fr-FR')} MAD</td>
                  <td className="px-5 py-3 text-muted">{Math.round(m.revenue / m.bookings).toLocaleString('fr-FR')} MAD</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-sand-dark rounded-full overflow-hidden">
                        <div className="h-full bg-terracotta rounded-full" style={{ width: `${Math.min(100, Math.round(m.bookings / 33 * 100))}%` }} />
                      </div>
                      <span className="text-xs text-muted">{Math.min(100, Math.round(m.bookings / 33 * 100))}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
