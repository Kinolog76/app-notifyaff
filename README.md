# LinkGuardian

Affiliate link monitoring SaaS for micro-influencers (5K-50K followers). Automatically checks affiliate links for errors and sends alerts before revenue is lost.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Your `.env` file should contain:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000)

## Features

### Authentication (Completed)
- Email/password sign up and sign in
- Protected routes with automatic redirects
- Session management with middleware
- Server-side and client-side auth support

### Coming Soon
- Link management (add/edit/delete)
- Automated link health checks
- Email and push notifications
- Dashboard analytics
- Subscription plans

## Documentation

- [Setup Guide](docs/SETUP.md) - Complete authentication setup documentation
- [Supabase Auth Examples](docs/supabase/auth.md) - Code examples and patterns
- [Project Brief](CLAUDE.md) - Full project specifications and roadmap

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Hosting:** Vercel + Supabase

## Project Structure

```
NotifyAff/
├── app/                    # Next.js app directory
│   ├── auth/login/        # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── utils/
│   └── supabase/          # Supabase client utilities
├── docs/                  # Documentation
└── middleware.ts          # Auth middleware
```

## Current Status

**Sprint 1-2: Foundation** ✅
- [x] Next.js 14 + TypeScript setup
- [x] Supabase project configuration
- [x] Authentication implementation
- [x] Landing page
- [x] Dashboard layout
- [ ] Database schema design
- [ ] Row Level Security policies

**Next Up: Core Features**
- [ ] Link management UI
- [ ] Link checker service
- [ ] Background job system
- [ ] Notifications

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

Private project - All rights reserved
