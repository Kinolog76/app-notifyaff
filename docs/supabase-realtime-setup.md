# Supabase Realtime Setup

This guide explains how to enable and configure Supabase Realtime for the LinkGuardian application.

## Error: "Mismatch between server and client bindings"

If you see this error:
```
Error: mismatch between server and client bindings for postgres changes
```

This means Realtime replication is not enabled for the tables you're trying to subscribe to.

## Solution: Enable Realtime Replication

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Enable replication for the following tables:
   - ✅ `links`
   - ✅ `link_checks`
   - ✅ `workspaces`

**Steps:**
1. Find each table in the list
2. Toggle the switch to enable replication
3. Click "Save" or the table will auto-save

### Option 2: Using SQL Migration

Run the SQL migration file in your Supabase SQL Editor:

**File:** `docs/sql/migrations/enable_realtime_replication.sql`

```sql
-- Enable realtime for links table
ALTER PUBLICATION supabase_realtime ADD TABLE links;

-- Enable realtime for link_checks table
ALTER PUBLICATION supabase_realtime ADD TABLE link_checks;

-- Enable realtime for workspaces table
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
```

**How to run:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Paste the SQL from the migration file
4. Click "Run"

### Option 3: Using Supabase CLI

If you're using Supabase locally or have the CLI installed:

```bash
supabase db push
```

Or run the migration directly:

```bash
psql -U postgres -d postgres -f docs/sql/migrations/enable_realtime_replication.sql
```

## Verify Realtime is Enabled

Run this query in the SQL Editor to verify:

```sql
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

You should see:
- `links`
- `link_checks`
- `workspaces`

## Understanding Realtime Subscriptions

### What Tables Need Realtime?

**Links Table** (`links`)
- Used by: Dashboard home, Links list page, Workspace detail page
- Events: INSERT, UPDATE, DELETE
- Purpose: Real-time link status updates

**Link Checks Table** (`link_checks`)
- Used by: Link detail page
- Events: INSERT
- Purpose: Real-time check history updates

**Workspaces Table** (`workspaces`)
- Used by: Workspace detail page
- Events: UPDATE
- Purpose: Real-time workspace metadata updates

### How Subscriptions Work

```typescript
// Subscribe to changes
supabase
  .channel('my_channel')
  .on('postgres_changes', {
    event: '*',           // INSERT, UPDATE, DELETE, or *
    schema: 'public',
    table: 'links',
    filter: 'user_id=eq.123'  // Optional filter
  }, (payload) => {
    console.log('Change received:', payload);
  })
  .subscribe();
```

## Troubleshooting

### Error: "Database error saving new change"

**Cause**: Row Level Security (RLS) policies are blocking the replication.

**Solution**: Make sure your RLS policies allow the service role to read all rows:

```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'links';

-- The policies should allow service role access
-- This is usually already configured in Supabase
```

### Error: "Mismatch between server and client bindings" when switching pages

**Cause**: Old subscriptions not cleaned up before new ones are created, causing conflicts.

**Solution**: The code now uses a `mounted` flag to prevent race conditions:

```typescript
useEffect(() => {
  let mounted = true;

  const initialize = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && mounted) {
      await fetchData();
      setupRealtimeSubscriptions(user.id);
    }
  };

  initialize();

  return () => {
    mounted = false;
    supabase.removeAllChannels();
  };
}, []);
```

This ensures subscriptions are only created if the component is still mounted.

### Error: "Channel error occurred"

**Possible causes:**
1. Realtime not enabled for the table
2. Invalid filter syntax
3. Network connectivity issues
4. Supabase project is paused or unavailable
5. Race condition from multiple subscriptions

**Solutions:**
1. Verify Realtime is enabled (see above)
2. Check filter syntax: `column_name=eq.value`
3. Check your internet connection
4. Verify your Supabase project is active
5. Ensure proper cleanup with `mounted` flag (see above)

### Error: "Subscription timed out"

**Cause**: The subscription took too long to establish.

**Solution**:
1. Check your internet connection
2. Verify the table exists
3. Try reloading the page
4. Check Supabase dashboard for service status

### No Events Received

If subscriptions work but you don't receive events:

1. **Check RLS Policies**: Make sure the authenticated user has SELECT permission
2. **Check Filters**: Verify the filter matches your data (e.g., `user_id=eq.${userId}`)
3. **Check Console Logs**: Look for subscription status in browser console
4. **Test Without Filters**: Try subscribing without a filter to see if events come through

## Testing Realtime

### Test in Browser Console

1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Look for logs prefixed with `[Realtime]`

You should see:
```
[Realtime] 🚀 Setting up subscriptions
[Realtime] 📡 Subscription status: SUBSCRIBED
[Realtime] ✅ Successfully subscribed to updates
```

### Test by Making Changes

1. **Test INSERT**: Add a new link and watch for the event
2. **Test UPDATE**: Manually update a link's status in Supabase dashboard
3. **Test DELETE**: Delete a link and see if it disappears from the UI

### Manual Test Query

Run this in another browser tab to trigger an update:

```sql
UPDATE links
SET status = 'active'
WHERE id = 'your-link-id';
```

You should see the update in your app without refreshing!

## Performance Considerations

### Channel Limits

- Each Supabase project has a limit on concurrent Realtime connections
- Free tier: 200 concurrent connections
- Pro tier: 500+ concurrent connections

### Best Practices

1. **One channel per page**: Don't create multiple channels unnecessarily
2. **Clean up on unmount**: Always call `supabase.removeAllChannels()` in cleanup
3. **Use filters**: Filter at the database level, not in JavaScript
4. **Throttle updates**: If receiving many events, consider throttling UI updates

### Example Cleanup

```typescript
useEffect(() => {
  setupRealtimeSubscriptions(userId);

  return () => {
    // Clean up subscriptions when component unmounts
    supabase.removeAllChannels();
  };
}, []);
```

## Security Considerations

### Row Level Security (RLS)

Realtime subscriptions respect RLS policies:

```sql
-- Users can only see their own links
CREATE POLICY "Users can view own links"
ON links FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

Even with Realtime enabled, users will only receive updates for rows they have permission to see.

### Authenticated vs Anonymous

Make sure your subscriptions are made with an authenticated user:

```typescript
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  // Only subscribe if authenticated
  setupRealtimeSubscriptions(user.id);
}
```

## Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Realtime Quotas](https://supabase.com/docs/guides/platform/going-into-prod#realtime-quotas)

## Summary

**To enable Realtime:**
1. ✅ Go to Database → Replication in Supabase Dashboard
2. ✅ Enable replication for `links`, `link_checks`, and `workspaces` tables
3. ✅ Verify with `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`
4. ✅ Reload your app and check console logs

**Expected behavior:**
- Link status updates appear instantly
- New links added in one tab appear in another
- Check results appear in real-time
- No page refresh needed!
