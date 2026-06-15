export const rooms = [
  { id: 1, slug: 'mouassine', name: 'Chambre Mouassine', capacity: 2, basePrice: 850, view: 'patio', isActive: true, color: '#8B3A2A' },
  { id: 2, slug: 'terrasse', name: 'Suite Terrasse', capacity: 3, basePrice: 1200, view: 'terrace', isActive: true, color: '#B8943F' },
  { id: 3, slug: 'bab-doukkala', name: 'Chambre Bab Doukkala', capacity: 2, basePrice: 750, view: 'garden', isActive: true, color: '#5B7A4A' },
  { id: 4, slug: 'rahba', name: 'Chambre Rahba', capacity: 2, basePrice: 900, view: 'patio', isActive: true, color: '#4A6B8A' },
  { id: 5, slug: 'patio', name: 'Suite Patio', capacity: 4, basePrice: 1500, view: 'patio', isActive: true, color: '#7A4A8B' },
  { id: 6, slug: 'derb', name: 'Chambre Derb', capacity: 2, basePrice: 700, view: null, isActive: false, color: '#8B7A4A' },
  { id: 7, slug: 'atlas', name: 'Chambre Atlas', capacity: 2, basePrice: 800, view: 'mountain', isActive: true, color: '#4A8B7A' },
]

export const guests = [
  { id: 1, name: 'Sophie Dubois', email: 'sophie.dubois@email.com', phone: '+33 6 12 34 56 78', nationality: 'Française', totalStays: 3, totalSpent: 8550, lastStay: '2026-03-10' },
  { id: 2, name: 'James Mitchell', email: 'j.mitchell@email.com', phone: '+44 7700 900123', nationality: 'Britannique', totalStays: 1, totalSpent: 2550, lastStay: '2026-06-17' },
  { id: 3, name: 'Mohammed El Amrani', email: 'm.elamrani@email.com', phone: '+212 6 61 23 45 67', nationality: 'Marocaine', totalStays: 5, totalSpent: 12000, lastStay: '2026-01-05' },
  { id: 4, name: 'Claire Fontaine', email: 'c.fontaine@email.com', phone: '+32 477 12 34 56', nationality: 'Belge', totalStays: 2, totalSpent: 3600, lastStay: '2026-06-22' },
  { id: 5, name: 'Thomas Bauer', email: 't.bauer@email.com', phone: '+49 151 234 567', nationality: 'Allemand', totalStays: 1, totalSpent: 1500, lastStay: '2026-06-10' },
  { id: 6, name: 'Amina Benali', email: 'a.benali@email.com', phone: '+33 6 98 76 54 32', nationality: 'Franco-Marocaine', totalStays: 4, totalSpent: 9600, lastStay: '2026-06-28' },
  { id: 7, name: 'Lucas Girard', email: 'l.girard@email.com', phone: '+33 7 45 67 89 01', nationality: 'Française', totalStays: 2, totalSpent: 4200, lastStay: '2026-04-20' },
]

export const reservations = [
  { id: 'RES-001', guestId: 1, guestName: 'Sophie Dubois', roomId: 2, roomName: 'Suite Terrasse', checkIn: '2026-06-15', checkOut: '2026-06-20', nights: 5, total: 6000, status: 'confirmed', paid: true, source: 'Direct' },
  { id: 'RES-002', guestId: 2, guestName: 'James Mitchell', roomId: 1, roomName: 'Chambre Mouassine', checkIn: '2026-06-17', checkOut: '2026-06-20', nights: 3, total: 2550, status: 'confirmed', paid: false, source: 'WhatsApp' },
  { id: 'RES-003', guestId: 3, guestName: 'Mohammed El Amrani', roomId: 5, roomName: 'Suite Patio', checkIn: '2026-06-20', checkOut: '2026-06-25', nights: 5, total: 7500, status: 'pending', paid: false, source: 'Direct' },
  { id: 'RES-004', guestId: 4, guestName: 'Claire Fontaine', roomId: 4, roomName: 'Chambre Rahba', checkIn: '2026-06-22', checkOut: '2026-06-24', nights: 2, total: 1800, status: 'confirmed', paid: true, source: 'Airbnb' },
  { id: 'RES-005', guestId: 5, guestName: 'Thomas Bauer', roomId: 3, roomName: 'Chambre Bab Doukkala', checkIn: '2026-06-10', checkOut: '2026-06-12', nights: 2, total: 1500, status: 'cancelled', paid: false, source: 'Booking.com' },
  { id: 'RES-006', guestId: 6, guestName: 'Amina Benali', roomId: 7, roomName: 'Chambre Atlas', checkIn: '2026-06-28', checkOut: '2026-07-02', nights: 4, total: 3200, status: 'confirmed', paid: true, source: 'Direct' },
  { id: 'RES-007', guestId: 7, guestName: 'Lucas Girard', roomId: 1, roomName: 'Chambre Mouassine', checkIn: '2026-07-05', checkOut: '2026-07-09', nights: 4, total: 3400, status: 'pending', paid: false, source: 'WhatsApp' },
]

