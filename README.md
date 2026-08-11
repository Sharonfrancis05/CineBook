<div align="center">

# 🎬 CineBook

### Movie Ticket Booking System

A full-stack movie ticket booking platform with live, show-specific seat selection — built with React and Supabase.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-red?style=flat-square)
![Status](https://img.shields.io/badge/Status-In_Development-yellow?style=flat-square)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Features](#user-features)
- [Admin Features](#admin-features)
- [Booking Workflow](#booking-workflow)
- [Seat Booking](#seat-booking)
- [Authentication](#authentication)
- [Database Architecture](#database-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Supabase Configuration](#supabase-configuration)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [SQL / Database Features](#sql--database-features)
- [Python Analytics](#python-analytics)
- [Security & RLS](#security--rls)
- [Future Enhancements](#future-enhancements)
- [Author & License](#author--license)

---

## Overview

**CineBook** lets users discover movies, filter by genre, view detailed information (rating, runtime, language, cast), choose a theatre and showtime, and book seats on a screen-specific, real-time seat map. Payment is simulated for demo purposes.

The backend runs entirely on **Supabase** — PostgreSQL database, authentication, storage, and realtime updates — with **Row Level Security** enforcing who can read and write what.

---

## Key Features

<table>
<tr>
<td width="33%" valign="top">

### 🎞️ Browse & Discover
Genre filters, search, and rich movie detail pages with cast and ratings.

</td>
<td width="33%" valign="top">

### 💺 Live Seat Maps
Show-specific seat selection that updates in real time as others book.

</td>
<td width="33%" valign="top">

### 🔐 Secure by Default
Supabase Auth + Row Level Security protect every booking and payment.

</td>
</tr>
</table>

---

## User Features

| Feature | Description |
|---|---|
| Browse & Search | Now Showing / Coming Soon listings with genre filters and search |
| Movie Details | Synopsis, rating, runtime, certification, language, cast |
| Showtime Selection | Pick a date, theatre, and time slot from available shows |
| Interactive Seat Map | Standard / Premium / Selected / Booked seat states, live updates |
| Booking Summary | Real-time subtotal, convenience fee, and total calculation |
| Simulated Payment | Card, UPI, or CineBook Wallet checkout flow |
| Authentication | Sign in and session management via Supabase Auth |

> **Planned:** in-app booking history, reviews, and wishlist management screens.

---

## Admin Features

> 🚧 **Planned / Future Enhancement** — the database schema supports admin operations, but an admin UI is not yet built.

| Planned Capability | Description |
|---|---|
| Content Management | Add/edit/remove movies, theatres, screens, and shows |
| Screen Configuration | Manage seat layouts per screen |
| Analytics Dashboard | View booking and revenue insights |
| Review Moderation | Moderate user-submitted reviews |

---

## Booking Workflow

```
Browse Movies → View Details → Select Showtime → Select Seats → Review Summary → Pay → Confirmation
```

1. **Browse** — View Now Showing / Coming Soon movies, filter by genre or search term.
2. **Movie Details** — Open a movie to see synopsis, rating, runtime, and cast.
3. **Select Showtime** — Pick a date and theatre; available showtimes and prices are listed.
4. **Select Seats** — Open the live seat map for that specific show.
5. **Review Summary** — See seat numbers, subtotal, convenience fee, and total.
6. **Payment** — Choose a method and complete a simulated payment.
7. **Confirmation** — Booking is recorded against that specific show.

---

## Seat Booking

Seat availability is **specific to each show** — a unique combination of movie, screen, date, and time — not to the movie or screen in general. Two shows on the same screen at different times each have their own independent seat map.

| State | Meaning |
|---|---|
| 🟦 Standard | Available, base price (₹250) |
| 🟨 Premium | Available, premium price (₹350) |
| 🟥 Selected | Chosen by the current user, not yet paid |
| ⬛ Booked | Already booked by another user for this show |

Seats update live for everyone browsing the same show — if a seat disappears, someone just booked it, via Supabase Realtime subscriptions.

---

## Authentication

- Handled entirely by **Supabase Auth**.
- Signed-in users see a session avatar in the navbar; signed-out users see a **Sign in** action.
- Session state gates access to the booking and payment steps.
- **Planned:** social login providers, password reset flow, and a profile management UI.

---

## Database Architecture

Supabase provides PostgreSQL, authentication, storage, realtime subscriptions, and Row Level Security in a single backend.

### Core Entities

| Entity | Description |
|---|---|
| `profiles` | Public user profile linked 1:1 to Supabase Auth users |
| `movies` | Title, synopsis, genres, rating, runtime, language, cast |
| `theatres` | Theatre/cinema locations (name, address, city) |
| `screens` | Individual screens within a theatre, incl. seat layout config |
| `shows` | A specific movie on a specific screen at a specific date/time |
| `seats` | Physical seat definitions per screen (row, number, category) |
| `bookings` | A user's booking for a specific show (status, totals, timestamps) |
| `booked_seats` | Maps booked seats to a specific `show` + `booking` — this is what makes seat availability show-specific |
| `payments` | Payment records tied to a booking (method, amount, status) |
| `reviews` | User reviews/ratings for movies |
| `wishlist` | Movies saved by a user for later |

### Relationship Highlights

- `shows` references `movies` and `screens` — each show is a unique **movie + screen + datetime** combination.
- `seats` belong to a `screen`, but `booked_seats` link a `seat` to a specific `show`, so the same physical seat can be free on one show and booked on another.
- `bookings` link a `profile` to a `show`, with related rows in `booked_seats` and `payments`.
- `reviews` and `wishlist` link a `profile` to a `movie`.

```
profiles ──< bookings >── shows ──< booked_seats >── seats
                │                      │
                └──< payments          └── screens ──< theatres
movies ──< reviews / wishlist >── profiles
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Backend / BaaS | Supabase (Auth, Storage, Realtime, RLS) |
| Database | PostgreSQL |
| Analytics | Python |

---

## Project Structure

```
cinebook/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── MovieDetails.jsx
│   │   ├── Showtimes.jsx
│   │   ├── SeatSelection.jsx
│   │   └── Payment.jsx
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── hooks/
│   ├── context/
│   ├── App.jsx
│   └── main.jsx
├── analytics/
│   └── booking_analytics.py
├── sql/
│   ├── schema.sql
│   ├── policies.sql
│   └── seed.sql
├── screenshots/
├── .env.example
├── index.html
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A Supabase account and project
- Python 3.9+ (for the analytics scripts)

### Clone and Install

```bash
git clone https://github.com/<your-username>/cinebook.git
cd cinebook
npm install
```

---

## Supabase Configuration

1. Create a new project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the schema and policy scripts from the `sql/` folder to create tables (`profiles`, `movies`, `theatres`, `screens`, `shows`, `seats`, `bookings`, `booked_seats`, `payments`, `reviews`, `wishlist`) and enable RLS policies.
3. Enable **Email Auth** (or your preferred provider) under Authentication settings.
4. Copy your **Project URL** and **anon public API key** from Project Settings → API.
5. *(Optional)* Set up a Storage bucket for movie posters and cast images.
6. Enable **Realtime** on the `booked_seats` table so seat maps update live across users.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

A `.env.example` file is included as a template. Never commit your actual `.env` file.

---

## Running the Project

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

The app runs at `http://localhost:5173` by default.

---

## SQL / Database Features

- Normalized relational schema across movies, theatres, screens, shows, seats, and bookings
- `shows` table enforces the movie + screen + datetime combination that makes each showtime unique
- `booked_seats` join table ties seat occupancy to an individual show, so the same seat is independently bookable across different showtimes
- Foreign key constraints maintain referential integrity between bookings, payments, and shows
- Indexes on frequently queried columns (show date, movie genre, theatre) for faster lookups
- SQL scripts (`schema.sql`, `policies.sql`, `seed.sql`) provided for reproducible setup

---

## Python Analytics

A Python-based analytics module (`analytics/booking_analytics.py`) connects to the Supabase PostgreSQL database to compute booking and revenue insights, such as:

- Bookings and revenue by movie or theatre
- Seat occupancy trends per show
- Genre and showtime popularity

> This module runs as a standalone script/notebook against the database and is separate from the web application runtime.

---

## Security & RLS

Supabase **Row Level Security (RLS)** is enabled on user-related tables to ensure:

- Users can only read and modify their own `profiles`, `bookings`, `payments`, `reviews`, and `wishlist` rows
- Seat and show data is readable by all authenticated users but only modifiable through controlled booking operations
- No direct client-side writes to sensitive tables (`payments`, `booked_seats`) outside the defined booking flow
- Supabase Auth manages secure session handling and token refresh

---

## Future Enhancements

- [ ] Admin dashboard for managing movies, shows, theatres, and screens
- [ ] Booking history and e-ticket view for users
- [ ] Reviews and ratings UI
- [ ] Wishlist management UI
- [ ] Real payment gateway integration
- [ ] Email/SMS booking confirmations
- [ ] Social login (Google, etc.)
- [ ] In-app analytics dashboard powered by the Python analytics module

---

## Author & License

<div align="center">

**Built by [Your Name]**

Licensed under the [MIT License](LICENSE).

⭐ If you found this project interesting, consider giving it a star!

</div>
