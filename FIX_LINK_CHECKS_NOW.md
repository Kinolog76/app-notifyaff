# 🔧 Fix Link Checks Integration - IMMEDIATE ACTIONS

## ⚠️ Current Error
```
Failed to insert link check: {
  code: '42501',
  message: 'new row violates row-level security policy for table "link_checks"'
}
```

## ✅ Solution (3 Steps - 5 Minutes)

### Step 1: Fix RLS Policies (CRITICAL)

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Fix link_checks INSERT policy
DROP POLICY IF EXISTS "Users can insert own link checks" ON link_checks;

CREATE POLICY "Users can insert own link checks"
  ON link_checks FOR INSERT
  WITH CHECK (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );

-- Also fix notifications INSERT policy
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

**Or run the full script from:** `docs/sql/QUICK_FIX_RLS.sql`

### Step 2: Verify Database Schema

Check if `link_checks` table exists:

```sql
SELECT COUNT(*) FROM link_checks;
```

If you get an error "table does not exist", run the migration:

**Option A - Supabase CLI:**
```bash
npx supabase db push
```

**Option B - Manual SQL:**
Copy and run: `supabase/migrations/20250101000000_link_checks_integration.sql`

### Step 3: Test It Works

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Check a link via API:**
   ```bash
   # Replace YOUR_LINK_ID with actual link ID
   curl -X POST http://localhost:3000/api/links/YOUR_LINK_ID/check \
     -H "Cookie: your-session-cookie"
   ```

3. **Verify data was saved:**
   ```sql
   SELECT * FROM link_checks ORDER BY checked_at DESC LIMIT 5;
   ```

   You should see new records! ✅

---

## 📊 What Gets Fixed

### ✅ Database
- `link_checks` table with proper RLS policies
- `notifications` table with proper RLS policies
- Required columns in `links` table (status, last_checked_at, tracking_enabled)
- Performance indexes

### ✅ Backend
- Server-side link checker (`lib/link-checker-server.ts`)
- Server-side database operations (`lib/supabase/link-checks-server.ts`)
- Proper Supabase client usage (server vs client)

### ✅ Frontend Components
- `LinkCheckHistory` - Table of all checks
- `StatusTimeline` - Visual timeline of status changes
- `ResponseTimeChart` - Response time graph

---

## 🎯 How to Use After Fix

### Display Check History in Your Link Details Page

```tsx
import { LinkCheckHistory } from "@/components/links/LinkCheckHistory";
import { StatusTimeline } from "@/components/links/StatusTimeline";
import { ResponseTimeChart } from "@/components/links/ResponseTimeChart";

export default function LinkDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8">
      {/* Basic link info */}

      {/* Check History Table */}
      <section>
        <h2 className="text-xl font-bold mb-4">Check History</h2>
        <LinkCheckHistory linkId={params.id} limit={50} />
      </section>

      {/* Status Timeline */}
      <section>
        <h2 className="text-xl font-bold mb-4">Status Timeline</h2>
        <StatusTimeline linkId={params.id} />
      </section>

      {/* Response Time Chart */}
      <section>
        <h2 className="text-xl font-bold mb-4">Performance</h2>
        <ResponseTimeChart linkId={params.id} limit={30} />
      </section>
    </div>
  );
}
```

### Trigger Manual Check from Frontend

```tsx
const handleCheckNow = async () => {
  const response = await fetch(`/api/links/${linkId}/check`, {
    method: 'POST',
  });

  const data = await response.json();
  console.log('Check result:', data);

  // Refresh components to show new check
};
```

---

## 🔍 Verification Checklist

After running the fix, verify:

- [ ] SQL runs without errors
- [ ] `SELECT * FROM link_checks;` works
- [ ] Manual check via API returns 200 OK
- [ ] New records appear in `link_checks` table
- [ ] No "42501" policy violation errors in logs
- [ ] Check History component displays data
- [ ] Timeline shows status changes
- [ ] Chart renders response times

---

## 📚 Full Documentation

- **Implementation Guide:** `docs/functional/IMPLEMENTATION_GUIDE.md`
- **Troubleshooting:** `docs/functional/TROUBLESHOOTING.md`
- **Quick Fix SQL:** `docs/sql/QUICK_FIX_RLS.sql`
- **Full Migration:** `supabase/migrations/20250101000000_link_checks_integration.sql`

---

## 🆘 Still Having Issues?

1. **Check server logs** - Look for error messages when making check requests
2. **Verify authentication** - Ensure user is logged in (check `auth.uid()`)
3. **Check link ownership** - User must own the link being checked
4. **Inspect RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'link_checks';
   ```
5. **Test with simple query:**
   ```sql
   INSERT INTO link_checks (link_id, status_code, response_time_ms)
   VALUES ('YOUR_LINK_ID', 200, 100);
   ```

If this fails with policy error, the RLS fix wasn't applied correctly.

---

## 🚀 Next Steps After Fix

1. **Set up Vercel Cron Jobs** for automated checks
2. **Run performance optimization SQL** (`docs/sql/migrations/performance_optimization.sql`)
3. **Integrate email service** (Resend/SendGrid) for notifications
4. **Monitor check execution** via Supabase dashboard

---

**Time to fix: ~5 minutes** ⏱️

**Files to run:**
1. `docs/sql/QUICK_FIX_RLS.sql` ← **START HERE**
2. (Optional) `supabase/migrations/20250101000000_link_checks_integration.sql`
