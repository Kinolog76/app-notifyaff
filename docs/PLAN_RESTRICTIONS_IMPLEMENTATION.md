# Plan Restrictions Implementation

This document outlines the plan-based restrictions implementation for LinkGuardian.

## Overview

The system enforces limits on links and workspaces based on the user's subscription plan using both database-level and application-level checks.

## Architecture

### 1. Database Layer (SQL Triggers)
Location: `docs/sql/сheck-сonstraints.md`

- **`check_links_limit()`**: Trigger function that runs before INSERT on `links` table
- **`check_workspaces_limit()`**: Trigger function that runs before INSERT on `workspaces` table

These triggers provide a safety net to prevent limit violations even if application-level checks are bypassed.

### 2. API Layer (Server-side Validation)

**Files Modified:**
- [app/api/links/route.ts](../app/api/links/route.ts) - Single link creation
- [app/api/links/bulk-import/route.ts](../app/api/links/bulk-import/route.ts) - Bulk link import
- [app/api/workspaces/route.ts](../app/api/workspaces/route.ts) - Workspace creation

Each API route checks `user_settings` table before allowing resource creation:

```typescript
const { data: settings } = await supabase
  .from('user_settings')
  .select('links_count, links_limit, plan')
  .eq('user_id', user.id)
  .single()

if (settings && settings.links_count >= settings.links_limit) {
  return NextResponse.json({
    error: 'Link limit exceeded',
    message: `Your ${settings.plan} plan allows ${settings.links_limit} links.`,
    needsUpgrade: true,
  }, { status: 403 })
}
```

### 3. Client Layer (UI Validation)

**Hook:** [lib/hooks/use-plan-limits.ts](../lib/hooks/use-plan-limits.ts)

Provides real-time plan limit information to React components:

```typescript
const {
  settings,           // User's plan settings
  loading,            // Loading state
  canAddLink,         // Boolean: can add more links
  canAddWorkspace,    // Boolean: can add more workspaces
  remainingLinks,     // Number of links remaining
  remainingWorkspaces,// Number of workspaces remaining
  linksPercentage,    // Usage percentage (0-100)
  workspacesPercentage// Usage percentage (0-100)
} = usePlanLimits()
```

**Component:** [components/upgrade-modal.tsx](../components/upgrade-modal.tsx)

A reusable modal that displays upgrade options when users hit their plan limits.

## Plan Limits

| Plan    | Price    | Links  | Workspaces | Check Frequency |
|---------|----------|--------|------------|-----------------|
| Free    | $0       | 25     | 2          | Weekly          |
| Basic   | $12/mo   | 250    | 5          | Daily           |
| Pro     | $24/mo   | 1,000  | 15         | 2x/day          |
| Agency  | $79/mo   | 10,000 | Unlimited  | 4x/day          |

## Implementation Details

### Error Handling

All API routes return a consistent error response when limits are exceeded:

```json
{
  "error": "Link limit exceeded",
  "message": "Your free plan allows 25 links. Please upgrade to add more.",
  "current": 25,
  "limit": 25,
  "needsUpgrade": true
}
```

HTTP Status: `403 Forbidden`

### Bulk Import Special Case

The bulk import endpoint checks if the total after import would exceed the limit:

```typescript
const newTotal = settings.links_count + links.length
if (newTotal > settings.links_limit) {
  // Return detailed error with requestedAmount
}
```

### Realtime Updates

The `usePlanLimits` hook subscribes to Supabase realtime changes on the `user_settings` table, ensuring the UI updates immediately when:
- User upgrades/downgrades their plan
- Links or workspaces are added/deleted
- Limits are adjusted

## Usage Examples

See [lib/hooks/use-plan-limits.example.tsx](../lib/hooks/use-plan-limits.example.tsx) for complete examples including:

1. Add Link Button with Plan Check
2. Create Workspace Button with Plan Check
3. Plan Usage Display Component
4. Bulk Import with Plan Check

## Integration Steps

To add plan restrictions to a new feature:

### 1. API Route
```typescript
// Check limits before creation
const { data: settings } = await supabase
  .from('user_settings')
  .select('resource_count, resource_limit, plan')
  .eq('user_id', user.id)
  .single()

if (settings && settings.resource_count >= settings.resource_limit) {
  return NextResponse.json({
    error: 'Resource limit exceeded',
    message: `Your ${settings.plan} plan allows ${settings.resource_limit} resources.`,
    needsUpgrade: true,
  }, { status: 403 })
}
```

### 2. UI Component
```typescript
const { settings } = usePlanLimits()
const [showUpgradeModal, setShowUpgradeModal] = useState(false)

const handleAction = async () => {
  const response = await fetch('/api/resource', { method: 'POST', ... })
  const result = await response.json()

  if (response.status === 403 && result.needsUpgrade) {
    setShowUpgradeModal(true)
    toast.error(result.message)
  }
}

return (
  <>
    <Button onClick={handleAction}>Action</Button>
    {showUpgradeModal && (
      <UpgradeModal
        onClose={() => setShowUpgradeModal(false)}
        message="You've reached your plan limit"
        currentPlan={settings?.plan}
      />
    )}
  </>
)
```

## Testing Checklist

- [ ] Try creating a link when at limit (should show upgrade modal)
- [ ] Try bulk importing when it would exceed limit (should show error)
- [ ] Try creating workspace when at limit (should show upgrade modal)
- [ ] Verify upgrade modal shows correct plans based on current plan
- [ ] Test realtime updates when limits change
- [ ] Verify database triggers block inserts when limits exceeded
- [ ] Test all error messages are user-friendly

## Database Schema Requirements

Ensure your `user_settings` table has:
- `user_id` (references auth.users)
- `plan` (text: 'free', 'basic', 'pro', 'agency')
- `plan_status` (text: subscription status)
- `links_count` (integer: current number of links)
- `links_limit` (integer: maximum allowed links)
- `workspaces_count` (integer: current number of workspaces)
- `workspaces_limit` (integer: maximum allowed workspaces)

These counts should be updated via database triggers when links/workspaces are inserted or deleted.

## Future Enhancements

1. Add usage warnings at 80% and 90% of limit
2. Implement soft delete to allow users to archive instead of delete
3. Add grace period when downgrading plans
4. Implement team/shared workspaces with separate limits
5. Add API rate limiting based on plan
