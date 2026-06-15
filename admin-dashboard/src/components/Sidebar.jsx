import { motion } from 'framer-motion'

const NAV = [
  {
    group: 'Vue d\'ensemble',
    items: [
      { key: 'dashboard', label: 'Tableau de bord', icon: <GridIcon /> },
    ]
  },
  {
    group: 'Séjours',
    items: [
      { key: 'reservations', label: 'Réservations', icon: <ListIcon />, badge: 2 },
      { key: 'calendar', label: 'Calendrier', icon: <CalIcon /> },
      { key: 'availability', label: 'Disponibilité', icon: <AvailIcon /> },
    ]
  },
  {
    group: 'Propriété',
    items: [
      { key: 'rooms', label: 'Chambres', icon: <BedIcon /> },
      { key: 'extras', label: 'Extras & Services', icon: <StarIcon /> },
      { key: 'housekeeping', label: 'Ménage', icon: <BrushIcon /> },
    ]
  },
  {
    group: 'Relations clients',
    items: [
      { key: 'guests', label: 'Clients', icon: <UsersIcon /> },
      { key: 'messages', label: 'Messages', icon: <MsgIcon />, badge: 3 },
      { key: 'payments', label: 'Paiements', icon: <CardIcon /> },
    ]
  },
  {
    group: 'Administration',
    items: [
      { key: 'reports', label: 'Rapports', icon: <ChartIcon /> },
      { key: 'content', label: 'Contenu', icon: <EditIcon /> },
      { key: 'settings', label: 'Paramètres', icon: <CogIcon /> },
    ]
  },
]

export default function Sidebar({ current, onNavigate }) {
  return (
    <aside className="w-64 bg-ink flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-terracotta flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold font-serif">R</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-serif text-[15px] font-semibold leading-tight truncate">Riad Dar Kader</p>
            <p className="text-white/40 text-[11px] truncate">Administration</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map(({ key, label, icon, badge }) => {
                const active = current === key
                return (
                  <button
                    key={key}
                    onClick={() => onNavigate(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 relative group ${
                      active
                        ? 'bg-terracotta text-white'
                        : 'text-white/60 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-terracotta rounded-xl"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex-shrink-0">{icon}</span>
                    <span className="relative z-10 flex-1 text-left">{label}</span>
                    {badge && !active && (
                      <span className="relative z-10 flex-shrink-0 h-5 min-w-5 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-terracotta/80 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">KD</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">Kader Mouassine</p>
            <p className="text-white/40 text-[10px] truncate">Propriétaire</p>
          </div>
          <button className="text-white/30 hover:text-white transition-colors flex-shrink-0">
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  )
}

// Icons
function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
}
function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
}
function CalIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function AvailIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
}
function BedIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 4v16M2 8h20v12M2 8c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4"/></svg>
}
function StarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function BrushIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.18 1.02 3.5 1.02 2.35 0 4.27-1.7 4.5-4l-.5-1.02c-.45-.3-1-.5-1.5-.5h-1z"/></svg>
}
function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
}
function MsgIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
}
function CardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
function EditIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function CogIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
}
