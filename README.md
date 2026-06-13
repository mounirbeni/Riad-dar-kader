# Riad Dar Kader — Booking Platform

A custom, SaaS-style direct-booking platform for **Riad Dar Kader**, a traditional
Moroccan riad near Musée Mouassine in the Marrakech Medina.

The booking flow is **availability-first**: guests choose dates and a guest count,
the server computes real riad-wide availability, and offers simplified stay options
(Couple / Standard / Family / Group / Full Riad) — no manual room-picking. The owner
confirms or rejects each request from a private admin panel.

---

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** (warm Moroccan luxury theme)
- **Prisma** + **PostgreSQL**
- **Server Actions** for booking, contact and admin operations
- **Zod** validation, bcrypt + JWT (jose) admin auth, in-memory rate limiting
- Email-ready for **Resend** or **Brevo** (console fallback in dev)
- **WhatsApp** deep-link generation (guest CTA + owner notification)
- French (primary) / English (secondary) i18n, SEO, sitemap, robots, LodgingBusiness schema
- Mobile-first, Vercel-ready

---

## Quick start

### 1. Prerequisites
- Node.js 18+ (tested on 22)
- A PostgreSQL database

### 2. Install
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set at least:
- `DATABASE_URL` — your PostgreSQL connection string
- `AUTH_SECRET` — a long random string (`openssl rand -base64 32`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the owner login created by the seed
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — international format, digits only (e.g. `212600000000`)

### 4. Create the schema & seed data (7 rooms + 10 extras + admin)
```bash
npm run db:push     # apply the Prisma schema
npm run db:seed     # seed rooms, extras, settings and the admin user
```

### 5. Run
```bash
npm run dev         # http://localhost:3000
```

- Public site: `http://localhost:3000/fr` (or `/en`)
- Admin panel: `http://localhost:3000/admin` → login with `ADMIN_EMAIL` / `ADMIN_PASSWORD`

---

## Project structure

```
prisma/
  schema.prisma         # Room, Booking, BookingRoom, Extra, BookingExtra,
                        # BlockedDate, SiteSetting, AdminUser
  seed.ts               # 7 rooms, 10 extras, settings, admin user
src/
  app/
    [locale]/           # public pages: home, le-riad, sejour (booking),
                        # experiences, galerie, contact
    admin/
      login/            # admin login (unprotected)
      (panel)/          # protected: dashboard, bookings, calendar,
                        # rooms, extras, settings
    actions/            # server actions: booking, contact, admin
    sitemap.ts, robots.ts
  components/           # UI + booking flow + admin components
  i18n/                 # locales, dictionaries (fr/en), nav config
  lib/
    availability.ts     # checkAvailability() engine
    auth.ts             # bcrypt + JWT sessions
    pricing.ts, money.ts, dates.ts
    email/              # templates + Resend/Brevo sender
    whatsapp.ts         # guest CTA + owner message/link
    rate-limit.ts, validation.ts (Zod), reference.ts, stats.ts
```

---

## Booking flow (public)

1. **Dates** — check-in, check-out, guests
2. **Availability** — server runs `checkAvailability()` and returns simplified options
3. **Extras** — optional add-ons (transfer, breakfast, dinner, hammam, …)
4. **Details** — name, email, WhatsApp phone, country, special requests
5. **Confirmation** — reference + WhatsApp button. Totals are always *estimated*;
   the owner sends the final confirmation.

### Availability engine — `src/lib/availability.ts`
`checkAvailability({ checkIn, checkOut, guests })`:
- validates dates (rejects past dates and check-out ≤ check-in)
- computes nights
- fetches active rooms
- removes rooms blocked on any night in range (room-level or whole-riad blocks)
- removes rooms held by overlapping **confirmed** bookings (and **pending** ones if
  the admin toggle is on)
- computes available capacity and builds simplified stay options
- returns `{ isAvailable, availableRoomsCount, availableCapacity, suggestedOptions, estimatedPriceRange }`

Overlap rule: a booking occupies nights `[checkIn, checkOut)` — the checkout day is
free, so back-to-back stays don't conflict. Confirmed bookings can never double-book.

---

## Admin panel

- **Dashboard** — new requests, upcoming confirmed, bookings this month, occupancy
  rate, estimated revenue, next arrivals
- **Bookings** — filter by status (pending / confirmed / cancelled / completed),
  view full detail, confirm / cancel / complete, internal notes, WhatsApp owner
  link, send pre-arrival email
- **Calendar** — block/unblock dates (whole riad or a single room)
- **Rooms** — manage names, capacities, prices, active state
- **Extras** — manage names (FR/EN), descriptions, prices, price type, active state
- **Settings** — whether pending requests hold availability, minimum nights

---

## Emails

Templates in `src/lib/email/templates.ts`:
1. Guest — booking request received
2. Owner — new booking notification
3. Booking confirmed
4. Booking cancelled
5. Pre-arrival message

Set `EMAIL_PROVIDER=resend` (+ `RESEND_API_KEY`) or `EMAIL_PROVIDER=brevo`
(+ `BREVO_API_KEY`). With no provider configured, emails are logged to the console
so the flow works locally.

---

## Security

- Admin routes protected by a signed JWT session cookie (httpOnly, SameSite=Lax)
- Passwords hashed with bcrypt (cost 12)
- All forms validated server-side with Zod; booking totals recomputed server-side
- Rate limiting on availability, booking, contact and login
- Honeypot fields on public forms
- Secrets in environment variables; `/admin` excluded from robots

---

## Deploy on Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add a PostgreSQL database (Vercel Postgres, Neon, Supabase, …).
3. Set the environment variables from `.env.example` in the Vercel project.
4. Build command is `prisma generate && next build` (already configured).
5. After the first deploy, run `npm run db:push` and `npm run db:seed` against the
   production database (e.g. locally with the production `DATABASE_URL`).

---

## Notes

- **Photos**: real photos aren't ready yet, so the site uses elegant SVG placeholder
  visuals. Each room has a `photos` field ready to hold real image URLs later.
- All prices are in **MAD** (whole dirhams) and shown as *estimated* until the owner
  confirms.
- Arabic is intentionally out of scope for phase 1.
