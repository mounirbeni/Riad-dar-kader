import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import Reservations from './pages/Reservations'
import Calendar from './pages/Calendar'
import Availability from './pages/Availability'
import Rooms from './pages/Rooms'
import Guests from './pages/Guests'
import Extras from './pages/Extras'
import Housekeeping from './pages/Housekeeping'
import Messages from './pages/Messages'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import Content from './pages/Content'
import Settings from './pages/Settings'

const PAGES = {
  dashboard: { component: Dashboard, label: 'Tableau de bord' },
  reservations: { component: Reservations, label: 'Réservations' },
  calendar: { component: Calendar, label: 'Calendrier' },
  availability: { component: Availability, label: 'Disponibilité' },
  rooms: { component: Rooms, label: 'Chambres' },
  guests: { component: Guests, label: 'Clients' },
  extras: { component: Extras, label: 'Extras & Services' },
  housekeeping: { component: Housekeeping, label: 'Ménage' },
  messages: { component: Messages, label: 'Messages' },
  payments: { component: Payments, label: 'Paiements' },
  reports: { component: Reports, label: 'Rapports' },
  content: { component: Content, label: 'Contenu' },
  settings: { component: Settings, label: 'Paramètres' },
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const { component: Page, label } = PAGES[page]

  return (
    <div className="flex h-screen bg-sand overflow-hidden">
      <Sidebar current={page} onNavigate={setPage} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar label={label} page={page} />
        <main className="flex-1 overflow-auto">
          <Page onNavigate={setPage} />
        </main>
      </div>
    </div>
  )
}
