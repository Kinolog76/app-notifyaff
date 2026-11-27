# LinkGuardian

SaaS for content creators and affiliate marketers that monitors affiliate links and flags broken ones before they cost revenue. Links are checked on a schedule, every status change is recorded, and the dashboard shows link health, response times and problem links.

## Features

- **Link management**: add, edit and delete links, bulk import from CSV, categories and tags, search, filters and sorting, per-link tracking toggle.
- **Workspaces**: group links by project or client.
- **Automated checks**: a Vercel Cron job runs every 6 hours. Each check follows the redirect chain, stores the status code, response time and final URL, and uses a 10-second timeout with retry logic.
- **Status history**: active / warning / broken statuses with a timeline per link and live updates in the dashboard via Supabase Realtime.
- **Notifications**: status changes (active → broken, broken → active) create in-app notifications, limited to one per link per 24 hours.
- **Analytics**: overview stats, link health and response time charts, status breakdown, slowest and most often broken links, per-category table, date range picker and CSV export.
- **Plans and limits**: Free / Pro / Agency limits on links and workspaces, enforced in the UI, in the API and by PostgreSQL triggers, with an upgrade modal.
- **Auth**: email/password, Google OAuth, password reset, protected routes via middleware.
- **Marketing site**: landing page, about, contact form (Resend), privacy, terms and cookie pages, light/dark theme.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix), Framer Motion
- **Forms and validation:** React Hook Form, Zod
- **Charts:** Recharts, Chart.js
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, RLS), Next.js route handlers
- **Infrastructure:** Vercel Cron, Upstash Redis (rate limiting), Resend (email)
- **Testing:** Vitest, React Testing Library

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=
RESEND_API_KEY=
CONTACT_EMAIL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Apply the SQL migrations from `supabase/migrations/` to your Supabase project.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Project structure

```text
app/
  api/
    links/            # CRUD, bulk CSV import, manual check
    workspaces/       # workspace CRUD
    cron/             # scheduled link checks and cleanup
    contact/          # contact form
  dashboard/          # links, link details, workspaces, analytics
  auth/, login/       # sign in, OAuth callback, password reset
components/           # landing, dashboard, links, analytics, ui
lib/                  # link checker, retry logic, status history, analytics, notifications, rate limiting
supabase/migrations/  # schema, RLS policies, analytics functions
docs/                 # module and feature notes
```

## Status

Work in progress. Not implemented yet: email delivery for link alerts (in-app notifications only), billing.

## License

All rights reserved.
