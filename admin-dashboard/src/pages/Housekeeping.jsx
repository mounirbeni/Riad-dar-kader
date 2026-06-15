import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { housekeepingTasks as initial } from '../data/mockData'

const PRIORITY_STYLES = {
  urgent: 'bg-red-100 text-red-600 border-red-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  normal: 'bg-sand text-muted border-sand-dark',
}
const PRIORITY_LABELS = { urgent: '🔴 Urgent', high: '🟡 Haute', normal: '🟢 Normal' }
const STATUS_LABELS = { done: '✅ Fait', 'in-progress': '⏳ En cours', pending: '⬜ À faire' }

export default function Housekeeping() {
  const [tasks, setTasks] = useState(initial)
  const [tab, setTab] = useState('today')
  const [showAdd, setShowAdd] = useState(false)

  function cycleStatus(id) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const next = { pending: 'in-progress', 'in-progress': 'done', done: 'pending' }
      return { ...t, status: next[t.status] }
    }))
  }

  const done = tasks.filter(t => t.status === 'done').length
  const total = tasks.length

  return (
    <div className="p-6 space-y-6">
      {/* Progress bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink">Progression du jour</h2>
          <span className="text-sm font-bold text-terracotta">{done}/{total} tâches</span>
        </div>
        <div className="h-3 bg-sand rounded-full overflow-hidden">
          <motion.div className="h-full bg-terracotta rounded-full" initial={{ width: 0 }} animate={{ width: `${(done / total) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted">
          <span>{tasks.filter(t => t.status === 'pending').length} à faire · {tasks.filter(t => t.status === 'in-progress').length} en cours · {done} terminées</span>
          <span>{Math.round((done / total) * 100)}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-sand-dark p-1">
          {['today', 'tomorrow', 'all'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-terracotta text-white' : 'text-muted hover:text-ink'}`}>
              {t === 'today' ? "Aujourd'hui" : t === 'tomorrow' ? 'Demain' : 'Tout'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition">
          ＋ Nouvelle tâche
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => (
            <motion.div key={task.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4 transition-all ${task.status === 'done' ? 'opacity-60' : ''}`}>
              {/* Status toggle */}
              <button onClick={() => cycleStatus(task.id)}
                className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0 transition-all ${
                  task.status === 'done' ? 'bg-green-500 border-green-500 text-white' :
                  task.status === 'in-progress' ? 'border-amber-400 bg-amber-50 text-amber-600' :
                  'border-sand-dark bg-white text-transparent hover:border-terracotta/50'
                }`}>
                {task.status === 'done' ? '✓' : task.status === 'in-progress' ? '⟳' : ''}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-muted' : 'text-ink'}`}>{task.task}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority]}`}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">{task.room} · Assigné à <span className="font-medium text-ink">{task.staff}</span></p>
              </div>

              {/* Time */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-ink">{task.dueTime}</p>
                <p className="text-[10px] text-muted">{STATUS_LABELS[task.status]}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add task modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
            <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
              <h3 className="font-serif text-lg text-ink">Nouvelle tâche de ménage</h3>
              <Field label="Chambre / Zone" />
              <Field label="Description de la tâche" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted mb-1.5 block">Heure limite</label>
                  <input type="time" defaultValue="12:00" className="w-full px-3 py-2.5 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted mb-1.5 block">Priorité</label>
                  <select className="w-full px-3 py-2.5 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta">
                    <option>Normal</option><option>Haute</option><option>Urgent</option>
                  </select>
                </div>
              </div>
              <Field label="Assigner à" />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-terracotta text-white text-sm font-medium rounded-xl hover:bg-terracotta-dark transition">Créer</button>
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-sand-dark text-muted text-sm rounded-xl hover:border-ink/30 transition">Annuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted mb-1.5 block">{label}</label>
      <input type="text" className="w-full px-3 py-2.5 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta transition" />
    </div>
  )
}
