import { motion } from 'framer-motion'
import { reservations, rooms, payments } from '../data/mockData'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
const confirmed = reservations.filter(r => r.status === 'confirmed').length
const pending = reservations.filter(r => r.status === 'pending').length
const todayCheckins = reservations.filter(r => r.checkIn === '2026-06-15').length

export default function Dashboard({ onNavigate }) {
  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon="💰" label="Revenu ce mois" value={`${totalRevenue.toLocaleString('fr-FR')} MAD`} sub="+12% vs. mai" color="terracotta" variants={fadeUp} />
        <KpiCard icon="📋" label="Réservations actives" value={confirmed} sub={`${pending} en attente`} color="brass" variants={fadeUp} />
        <KpiCard icon="🏨" label="Taux d'occupation" value="78%" sub="5/7 chambres occupées" color="green" variants={fadeUp} />
        <KpiCard icon="✈️" label="Arrivées aujourd'hui" value={todayCheckins} sub="Départs: 1" color="blue" variants={fadeUp} />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent reservations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
          <div className="px-5 py-4 border-b border-sand-dark flex items-center justify-between">
            <h2 className="font-semibold text-ink">Réservations récentes</h2>
            <button onClick={() => onNavigate('reservations')} className="text-xs text-terracotta hover:underline">Voir tout →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-dark bg-sand">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Client</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Chambre</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Arrivée</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Montant</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Statut</th>
                </tr>
              </thead>
              <tbody>
                {reservations.slice(0, 5).map((r, i) => (
                  <tr key={r.id} className={`border-b border-sand-dark/50 hover:bg-sand/50 transition-colors ${i % 2 === 0 ? '' : 'bg-sand/20'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {r.guestName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-ink">{r.guestName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-muted">{r.roomName}</td>
                    <td className="px-3 py-3.5 text-muted">{new Date(r.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-3 py-3.5 font-medium text-ink">{r.total.toLocaleString('fr-FR')} MAD</td>
                    <td className="px-3 py-3.5"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Room occupancy */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5">
            <h2 className="font-semibold text-ink mb-4">Chambres ce soir</h2>
            <div className="space-y-2.5">
              {rooms.filter(r => r.isActive).map(room => {
                const booked = reservations.some(res => res.roomId === room.id && res.status === 'confirmed')
                return (
                  <div key={room.id} className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: booked ? room.color : '#D1C9BE' }} />
                    <span className="text-sm text-ink flex-1 truncate">{room.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${booked ? 'bg-terracotta/10 text-terracotta' : 'bg-sand text-muted'}`}>
                      {booked ? 'Occupée' : 'Libre'}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5">
            <h2 className="font-semibold text-ink mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Nouvelle réservation', icon: '＋', page: 'reservations' },
                { label: 'Voir calendrier', icon: '📅', page: 'calendar' },
                { label: 'Messages', icon: '💬', page: 'messages' },
                { label: 'Rapports', icon: '📊', page: 'reports' },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.page)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-sand hover:bg-terracotta/10 hover:text-terracotta transition-colors text-center">
                  <span className="text-lg">{a.icon}</span>
                  <span className="text-[11px] font-medium text-muted leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, sub, color, variants }) {
  const colors = {
    terracotta: 'bg-terracotta/10 text-terracotta',
    brass: 'bg-brass/10 text-brass',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <motion.div variants={variants} className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5">
      <div className={`h-10 w-10 rounded-xl ${colors[color]} flex items-center justify-center text-lg mb-3`}>{icon}</div>
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-bold text-ink mt-1">{value}</p>
      <p className="text-xs text-muted mt-1">{sub}</p>
    </motion.div>
  )
}

function StatusBadge({ status }) {
  const map = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-600',
  }
  const labels = { confirmed: 'Confirmé', pending: 'En attente', cancelled: 'Annulé' }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>
}
