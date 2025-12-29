# Link Checks Integration - Troubleshooting Guide

## Issue 1: RLS Policy Violation Error

### Problem
```
Failed to insert link check: {
  code: '42501',
  message: 'new row violates row-level security policy for table "link_checks"'
}
```

### Quick Fix

**Run this SQL in Supabase Dashboard → SQL Editor:**

```sql
-- Copy and paste from: docs/sql/QUICK_FIX_RLS.sql
-- Or run this directly:

DROP POLICY IF EXISTS "Users can insert own link checks" ON link_checks;

CREATE POLICY "Users can insert own link checks"
  ON link_checks FOR INSERT
  WITH CHECK (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );
```

This allows authenticated users to insert check records for their own links.

### Explanation

The RLS (Row Level Security) policy was too restrictive. It only allowed SELECT but not INSERT operations for regular users. The fix adds an INSERT policy that allows users to create check records for links they own.

---

## Issue 2: Check Data Not Saved to Database

### Problem
When manually checking links via `/api/links/[id]/check`, the check data is not being saved to the `link_checks` table.

### Root Cause Analysis

The system has been updated to use **separate server-side and client-side functions** for Supabase operations:

1. **Server-side** (API routes, cron jobs):
   - `lib/link-checker-server.ts`
   - `lib/supabase/link-checks-server.ts`
   - `lib/link-status-server.ts`

2. **Client-side** (React components):
   - `lib/link-checker.ts`
   - `lib/supabase/link-checks.ts`
   - `lib/link-status.ts`

### Fix Checklist

#### 1. Database Migration

Run the migration to ensure the database schema is correct:

```bash
# Option 1: Via Supabase CLI (recommended)
npx supabase db push

# Option 2: Via SQL directly in Supabase Dashboard
# Copy and run: supabase/migrations/20250101000000_link_checks_integration.sql
```

This creates:
- ✅ `link_checks` table with proper structure
- ✅ Required indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Additional columns in `links` table (status, last_checked_at, tracking_enabled)
- ✅ `notifications` table for alerts

#### 2. Verify API Routes Are Using Server Functions

Check that these files import from the correct modules:

**✅ app/api/links/[id]/check/route.ts:**
```typescript
import { checkLink } from "@/lib/link-checker-server";
import { getLatestLinkCheck } from "@/lib/supabase/link-checks-server";
```

**✅ app/api/cron/check-links/route.ts:**
```typescript
import { checkLink } from "@/lib/link-checker-server";
```

#### 3. Environment Variables

Ensure these are set in your `.env` or `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
CRON_SECRET=your-cron-secret
```

#### 4. Test the Flow

1. **Check database connection:**
   ```sql
   -- In Supabase SQL Editor
   SELECT COUNT(*) FROM link_checks;
   ```

2. **Test manual check:**
   ```bash
   # Get a link ID from your links table
   curl -X POST http://localhost:3000/api/links/YOUR_LINK_ID/check \
     -H "Cookie: your-session-cookie"
   ```

3. **Verify data was saved:**
   ```sql
   SELECT * FROM link_checks ORDER BY checked_at DESC LIMIT 5;
   ```

#### 5. Common Issues

**Issue: "Policy violation" errors**
- **Cause:** RLS policies not set up correctly
- **Fix:** Run the migration SQL that sets up policies

**Issue: "Column does not exist" errors**
- **Cause:** Database schema out of sync
- **Fix:** Run migration to add missing columns

**Issue: No data appears in UI components**
- **Cause:** Client-side components trying to fetch before data exists
- **Fix:**
  1. Ensure at least one check has been performed
  2. Check browser console for errors
  3. Verify RLS policies allow SELECT

**Issue: Checks running but not saving**
- **Cause:** API routes using wrong client (browser instead of server)
- **Fix:** Ensure imports from `-server.ts` files

### Debug Mode

Add logging to verify the flow:

```typescript
// In lib/link-checker-server.ts
console.log('[CHECK] Starting check for:', url, 'linkId:', linkId);
console.log('[CHECK] Result:', result);
console.log('[CHECK] Saving to database...');
await insertLinkCheck({...});
console.log('[CHECK] Saved successfully');
```

Then check server logs:
```bash
npm run dev
# Make a request and watch console output
```

### Verification Steps

After applying fixes, verify:

1. ✅ Database schema exists:
   ```sql
   \d link_checks  -- Should show table structure
   ```

2. ✅ Manual check saves data:
   ```bash
   # Make check request
   # Then verify:
   SELECT COUNT(*) FROM link_checks;  -- Should increase
   ```

3. ✅ UI components display data:
   - Navigate to link details page
   - Check History component shows records
   - Timeline shows status changes
   - Chart displays response times

4. ✅ Notifications work:
   ```sql
   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
   ```

### Performance Optimization

After everything works, run performance optimization:

```bash
# In Supabase SQL Editor
-- Run: docs/sql/migrations/performance_optimization.sql
```

This adds:
- Additional indexes
- Database views for common queries
- Query optimization

### Next Steps

1. **Set up Vercel Cron Jobs** (in `vercel.json`):
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/check-links",
         "schedule": "0 * * * *"
       },
       {
         "path": "/api/cron/cleanup-old-checks",
         "schedule": "0 0 * * 0"
       }
     ]
   }
   ```

2. **Monitor check execution:**
   ```sql
   -- Check recent activity
   SELECT
     l.name,
     lc.status_code,
     lc.response_time_ms,
     lc.checked_at
   FROM link_checks lc
   JOIN links l ON l.id = lc.link_id
   ORDER BY lc.checked_at DESC
   LIMIT 20;
   ```

3. **Set up email notifications:**
   - Integrate Resend or SendGrid
   - Update `lib/notification-triggers.ts` to send emails

### Support

If issues persist:

1. Check server logs for errors
2. Verify Supabase project is accessible
3. Check RLS policies aren't blocking operations
4. Ensure service role key has proper permissions
