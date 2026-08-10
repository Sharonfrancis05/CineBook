# 🎬 CineBook — Movie Ticket Booking Platform

A premium, Netflix × BookMyShow–inspired movie ticket booking app with real-time
seat selection, QR-code e-tickets, an admin dashboard, and a Python analytics
reporting layer.

**Stack:** React (Vite) · Tailwind CSS v4 · Framer Motion · Zustand · React
Router · Supabase (Auth, Postgres, Realtime, RLS) · qrcode.react · Python
(pandas + Plotly)

---

## 0. Try it in 60 seconds (no backend needed)

The app ships with a **demo mode**: if Supabase credentials aren't set, every
screen runs against local mock data and `localStorage` instead. This lets you
see the whole product — browsing, booking, QR tickets, admin, analytics —
before setting up a database.

```bash
npm install
npm run dev
```

Open the printed local URL. Sign up with any email/password (it's faked
locally) and book a ticket end to end.

To become an admin in demo mode, open your browser's dev tools console and run:
```js
const u = JSON.parse(localStorage.getItem('cinebook_demo_user'))
u.role = 'admin'
localStorage.setItem('cinebook_demo_user', JSON.stringify(u))
```
then refresh — an **Admin** link appears in the navbar.

---

## 1. Project structure

```
cinebook/
├── src/
│   ├── components/
│   │   ├── ui/          Button, Badge, ToastContainer — small reusable pieces
│   │   ├── layout/       Navbar, Footer, ProtectedRoute
│   │   ├── movies/       MovieCard
│   │   └── seats/        SeatMap (the real-time seat grid)
│   ├── pages/            One file per route (Home, MovieDetails, Checkout...)
│   │   └── admin/        AdminDashboard, AnalyticsPanel
│   ├── store/             Zustand stores: authStore, bookingStore, uiStore
│   ├── lib/
│   │   ├── supabase.js    Supabase client (auto-detects demo vs live mode)
│   │   └── api.js         Every data call the UI makes — swap-safe by design
│   └── data/mockData.js   Demo-mode data, shaped exactly like the DB schema
├── sql/schema.sql         Full Postgres schema for Supabase
├── python/analytics.py    pandas + Plotly reporting script
└── .env.example           Copy to .env and fill in your Supabase keys
```

**Why `lib/api.js` matters:** every page calls functions like `getMovies()`
or `createBooking()` — never Supabase or mock data directly. Internally,
each function checks `isSupabaseConfigured` and branches. This means going
from demo to production is just adding two environment variables; zero
component code changes.

---

## 2. Phase-by-phase build guide

### Phase 1 — Project setup & UI (done)
- Vite + React scaffolded, Tailwind v4 wired in via `@tailwindcss/vite`
- Design tokens defined once in `src/index.css` (`@theme` block): colors,
  fonts, glassmorphism utility classes — every component pulls from these
  instead of hardcoding hex values, so a rebrand is a one-file change
- Framer Motion used for page transitions, hover states, and the sticky
  checkout bar

### Phase 2 — Database (done)
Run `sql/schema.sql` once in your Supabase SQL editor. It creates, in order:
1. **Tables**: `profiles`, `theatres`, `screens`, `movies`, `shows`,
   `bookings`, `booking_seats`, `payments`
2. **Indexes** for the columns every query filters on (movie status, show
   date, booking user, etc.)
3. **Triggers**: auto-create a `profiles` row when someone signs up;
   auto-stamp `updated_at` on edits
4. **`book_seats()` function** — the heart of the booking flow. It wraps
   "check availability → insert booking → insert seats → insert payment" in
   one transaction. Because `booking_seats` has a `unique(show_id,
   seat_label)` constraint, if two people click the same seat at the same
   moment, the second transaction fails with a clean database error instead
   of silently double-booking — no manual locking code needed
5. **Views** for analytics: `revenue_by_day`, `occupancy_by_show`,
   `top_movies_by_revenue`, `popular_theatres`
6. **Row Level Security** policies — explained in section 4 below
7. Adds `booking_seats` to the Realtime publication

### Phase 3 — Authentication (done)
`src/store/authStore.js` wraps Supabase Auth:
- Email/password sign up & sign in
- Google OAuth (`signInWithGoogle`) — enable the Google provider under
  Supabase → Authentication → Providers, and add your OAuth client ID/secret
- Session persistence and auto-refresh are handled by the Supabase client
  config in `lib/supabase.js`
