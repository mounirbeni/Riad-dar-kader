import { useState } from 'react'
import { motion } from 'framer-motion'
import { rooms as initialRooms } from '../data/mockData'

const VIEWS = { patio: 'Vue patio', terrace: 'Vue terrasse', garden: 'Vue jardin', mountain: 'Vue Atlas', null: '—' }
const PRICE_TYPES = [
  { value: 'base', label: 'Prix de base' },
  { value: 'weekend', label: 'Supplément week-end' },
  { value: 'high', label: 'Haute saison' },
]

export default function Rooms() {
  const [rooms, setRooms] = useState(initialRooms)
  const [editId, setEditId] = useState(null)

  function toggleActive(id) {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))
  }

  const editing = rooms.find(r => r.id === editId)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted">{rooms.filter(r => r.isActive).length}/{rooms.length} chambres actives</p>
        </div>
        <button className="px-4 py-2 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition flex items-center gap-2">
          ＋ Ajouter une chambre
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {rooms.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${room.isActive ? 'border-sand-dark' : 'border-sand-dark opacity-60'}`}>
            {/* Photo placeholder */}
            <div className="h-40 relative flex items-center justify-center" style={{ backgroundColor: room.color + '22' }}>
              <div className="text-5xl opacity-30">🛏</div>
              <div className="absolute top-3 right-3">
                <button onClick={() => toggleActive(room.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${room.isActive ? 'bg-terracotta' : 'bg-sand-dark'}`}>
                  <motion.span layout className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${room.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="text-xs font-semibold text-white px-2 py-1 rounded-lg" style={{ backgroundColor: room.color }}>
                  {room.capacity} pers.
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-serif text-lg text-ink">{room.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted">
                <span>{VIEWS[room.view] || '—'}</span>
                <span>·</span>
                <span className={room.isActive ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                  {room.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-sand-dark flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted">Prix de base / nuit</p>
                  <p className="text-lg font-bold text-terracotta">{room.basePrice.toLocaleString('fr-FR')} <span className="text-sm font-normal text-muted">MAD</span></p>
                </div>
                <button onClick={() => setEditId(room.id)}
                  className="px-3 py-1.5 text-sm text-terracotta border border-terracotta/30 rounded-lg hover:bg-terracotta hover:text-white transition">
                  Modifier
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setEditId(null) }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-sand-dark flex items-center justify-between">
              <h3 className="font-serif text-lg text-ink">{editing.name}</h3>
              <button onClick={() => setEditId(null)} className="text-muted hover:text-ink text-xl leading-none">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Nom de la chambre" defaultValue={editing.name} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Capacité (pers.)" type="number" defaultValue={editing.capacity} />
                <Field label="Prix base (MAD/nuit)" type="number" defaultValue={editing.basePrice} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted mb-1.5 block">Vue</label>
                <select className="w-full px-3 py-2.5 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta">
                  {Object.entries(VIEWS).filter(([k]) => k !== 'null').map(([k, v]) => (
                    <option key={k} value={k} selected={editing.view === k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-2.5 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition">Enregistrer</button>
                <button onClick={() => setEditId(null)} className="flex-1 py-2.5 border border-sand-dark text-muted text-sm rounded-xl hover:border-ink/30 transition">Annuler</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function Field({ label, type = 'text', defaultValue }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted mb-1.5 block">{label}</label>
      <input type={type} defaultValue={defaultValue} className="w-full px-3 py-2.5 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta transition" />
    </div>
  )
}
