# LinkGuardian - Project Brief

## Overview
**LinkGuardian** is an affiliate link monitoring SaaS for micro-influencers (5K-50K followers). Automatically checks affiliate links for errors and sends alerts before revenue is lost.

## Problem
- 20-25% of affiliate links contain errors or break over time
- Influencers lose hundreds of dollars monthly without knowing
- Existing tools are too expensive ($50-500/mo) or too complex for small creators

## Solution
Automated link health monitoring with:
- Daily checks for broken links (404s, redirects, server errors)
- Proactive email/push notifications
- Missing affiliate tag detection
- Simple dashboard to manage all links
- Affordable pricing ($12-24/mo)

---

## Tech Stack

### Frontend
- **Web:** Next.js 14 + TypeScript + Tailwind CSS
- **Mobile:** React Native (future)
- **UI:** shadcn/ui components

### Backend
- **Database & Auth:** Supabase (PostgreSQL + Auth + Realtime)
- **API:** Supabase Edge Functions (Deno) or Next.js API Routes
- **Cache:** Supabase built-in caching
- **Queue:** Supabase pg_cron or external service (Inngest/Trigger.dev)

### Infrastructure
- **Hosting:** Vercel (for Next.js) + Supabase
- **Auth:** Supabase Auth (email, OAuth, magic links)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage (for exports, reports)
- **Realtime:** Supabase Realtime (for live status updates)
- **Payments:** Stripe
- **Email:** Resend or SendGrid
- **Push:** Firebase Cloud Messaging or Supabase custom

### Link Checking
- **HTTP Client:** Axios
- **Headless Browser:** Puppeteer (for complex redirects)
- **Cron:** BullMQ scheduled jobs

### Monitoring
- **Errors:** Sentry
- **Analytics:** Mixpanel or Amplitude
- **Uptime:** Better Uptime

---

## Core Features (MVP v1.0)

### 1. Link Management
- Add/edit/delete affiliate links
- Organize by categories/tags
- Bulk import (CSV)
- Short link generation (optional)

### 2. Automated Link Checking
- Daily HTTP health checks
- Follow redirect chains
- Detect 404s, 500s, timeouts
- Response time monitoring
- History tracking

### 3. Notifications
- Email alerts for broken links
- Push notifications (web + mobile)
- Configurable frequency (instant/digest)
- Don't spam (max 1 alert/day per link)

### 4. Dashboard
- Overview: working/broken/warning links
- Recent issues timeline
- Quick fix actions
- Search and filters

### 5. Subscription Plans
- **FREE:** 25 links, weekly checks
- **BASIC $12/mo:** 250 links, daily checks, email alerts
- **PRO $24/mo:** 1K links, 2x/day checks, full analytics
- **AGENCY $79/mo:** 10K links, 4x/day checks, API access

---

## Development Roadmap

### Sprint 1-2 (Weeks 1-4): Foundation
- [ ] Next.js 14 + TypeScript project setup
- [ ] Supabase project creation
- [ ] Database schema design (Supabase)
  - `users` table (auto-created by Supabase Auth)
  - `links` table (id, user_id, url, short_url, category, status, etc.)
  - `link_checks` table (id, link_id, checked_at, status_code, response_time, etc.)
  - `notifications` table (id, user_id, link_id, type, read, etc.)
- [ ] Supabase Auth setup (email + Google OAuth + magic links)
- [ ] Row Level Security (RLS) policies
- [ ] Landing page
- [ ] Dashboard layout with Supabase client

### Sprint 3-4 (Weeks 5-8): Core Features
- [ ] Add/edit/delete links UI with Supabase queries
- [ ] Links list with realtime status updates (Supabase Realtime)
- [ ] Link checker service (Supabase Edge Function or Next.js API)
- [ ] Background job system:
  - Option A: Supabase pg_cron (native PostgreSQL cron)
  - Option B: Vercel Cron Jobs (free tier)
  - Option C: External service (Inngest/Trigger.dev)
- [ ] Store check results in `link_checks` table
- [ ] Update link status in realtime

### Sprint 5 (Weeks 9-10): Notifications
- [ ] Email integration (Resend recommended with Supabase)
- [ ] Email templates
- [ ] Notification preferences in `user_preferences` table
- [ ] Alert logic using Supabase database triggers or Edge Functions
- [ ] Store notifications in database
- [ ] Mark as read functionality

### Sprint 6 (Weeks 11-12): Monetization
- [ ] Stripe subscription setup
- [ ] Plan limits enforcement
- [ ] Billing page + customer portal
- [ ] Free tier implementation

### Sprint 7 (Weeks 13-14): Polish & Launch
- [ ] UI polish and bug fixes
- [ ] Onboarding flow
- [ ] Help documentation
- [ ] Beta launch prep

**Total Timeline:** 12-14 weeks (3-3.5 months)

---