import { useState } from 'react'
import { motion } from 'framer-motion'
import { extras as initialExtras } from '../data/mockData'

const PRICE_TYPE_LABELS = {
  per_person_per_night: '/ pers. / nuit',
  per_booking: '/ réservation',
  per_person: '/ personne',
}

export default function Extras() {
  const [extras, setExtras] = useState(initialExtras)
  const [editId, setEditId] = useState(null)
  const [editPrice, setEditPrice] = useState('')

  function toggleActive(id) {
    setExtras(prev => prev.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e))
  }

  function startEdit(extra) {
    setEditId(extra.id)
    setEditPrice(String(extra.price))
  }

  function savePrice(id) {
    setExtras(prev => prev.map(e => e.id === id ? { ...e, price: Number(editPrice) } : e))
    setEditId(null)
  }

  const active = extras.filter(e => e.isActive).length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">{active}/{extras.length} services actifs</p>
        <button className="px-4 py-2 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition">
          ＋ Ajouter un service
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {extras.map((extra, i) => (
          <motion.div key={extra.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${extra.isActive ? 'border-sand-dark' : 'border-sand-dark opacity-55'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-sand flex items-center justify-center text-2xl">
                {extra.icon}
              </div>
              <button onClick={() => toggleActive(extra.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${extra.isActive ? 'bg-terracotta' : 'bg-sand-dark'}`}>
                <motion.span layout className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${extra.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <h3 className="font-medium text-ink text-sm">{extra.nameFr}</h3>
            <p className="text-xs text-muted mt-0.5">{PRICE_TYPE_LABELS[extra.priceType]}</p>

            <div className="mt-4 pt-4 border-t border-sand-dark flex items-center justify-between">
              {editId === extra.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    className="w-24 px-2 py-1 text-sm bg-sand rounded-lg border border-terracotta focus:outline-none"
                    autoFocus
                  />
                  <span className="text-xs text-muted">MAD</span>
                  <button onClick={() => savePrice(extra.id)} className="text-xs font-medium text-terracotta hover:underline">Sauv.</button>
                  <button onClick={() => setEditId(null)} className="text-xs text-muted hover:underline">✕</button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-lg font-bold text-terracotta">{extra.price.toLocaleString('fr-FR')}</span>
                    <span className="text-xs text-muted ml-1">MAD</span>
                  </div>
                  <button onClick={() => startEdit(extra)} className="text-xs text-muted hover:text-terracotta transition flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Modifier
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