- `ProtectedRoute` component guards booking/profile/admin routes

### Phase 4 — Booking logic (done)
1. User picks a movie → showtime (`MovieDetails.jsx`)
2. `SeatSelection.jsx` loads the seat map and **subscribes to Realtime**:
   ```js
   supabase.channel(`seats-${showId}`)
     .on('postgres_changes', { event: '*', table: 'booking_seats', filter: `show_id=eq.${showId}` }, refetch)
     .subscribe()
   ```
   Any booking made by anyone, anywhere, updates every open tab within
   milliseconds — no polling.
3. `Checkout.jsx` runs a simulated payment delay, then calls
   `createBooking()`, which in production invokes `book_seats()` via
   `supabase.rpc(...)`
4. `TicketConfirmation.jsx` renders a QR code (via `qrcode.react`) encoding
   the booking code, seats, and showtime — scannable at the door

### Phase 5 — Admin dashboard (done)
`pages/admin/AdminDashboard.jsx` — tabbed management for movies, theatres,
shows, bookings, and users. Table actions currently point at demo data;
wiring "Add/Edit" forms to `supabase.from('movies').insert(...)` etc. is a
drop-in extension of the same pattern used in `lib/api.js`.

### Phase 6 — Analytics (done)
Two layers:
- **In-app** (`AnalyticsPanel.jsx`): Recharts visualizations for day-to-day
  glance-and-go monitoring inside the admin dashboard
- **Python** (`python/analytics.py`): connects directly to your Supabase
  Postgres instance, pulls the same SQL views, and renders a standalone
  interactive HTML report with pandas + Plotly — meant for scheduled
  business reporting (weekly ops/finance decks), independent of the web app

### Phase 7 — Testing (see section 5)

### Phase 8 — Deployment (see section 6)

---

## 3. Connecting a real Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL editor, paste and run all of `sql/schema.sql`
3. Under **Authentication → Providers**, enable Google (optional) and set
   your site URL for redirects
4. Copy `.env.example` to `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart `npm run dev` — the app now talks to your live database

To make your first admin user: sign up normally in the app, then in the
Supabase SQL editor run:
```sql
update public.profiles set role = 'admin' where id = 'the-users-uuid';
```

---

## 4. How Row Level Security protects the data

RLS means Postgres itself enforces who can read/write each row — even if
someone bypasses the frontend and calls the API directly.

| Table            | Read                          | Write                          |
|-------------------|--------------------------------|----------------------------------|
| `profiles`        | Own row, or admin              | Own row only                     |
| `movies`, `theatres`, `screens`, `shows` | Everyone (public browsing) | Admins only |
| `bookings`         | Own bookings, or admin         | Insert own bookings only         |
| `booking_seats`    | Everyone (needed for live seat maps) | Only via `book_seats()` (security-definer function) |
| `payments`         | Owner of the parent booking, or admin | — |

---

## 5. Testing

This scaffold is structured for testing to be added incrementally:
- **Unit/component**: recommend [Vitest](https://vitest.dev) +
  React Testing Library — `bookingStore`'s `totalAmount()` and
  `toggleSeat()` are pure functions, ideal first targets
- **Integration**: test `lib/api.js` against a local Supabase instance
  (`supabase start` via the Supabase CLI) so RLS policies are exercised for
  real, not mocked
- **E2E**: [Playwright](https://playwright.dev) covering the critical path —
  sign up → browse → select seats → pay → see QR ticket

## 6. Deployment

- **Frontend**: any static host that supports Vite builds — Vercel, Netlify,
  Cloudflare Pages. Set the two `VITE_SUPABASE_*` env vars in the host's
  dashboard, then `npm run build` → deploy the `dist/` folder
- **Database**: Supabase is already hosted — nothing to deploy
- **Python analytics**: run on a schedule via GitHub Actions, a cron job, or
  Airflow; point `SUPABASE_DB_URL` at your production connection string
  (Project Settings → Database → Connection string) and archive the HTML
  report each run, or extend `analytics.py` to email it out

---

## 7. Known trade-offs (by design, for a demo/scaffold)

- Payment is fully simulated — no real gateway is wired in
- The seat layout is fixed (8 rows × 12 seats) for simplicity; `screens.layout`
  is JSON, so variable layouts are a schema-compatible future extension
- Admin "Add/Edit" buttons are present but not yet wired to mutations —
  the read paths are fully live-data-ready, write paths follow the same
  `lib/api.js` pattern
