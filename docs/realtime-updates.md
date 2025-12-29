# Real-Time Status Updates

This document explains the real-time status update feature using Supabase Realtime.

## ⚠️ Prerequisites

**IMPORTANT**: Before using Realtime, you must enable replication for your tables in Supabase.

See the **[Supabase Realtime Setup Guide](./supabase-realtime-setup.md)** for complete setup instructions.

**Quick Setup:**
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for: `links`, `link_checks`, `workspaces`
3. Or run: `docs/sql/migrations/enable_realtime_replication.sql`

## Overview

The application uses Supabase Realtime to automatically update link status and check history without requiring page refresh. This provides a seamless user experience when links are being verified.

## Features

✅ **Real-Time Link Updates**: Status changes appear instantly
✅ **Real-Time Check History**: New checks appear automatically
✅ **Visual Feedback**: Animated indicators when updates occur
✅ **No Page Refresh**: Changes update dynamically
✅ **Automatic Cleanup**: Subscriptions properly cleaned up on unmount

## Implementation

### Supabase Realtime Subscriptions

**Location**: `app/dashboard/links/[id]/page.tsx`

```typescript
const setupRealtimeSubscriptions = () => {
  // Subscribe to link updates
  const linkChannel = supabase
    .channel(`link:${linkId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'links',
        filter: `id=eq.${linkId}`,
      },
      (payload) => {
        // Update link state with new data
        setLink((prevLink) => ({
          ...prevLink,
          ...payload.new,
        }));

        // Show visual feedback
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 2000);
      }
    )
    .subscribe();

  // Subscribe to new check results
  const checksChannel = supabase
    .channel(`link_checks:${linkId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'link_checks',
        filter: `link_id=eq.${linkId}`,
      },
      (payload) => {
        // Add new check to the beginning of the list
        setChecks((prevChecks) => [payload.new, ...prevChecks]);
      }
    )
    .subscribe();
};
```

### Subscription Lifecycle

```typescript
useEffect(() => {
  // Setup on mount
  setupRealtimeSubscriptions();

  // Cleanup on unmount
  return () => {
    supabase.removeAllChannels();
  };
}, [linkId]);
```

## How It Works

### Link Status Updates

```
Background verification completes
    ↓
Database: links table updated
    ↓
Supabase Realtime detects UPDATE
    ↓
Event broadcast to subscribed clients
    ↓
React state updated
    ↓
UI re-renders with new status
    ↓
Visual feedback shown (ring + "Updated" badge)
    ↓
Feedback disappears after 2 seconds
```

### Check History Updates

```
Check result stored in database
    ↓
Database: link_checks table INSERT
    ↓
Supabase Realtime detects INSERT
    ↓
Event broadcast to subscribed clients
    ↓
New check added to state array
    ↓
Table re-renders with new row at top
```

## Visual Feedback

### Status Badge Ring

When a status update occurs:
```jsx
<Badge
  className={`gap-1.5 transition-all ${justUpdated ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
>
  <div className={`h-2 w-2 rounded-full ${config.color}`} />
  {config.label}
</Badge>
```

**Effect**:
- Blue ring appears around status badge
- Ring offset creates spacing
- Smooth transition animation

### "Updated" Badge

Temporary indicator that appears for 2 seconds:
```jsx
{justUpdated && (
  <Badge variant='outline' className='text-xs animate-pulse'>
    Updated
  </Badge>
)}
```

**Effect**:
- Small badge appears next to status
- Pulse animation draws attention
- Auto-disappears after 2 seconds

## User Experience

### Adding a New Link

```
1. User adds link
2. Link appears with "Checking" status
3. [Auto-verification starts in background]
4. ✨ Status updates to "Active" (no refresh!)
5. ✨ Blue ring + "Updated" badge appears
6. ✨ New check appears in history table
7. Ring and badge fade after 2 seconds
```

### Manual Check

```
1. User clicks "Check Now" button
2. Button shows "Checking..." with spinner
3. [Check happens in background]
4. ✨ Status updates automatically
5. ✨ Visual feedback shows update occurred
6. ✨ New check appears in table
```

### Bulk Import

```
1. User imports 50 links
2. All appear with "Checking" status
3. [Sequential verification starts]
4. ✨ Each link status updates as verified
5. ✨ Visual feedback for each update
6. ✨ Check history populates for each link
```

## Subscribed Events

### Links Table

| Event | Filter | Action |
|-------|--------|--------|
| UPDATE | `id=eq.{linkId}` | Update link state |

**Triggered by**:
- Auto-verification completing
- Manual check completing
- Scheduled cron check completing
- Status changes

### Link Checks Table

| Event | Filter | Action |
|-------|--------|--------|
| INSERT | `link_id=eq.{linkId}` | Add to checks array |

**Triggered by**:
- New check result stored
- Any verification completing

## Benefits

### 1. Instant Feedback

- Users see results immediately
- No confusion about link status
- Professional, modern UX

### 2. No Manual Refresh

- Eliminates need to reload page
- Smooth, uninterrupted workflow
- Less frustration

### 3. Better Monitoring

- Watch verification progress in real-time
- See exactly when checks complete
- Track status changes as they happen

### 4. Multiple Tabs

- Updates sync across all open tabs
- Consistent state everywhere
- No stale data

## Performance

### Minimal Overhead

- Only subscribes to specific link
- Efficient filter: `id=eq.{linkId}`
- Small payload size
- Event-driven (no polling)

### Network Usage

- WebSocket connection (persistent)
- ~1KB per update event
- Much more efficient than polling
- Automatic reconnection on disconnect

### Memory Management

- Subscriptions properly cleaned up
- No memory leaks
- Unsubscribes on component unmount

## Troubleshooting

### Updates Not Appearing

**Possible causes**:
- Supabase Realtime not enabled
- RLS policies blocking updates
- WebSocket connection failed

**Solutions**:
1. Check Supabase dashboard → Realtime settings
2. Verify RLS policies allow SELECT
3. Check browser console for errors
4. Check network tab for WebSocket connection

### Stale Data

**Possible causes**:
- Initial fetch failed
- Subscription setup delayed
- State not updating correctly

**Solutions**:
1. Check console logs for "[Realtime]" messages
2. Verify subscription filter is correct
3. Check React DevTools for state updates

### Visual Feedback Not Showing

**Possible causes**:
- CSS not loading
- Animation disabled in browser
- Timeout not clearing

**Solutions**:
1. Check element in DevTools
2. Verify Tailwind classes applied
3. Check `justUpdated` state

## Console Logging

Monitor real-time events:

```
[Realtime] Subscriptions setup for link: abc-123
[Realtime] Link updated: { old: {...}, new: {...} }
[Realtime] New check added: { ... }
```

## Database Requirements

### Supabase Realtime

Must be enabled in Supabase dashboard:
```
Project Settings → Database → Realtime
✅ links
✅ link_checks
```

### Row Level Security

Policies must allow SELECT:
```sql
-- Users can view own links
CREATE POLICY "Users can view own links"
  ON links FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view own link checks
CREATE POLICY "Users can view own link checks"
  ON link_checks FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );
```

## Example: Complete Flow

### User Journey

```
1. User navigates to link detail page
   └─> Subscriptions setup

2. User clicks "Check Now"
   └─> Check initiated

3. [Background: Check completes]
   └─> Database updated

4. Supabase Realtime broadcasts UPDATE
   └─> Client receives event

5. React state updated
   └─> UI re-renders

6. Visual feedback shown
   └─> Ring + "Updated" badge appear

7. After 2 seconds
   └─> Visual feedback fades out
```

### Developer Experience

```typescript
// Setup is automatic
useEffect(() => {
  setupRealtimeSubscriptions();
  return () => supabase.removeAllChannels();
}, [linkId]);

// Updates happen automatically
// No code needed - just works! ✨
```

## Best Practices

### 1. Always Cleanup

```typescript
useEffect(() => {
  setupSubscriptions();

  // Critical: cleanup on unmount
  return () => {
    supabase.removeAllChannels();
  };
}, []);
```

### 2. Filter Subscriptions

```typescript
// Good: Specific filter
filter: `id=eq.${linkId}`

// Bad: No filter (receives all updates)
// Don't do this!
```

### 3. Merge State Carefully

```typescript
// Good: Preserve existing data
setLink(prev => ({ ...prev, ...payload.new }));

// Bad: Replace entire object
setLink(payload.new); // May lose workspace data
```

### 4. Provide Visual Feedback

```typescript
// Good: Show user something changed
setJustUpdated(true);
setTimeout(() => setJustUpdated(false), 2000);

// Bad: Silent updates (confusing)
```

## Future Enhancements

Potential improvements:

- [ ] Toast notifications for updates
- [ ] Sound effects for status changes
- [ ] Customizable visual feedback
- [ ] Update animations (fade in/out)
- [ ] Batch update optimizations
- [ ] Offline queue sync

## Comparison

### Without Real-Time Updates

```
User adds link → Status: "Checking"
    ↓
[Wait... wait... wait...]
    ↓
User hits refresh
    ↓
Status: "Active"
```

**Issues:**
- Manual refresh required
- User doesn't know when complete
- Poor UX

### With Real-Time Updates

```
User adds link → Status: "Checking"
    ↓
[2 seconds later]
    ↓
✨ Status: "Active" (automatic!)
```

**Benefits:**
- Instant updates
- Professional UX
- No manual action needed

## Summary

Real-time updates provide:
- ✅ Automatic status updates (no refresh)
- ✅ Live check history additions
- ✅ Visual feedback for updates
- ✅ Seamless multi-tab sync
- ✅ Professional user experience
- ✅ Efficient WebSocket communication

This feature transforms the link monitoring experience from a static page to a dynamic, real-time dashboard.
