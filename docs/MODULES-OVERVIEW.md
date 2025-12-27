# Modules Overview

## Core Modules

### 1. Authentication
User signup, signin, password management, and session handling.
📄 [Details](./functional/auth.md)

### 2. Link Management
CRUD operations for affiliate links, bulk import, filtering, and status tracking.
📄 [Details](./functional/link-management.md)

### 3. Dashboard
Protected dashboard with navigation, statistics, and link management interface.
📄 [Details](./functional/dashboard.md)

### 4. Landing Page
Marketing landing page with animated sections and CTAs.
📄 [Details](./functional/landing.md)

### 5. Theme System
Light/dark mode theming with persistent user preference.
📄 [Details](./functional/theme.md)

---

## Database

### Supabase PostgreSQL
Tables: links, link_checks, users
📄 [Schema Details](./supabase/schema.md)

---

## API Routes

### REST Endpoints
Link management and contact form APIs.
📄 [API Reference](./routes/api-reference.md)

---

## Tech Stack

**Frontend:** Next.js 14, TypeScript, React 19, Tailwind CSS, shadcn/ui
**Backend:** Supabase (PostgreSQL + Auth + Realtime)
**Email:** Resend
**Animations:** Framer Motion
**Validation:** Zod, React Hook Form

---

## Project Status

📊 [Current Implementation Status](./PROJECT-STATUS.md)
