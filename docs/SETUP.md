# Supabase Authentication Setup - Complete

## Overview
Supabase authentication has been successfully integrated into your LinkGuardian application using the latest Next.js 14+ patterns with the App Router.

## What's Been Set Up

### 1. Dependencies Installed
- `@supabase/ssr` - Server-side rendering support for Supabase
- `@supabase/supabase-js` - Supabase JavaScript client
- TypeScript and type definitions

### 2. File Structure Created

```
NotifyAff/
├── utils/
│   └── supabase/
│       ├── server.ts       # Server-side Supabase client
│       ├── client.ts       # Client-side Supabase client
│       └── middleware.ts   # Middleware helper for auth
├── middleware.ts           # Root middleware for session refresh
├── app/
│   ├── auth/
│   │   └── login/
│   │       └── page.tsx    # Login/Signup page
│   ├── dashboard/
│   │   └── page.tsx        # Protected dashboard page
│   ├── page.tsx            # Landing page
│   └── layout.tsx          # Root layout
└── .env                    # Environment variables
```

### 3. Environment Variables
Your `.env` file is configured with:
```
NEXT_PUBLIC_SUPABASE_URL=https://lovclpdzdjbeoklrniin.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_utMqkoJi1i1asfsn_IyeaQ_Sd3k_n9d
```

## How It Works

### Server-Side Client ([utils/supabase/server.ts](../utils/supabase/server.ts))
Used in Server Components and Server Actions:
```typescript
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // ...
}
```

### Client-Side Client ([utils/supabase/client.ts](../utils/supabase/client.ts))
Used in Client Components:
```typescript
"use client";
import { createClient } from "@/utils/supabase/client";

export default function Component() {
  const supabase = createClient();
  // ...
}
```

### Middleware ([middleware.ts](../middleware.ts))
Automatically refreshes auth sessions on every request. Runs on all routes except static files.

## Authentication Flow

### Sign Up
1. User visits [/auth/login](http://localhost:3000/auth/login)
2. Enters email and password
3. Clicks "Sign up"
4. Receives confirmation email (if email confirmation is enabled in Supabase)
5. Redirected to dashboard after confirmation

### Sign In
1. User visits [/auth/login](http://localhost:3000/auth/login)
2. Enters credentials
3. Clicks "Sign in"
4. Redirected to [/dashboard](http://localhost:3000/dashboard)

### Sign Out
1. User clicks "Sign out" in dashboard
2. Session is cleared
3. Redirected to login page

### Protected Routes
The dashboard automatically redirects unauthenticated users to login:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  redirect("/auth/login");
}
```

## Testing the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the app:**
   - Landing page: http://localhost:3000
   - Login page: http://localhost:3000/auth/login
   - Dashboard: http://localhost:3000/dashboard (requires auth)

3. **Create a test user:**
   - Go to login page
   - Click "Sign up"
   - Enter email and password
   - Check your Supabase dashboard to verify user creation

## Next Steps

### 1. Configure Supabase Auth Settings
Go to your Supabase dashboard → Authentication → Settings:
- **Email confirmation:** Enable/disable email verification
- **OAuth providers:** Add Google, GitHub, etc.
- **Email templates:** Customize confirmation and reset emails

### 2. Add OAuth Providers (Optional)
Example for Google OAuth:

```typescript
// In your login page
const signInWithGoogle = async () => {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
    },
  });
};
```

### 3. Create Auth Callback Route
For OAuth and email confirmations:

```typescript
// app/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

### 4. Add Password Reset
Create a forgot password page and use:
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/reset-password`,
});
```

### 5. Set Up Database Tables
Create your database schema in Supabase:

```sql
-- Users table is auto-created by Supabase Auth

-- Links table
create table links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  url text not null,
  short_url text,
  category text,
  status text default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table links enable row level security;

-- Users can only see their own links
create policy "Users can view own links"
  on links for select
  using (auth.uid() = user_id);

create policy "Users can insert own links"
  on links for insert
  with check (auth.uid() = user_id);

create policy "Users can update own links"
  on links for update
  using (auth.uid() = user_id);

create policy "Users can delete own links"
  on links for delete
  using (auth.uid() = user_id);
```

## Troubleshooting

### "Invalid API key" error
- Check that your environment variables are correct
- Restart the dev server after changing `.env`

### Users not redirecting after login
- Check that middleware is running (look for middleware logs)
- Verify the redirect URLs in your code

### Email confirmations not working
- Check Supabase dashboard → Authentication → Email Templates
- Verify SMTP settings in Supabase

### Session not persisting
- Ensure middleware is properly configured
- Check browser cookies are enabled
- Verify the middleware matcher pattern

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Security Notes

- ✅ Row Level Security (RLS) should be enabled on all tables
- ✅ Never expose `service_role` key in client-side code
- ✅ Use environment variables for all sensitive data
- ✅ Middleware automatically refreshes sessions
- ✅ Server Components verify auth on every request
