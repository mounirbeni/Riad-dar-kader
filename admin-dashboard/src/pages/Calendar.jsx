import { useState } from 'react'
import { reservations, rooms } from '../data/mockData'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function getDaysInMonth(year, month) {
  const days = []
  const firstDay = new Date(year, month, 1)
  let startDow = firstDay.getDay()
  if (startDow === 0) startDow = 7
  for (let i = 1; i < startDow; i++) days.push(null)
  const total = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= total; d++) days.push(new Date(year, month, d))
  return days
}

function getBookingsForDay(date) {
  if (!date) return []
  const ds = date.toISOString().slice(0, 10)
  return reservations.filter(r => r.status !== 'cancelled' && ds >= r.checkIn && ds < r.checkOut)
}

export default function Calendar() {
  const now = new Date('2026-06-15')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [hoveredRes, setHoveredRes] = useState(null)

  const days = getDaysInMonth(year, month)

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const activeRooms = rooms.filter(r => r.isActive)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={prev} className="h-9 w-9 rounded-xl bg-white border border-sand-dark text-muted hover:text-terracotta hover:border-terracotta transition flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h2 className="text-xl font-serif text-ink">{MONTHS[month]} {year}</h2>
          <button onClick={next} className="h-9 w-9 rounded-xl bg-white border border-sand-dark text-muted hover:text-terracotta hover:border-terracotta transition flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-sand-dark text-muted hover:text-terracotta hover:border-terracotta rounded-lg transition">
            Aujourd'hui
          </button>
        </div>
        {/* Room legend */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          {activeRooms.map(r => (
            <div key={r.id} className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: r.color }} />
              {r.name.replace('Chambre ', '').replace('Suite ', '')}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-sand-dark">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-muted uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-sand-dark">
          {days.map((date, i) => {
            const isToday = date && date.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
            const bookings = getBookingsForDay(date)
            return (
              <div key={i} className={`min-h-24 p-2 ${!date ? 'bg-sand/30' : 'hover:bg-sand/40 transition-colors'}`}>
                {date && (
                  <>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${isToday ? 'bg-terracotta text-white' : 'text-ink'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {bookings.slice(0, 3).map(b => {
                        const room = rooms.find(r => r.id === b.roomId)
                        return (
                          <div key={b.id}
                            className="text-[10px] text-white px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: room?.color || '#8B3A2A' }}
                            onMouseEnter={() => setHoveredRes(b)}
                            onMouseLeave={() => setHoveredRes(null)}
                          >
                            {b.guestName.split(' ')[0]}
                          </div>
                        )
                      })}
                      {bookings.length > 3 && (
                        <div className="text-[10px] text-muted">+{bookings.length - 3}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming this month */}
      <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5">
        <h3 className="font-semibold text-ink mb-4">Ce mois — arrivées prévues</h3>
        <div className="space-y-3">
          {reservations.filter(r => r.checkIn.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`) && r.status !== 'cancelled').map(r => (
            <div key={r.id} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: rooms.find(rm => rm.id === r.roomId)?.color || '#8B3A2A' }}>
                {r.guestName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{r.guestName}</p>
                <p className="text-xs text-muted">{r.roomName} · {r.nights} nuit{r.nights > 1 ? 's' : ''}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-ink">{new Date(r.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                <p className="text-xs text-muted">{r.total.toLocaleString('fr-FR')} MAD</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