export const extras = [
  { id: 1, name: 'Petit-déjeuner marocain', nameFr: 'Petit-déjeuner marocain', price: 150, priceType: 'per_person_per_night', isActive: true, icon: '🍵' },
  { id: 2, name: 'Transfert aéroport', nameFr: 'Transfert aéroport', price: 300, priceType: 'per_booking', isActive: true, icon: '🚗' },
  { id: 3, name: 'Hammam privatif', nameFr: 'Hammam privatif', price: 400, priceType: 'per_booking', isActive: true, icon: '♨️' },
  { id: 4, name: 'Massage bien-être', nameFr: 'Massage bien-être', price: 350, priceType: 'per_person', isActive: true, icon: '💆' },
  { id: 5, name: 'Dîner sur la terrasse', nameFr: 'Dîner sur la terrasse', price: 250, priceType: 'per_person', isActive: false, icon: '🍽️' },
  { id: 6, name: 'Excursion Essaouira', nameFr: 'Excursion Essaouira', price: 600, priceType: 'per_booking', isActive: true, icon: '🏖️' },
  { id: 7, name: 'Cours de cuisine', nameFr: 'Cours de cuisine', price: 280, priceType: 'per_person', isActive: true, icon: '👨‍🍳' },
  { id: 8, name: 'Décoration romantique', nameFr: 'Décoration romantique', price: 200, priceType: 'per_booking', isActive: false, icon: '🌹' },
]

export const housekeepingTasks = [
  { id: 1, room: 'Suite Terrasse', task: 'Nettoyage complet départ', staff: 'Fatima', dueTime: '11:00', status: 'done', priority: 'high' },
  { id: 2, room: 'Chambre Mouassine', task: 'Changement draps + serviettes', staff: 'Khadija', dueTime: '12:00', status: 'in-progress', priority: 'high' },
  { id: 3, room: 'Suite Patio', task: 'Préparation arrivée VIP', staff: 'Fatima', dueTime: '14:00', status: 'pending', priority: 'urgent' },
  { id: 4, room: 'Chambre Rahba', task: 'Réapprovisionnement minibar', staff: 'Omar', dueTime: '15:00', status: 'pending', priority: 'normal' },
  { id: 5, room: 'Chambre Atlas', task: 'Nettoyage salle de bain', staff: 'Khadija', dueTime: '11:30', status: 'done', priority: 'normal' },
  { id: 6, room: 'Terrasse commune', task: 'Mise en place petit-déjeuner', staff: 'Omar', dueTime: '18:00', status: 'pending', priority: 'normal' },
  { id: 7, room: 'Chambre Bab Doukkala', task: 'Nettoyage post-départ', staff: 'Khadija', dueTime: '13:00', status: 'in-progress', priority: 'high' },
]

