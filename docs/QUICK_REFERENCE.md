# Plan Restrictions - Quick Reference

## Files Created/Modified

### ✅ Created Files
1. **[lib/hooks/use-plan-limits.ts](../lib/hooks/use-plan-limits.ts)** - React hook for plan limits
2. **[components/upgrade-modal.tsx](../components/upgrade-modal.tsx)** - Upgrade modal component
3. **[lib/hooks/use-plan-limits.example.tsx](../lib/hooks/use-plan-limits.example.tsx)** - Usage examples
4. **[docs/PLAN_RESTRICTIONS_IMPLEMENTATION.md](PLAN_RESTRICTIONS_IMPLEMENTATION.md)** - Full documentation

### ✅ Modified Files
1. **[app/api/links/route.ts](../app/api/links/route.ts)** - Added plan limit checks
2. **[app/api/links/bulk-import/route.ts](../app/api/links/bulk-import/route.ts)** - Added bulk import limit checks
3. **[app/api/workspaces/route.ts](../app/api/workspaces/route.ts)** - Added workspace limit checks
4. **[components/links/add-link-form.tsx](../components/links/add-link-form.tsx)** - Added UI validation
5. **[components/links/bulk-import-dialog.tsx](../components/links/bulk-import-dialog.tsx)** - Added UI validation
6. **[components/workspace/workspace-modal.tsx](../components/workspace/workspace-modal.tsx)** - Added UI validation

## How It Works

### Three-Layer Protection

1. **Client-side (UI)** - Prevents requests if limit reached
   - Hook: `usePlanLimits()` provides real-time limit data
   - Components: Buttons disabled when at limit
   - Modal: Shows upgrade options when limit hit

2. **Server-side (API)** - Validates before database insert
   - Checks `user_settings` table for current count vs limit
   - Returns 403 with `needsUpgrade: true` if exceeded
   - Provides clear error messages

3. **Database-side (Triggers)** - Final safety net
   - SQL triggers on INSERT operations
   - Prevents any bypass of application logic
   - Located in: `docs/sql/сheck-сonstraints.md`

## Quick Integration

### Use the Hook
```typescript
import { usePlanLimits } from '@/lib/hooks/use-plan-limits'

const { canAddLink, remainingLinks, settings } = usePlanLimits()
```

### Show Upgrade Modal
```typescript
import { UpgradeModal } from '@/components/upgrade-modal'

<UpgradeModal
  onClose={() => setShowUpgradeModal(false)}
  message="You've reached your plan limit"
  currentPlan={settings?.plan}
  type="links" // or "workspaces"
/>
```

### Handle API Errors
```typescript
const response = await fetch('/api/links', { method: 'POST', ... })
const result = await response.json()

if (response.status === 403 && result.needsUpgrade) {
  // Show upgrade modal
}
```

## Plan Limits Reference

| Plan   | Price   | Links  | Workspaces |
|--------|---------|--------|------------|
| Free   | $0      | 25     | 2          |
| Basic  | $12/mo  | 250    | 5          |
| Pro    | $24/mo  | 1,000  | 15         |
| Agency | $79/mo  | 10,000 | Unlimited  |

## Testing

To test the restrictions:
1. Set your user's `links_limit` to a low number (e.g., 2)
2. Try adding links until you hit the limit
3. Verify the upgrade modal appears
4. Check that the button is disabled after limit reached

## Next Steps

- [ ] Add toast notifications instead of alerts
- [ ] Create usage warning at 80% and 90% of limit
- [ ] Add plan usage indicators in the dashboard
- [ ] Implement soft delete for better UX
- [ ] Add API documentation for error responses
