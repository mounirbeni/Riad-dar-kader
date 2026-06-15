import { useState } from 'react'
import { rooms, reservations } from '../data/mockData'

function getDays(year, month) {
  const total = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: total }, (_, i) => new Date(year, month, i + 1))
}

function getStatus(roomId, date) {
  const ds = date.toISOString().slice(0, 10)
  const booked = reservations.find(r => r.roomId === roomId && r.status !== 'cancelled' && ds >= r.checkIn && ds < r.checkOut)
  if (booked) return 'booked'
  return 'available'
}

export default function Availability() {
  const now = new Date('2026-06-15')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [blocked, setBlocked] = useState(new Set())

  const days = getDays(year, month)
  const activeRooms = rooms.filter(r => r.isActive)
  const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  function toggleBlock(roomId, ds) {
    const key = `${roomId}-${ds}`
    setBlocked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function prev() { month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1) }
  function next() { month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1) }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={prev} className="h-9 w-9 rounded-xl bg-white border border-sand-dark text-muted hover:text-terracotta hover:border-terracotta transition flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h2 className="text-xl font-serif text-ink">{MONTHS[month]} {year}</h2>
          <button onClick={next} className="h-9 w-9 rounded-xl bg-white border border-sand-dark text-muted hover:text-terracotta hover:border-terracotta transition flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-green-200" /> Disponible</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-terracotta/60" /> Réservé</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-ink/20" /> Bloqué</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse" style={{ minWidth: `${180 + days.length * 36}px` }}>
            <thead>
              <tr className="bg-sand border-b border-sand-dark">
                <th className="sticky left-0 bg-sand text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide w-44 min-w-44 border-r border-sand-dark z-10">
                  Chambre
                </th>
                {days.map(d => {
                  const isToday = d.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <th key={d.getDate()} className={`text-center px-1 py-3 text-xs font-medium w-9 min-w-9 ${isToday ? 'text-terracotta font-bold' : isWeekend ? 'text-muted/70' : 'text-muted'}`}>
                      <div>{d.getDate()}</div>
                      <div className="text-[9px] uppercase">{['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()]}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {activeRooms.map((room, ri) => (
                <tr key={room.id} className={`border-b border-sand-dark/50 ${ri % 2 === 0 ? '' : 'bg-sand/20'}`}>
                  <td className="sticky left-0 bg-inherit border-r border-sand-dark px-4 py-3 z-10">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: room.color }} />
                      <span className="font-medium text-ink text-xs whitespace-nowrap">{room.name}</span>
                    </div>
                    <div className="text-[10px] text-muted mt-0.5 ml-4.5">{room.basePrice.toLocaleString('fr-FR')} MAD/nuit</div>
                  </td>
                  {days.map(d => {
                    const ds = d.toISOString().slice(0, 10)
                    const status = getStatus(room.id, d)
                    const key = `${room.id}-${ds}`
                    const isBlocked = blocked.has(key)
                    const isPast = d < new Date(now.toISOString().slice(0, 10))
                    return (
                      <td key={ds} className="p-0.5 text-center">
                        <button
                          disabled={status === 'booked' || isPast}
                          onClick={() => toggleBlock(room.id, ds)}
                          title={status === 'booked' ? 'Réservé' : isBlocked ? 'Cliquer pour débloquer' : 'Cliquer pour bloquer'}
                          className={`h-8 w-8 rounded text-[10px] font-medium transition-colors mx-auto block ${
                            status === 'booked'
                              ? 'cursor-default'
                              : isBlocked
                              ? 'hover:bg-ink/30 cursor-pointer'
                              : isPast
                              ? 'cursor-default'
                              : 'hover:bg-sand cursor-pointer'
                          }`}
                          style={{
                            backgroundColor: status === 'booked'
                              ? room.color + 'aa'
                              : isBlocked
                              ? '#1A1A1A44'
                              : isPast
                              ? '#F5F0E8'
                              : '#DCFCE7',
                          }}
                        >
                          {status === 'booked' ? '◼' : isBlocked ? '✕' : isPast ? '' : ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted">Cliquez sur une case verte pour bloquer une date. Recliquez pour débloquer.</p>
    </div>
  )
}