export const messages = [
  { id: 1, guest: 'Sophie Dubois', initials: 'SD', lastMsg: 'Merci pour la confirmation!', time: '10:32', unread: 0,
    thread: [
      { from: 'guest', text: 'Bonjour, le hammam est-il disponible le 16 juin en soirée?', time: '09:15' },
      { from: 'admin', text: 'Bonjour Sophie ! Oui, le hammam est libre. Je vous réserve 18h–20h ?', time: '09:45' },
      { from: 'guest', text: 'Parfait, 18h c\'est idéal. Merci !', time: '10:10' },
      { from: 'guest', text: 'Merci pour la confirmation!', time: '10:32' },
    ]
  },
  { id: 2, guest: 'James Mitchell', initials: 'JM', lastMsg: 'What time is check-in?', time: '09:15', unread: 1,
    thread: [
      { from: 'guest', text: 'Hello! What time is check-in? We arrive from Casablanca airport around 3pm.', time: '09:15' },
    ]
  },
  { id: 3, guest: 'Mohammed El Amrani', initials: 'ME', lastMsg: 'Pouvez-vous organiser un dîner?', time: 'Hier', unread: 2,
    thread: [
      { from: 'guest', text: 'Bonsoir, pouvez-vous organiser un dîner sur la terrasse pour notre arrivée le 20?', time: 'Hier 20:30' },
      { from: 'guest', text: 'Nous serons 4 personnes. Menu traditionnel de préférence.', time: 'Hier 20:31' },
    ]
  },
  { id: 4, guest: 'Amina Benali', initials: 'AB', lastMsg: 'Avez-vous une chambre libre?', time: '8 juin', unread: 0,
    thread: [
      { from: 'guest', text: 'Bonjour, avez-vous la Suite Patio disponible du 5 au 8 juillet?', time: '8 juin 14:00' },
      { from: 'admin', text: 'Bonjour Amina ! Malheureusement la Suite Patio est prise sur cette période, mais la Chambre Rahba est disponible.', time: '8 juin 15:30' },
      { from: 'guest', text: 'Pas de problème, je réserve la Rahba alors !', time: '8 juin 15:45' },
    ]
  },
]

export const payments = [
  { id: 'PAY-001', resId: 'RES-001', guest: 'Sophie Dubois', amount: 6000, method: 'Carte bancaire', date: '2026-05-20', status: 'paid' },
  { id: 'PAY-002', resId: 'RES-002', guest: 'James Mitchell', amount: 2550, method: 'Virement', date: '2026-06-10', status: 'pending' },
  { id: 'PAY-003', resId: 'RES-003', guest: 'Mohammed El Amrani', amount: 7500, method: 'Espèces', date: '—', status: 'pending' },
  { id: 'PAY-004', resId: 'RES-004', guest: 'Claire Fontaine', amount: 1800, method: 'Carte bancaire', date: '2026-06-01', status: 'paid' },
  { id: 'PAY-005', resId: 'RES-005', guest: 'Thomas Bauer', amount: 750, method: 'PayPal', date: '2026-06-08', status: 'refunded' },
  { id: 'PAY-006', resId: 'RES-006', guest: 'Amina Benali', amount: 3200, method: 'Carte bancaire', date: '2026-06-08', status: 'paid' },
  { id: 'PAY-007', resId: 'RES-007', guest: 'Lucas Girard', amount: 3400, method: 'Virement', date: '—', status: 'pending' },
]

export const monthlyRevenue = [
  { month: 'Jan', revenue: 28000, bookings: 12 },
  { month: 'Fév', revenue: 31000, bookings: 14 },
  { month: 'Mar', revenue: 45000, bookings: 19 },
  { month: 'Avr', revenue: 52000, bookings: 22 },
  { month: 'Mai', revenue: 61000, bookings: 26 },
  { month: 'Jun', revenue: 58000, bookings: 24 },
  { month: 'Jul', revenue: 72000, bookings: 30 },
  { month: 'Aoû', revenue: 78000, bookings: 33 },
  { month: 'Sep', revenue: 65000, bookings: 27 },
  { month: 'Oct', revenue: 48000, bookings: 20 },
  { month: 'Nov', revenue: 35000, bookings: 15 },
  { month: 'Déc', revenue: 42000, bookings: 18 },
]
