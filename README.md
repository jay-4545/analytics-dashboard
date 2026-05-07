# AnalyticsPro Dashboard

A full-stack analytics dashboard built with Next.js 14, TypeScript, MongoDB, and Framer Motion.

## Features

- **Authentication** — NextAuth.js credentials login with JWT sessions
- **Dashboard** — Stat cards with animated count-up, sparklines, revenue/visitor charts, recent transactions
- **Analytics** — Date-range filtering, pageview timeline, device/country breakdown, event type radar
- **Users** — TanStack Table with sorting, search (debounced), bulk delete, side drawer, add/delete modals
- **Revenue** — Monthly bar chart, plan/status pie charts, filterable transaction table
- **Reports** — One-click PDF and Excel export for users, revenue, and analytics data
- **Settings** — Profile, appearance (dark/light/system + accent colors), notifications, security tabs
- **Dark mode** — Full dark/light/system support via next-themes with CSS custom properties
- **Animations** — Page transitions, staggered table rows, chart animations, stat card count-up

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v4 (Credentials) |
| Charts | Recharts |
| Tables | TanStack Table v8 |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Date picker | react-day-picker v9 |
| Exports | jsPDF + xlsx |
| Toast | react-hot-toast |
| Theme | next-themes |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/analytics-dashboard
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Seed the database

Start the dev server, then visit:

```
http://localhost:3000/api/seed
```

This creates 50 users, ~200 revenue transactions, and 1000 events with realistic growth-biased data.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with:

- **Email:** `admin@demo.com`
- **Password:** `Admin@123`

## Project Structure

```
app/
  (auth)/login/          # Login page
  (dashboard)/           # Dashboard layout + all pages
    page.tsx             # Home — stats, charts, recent transactions
    analytics/           # Pageview timeline, device/country breakdown
    users/               # User table with drawer, add/delete modals
    revenue/             # Revenue charts and transaction table
    reports/             # PDF/Excel export hub
    settings/            # Profile, appearance, notifications, security
  api/
    auth/[...nextauth]/  # NextAuth handler
    dashboard/           # Aggregated stats
    analytics/           # Events timeline + breakdowns
    users/               # CRUD with pagination + search
    revenue/             # Revenue with aggregations
    reports/             # Export data endpoint
    health/              # Health check — GET /api/health
components/
  charts/                # AreaChart, BarChart, LineChart, PieChart, RadarChart
  layout/                # Sidebar, Header, MobileNav
  tables/                # DataTable, Pagination, TableFilters
  ui/                    # StatCard, Badge, Modal, EmptyState, PageError, …
hooks/
  useDebounce.ts
lib/
  auth.ts                # NextAuth config
  mongodb.ts             # Mongoose connection caching
  seed.ts                # Seed script
  utils.ts               # cn(), formatCurrency()
models/
  User.ts / Revenue.ts / Event.ts
```

## Screenshots

<!-- Add screenshots here -->

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Aggregated dashboard stats |
| GET | `/api/analytics` | Events timeline and breakdowns |
| GET/POST | `/api/users` | List users (paginated) / create user |
| GET/PUT/DELETE | `/api/users/[id]` | Get, update, or delete a user |
| GET | `/api/revenue` | Revenue data with chart aggregations |
| GET | `/api/reports` | Export-ready data (users/revenue/analytics) |
| GET | `/api/seed` | Seed database (run once) |

## License

MIT
