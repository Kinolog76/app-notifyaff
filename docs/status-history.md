# Status History Documentation

This document explains the Status History implementation for tracking and visualizing link check history over time.

## Overview

The status history system provides comprehensive tracking and analysis of link check results, including status changes, performance trends, and visual indicators.

## Implementation (Steps 48-53)

### Features

✅ **Step 48**: Check history query function (in `link-check-storage.ts`)
✅ **Step 49**: Fetches last 10+ checks for a link
✅ **Step 50**: Timeline component displays check history in UI
✅ **Step 51**: Shows status changes over time with badges
✅ **Step 52**: Response time trends (data ready for charts)
✅ **Step 53**: Highlights when link broke with visual indicators

## Components

### 1. Check History Query (Steps 48-49)

**Location**: `lib/link-check-storage.ts`

```typescript
// Fetch last 10 checks for a link
const { data, error } = await getLinkCheckHistory(linkId, 10);

// Fetch latest check
const { data: latestCheck } = await getLatestLinkCheck(linkId);
```

**Features**:
- Returns up to specified number of checks (default: 10)
- Ordered by `checked_at` descending (newest first)
- Includes all check data: status_code, response_time, retries, confidence

### 2. History Analyzer (Steps 51-53)

**Location**: `lib/link-history-analyzer.ts`

```typescript
import { analyzeCheckHistory } from '@/lib/link-history-analyzer';

const analysis = analyzeCheckHistory(checks);

console.log({
  totalChecks: analysis.totalChecks,
  successfulChecks: analysis.successfulChecks,
  uptimePercentage: analysis.uptimePercentage,
  statusChanges: analysis.statusChanges,        // Step 51
  lastBreakTimestamp: analysis.lastBreakTimestamp, // Step 53
  averageResponseTime: analysis.averageResponseTime,
  totalRetries: analysis.totalRetries,
  averageConfidence: analysis.averageConfidence,
});
```

**Analysis Metrics**:
- Total checks performed
- Successful vs failed checks
- Average response time
- Uptime percentage
- Status changes with timestamps
- Last time link broke
- Retry statistics
- Confidence scores

### 3. UI Components (Step 50)

**Location**: `app/dashboard/links/[id]/page.tsx`

Enhanced check history table with:
- Date & time of each check
- Status badge (Active/Broken/Warning)
- HTTP status code with color coding
- Response time in milliseconds
- Retry count (if retries occurred)
- Confidence score percentage
- Error messages
- Status change indicators
- Link broke highlights

## Visual Indicators

### Status Changes (Step 51)

When a status changes between checks:
```
✓ "Status Changed" badge appears
✓ Highlights transition (e.g., Active → Broken)
✓ Shows both old and new status
```

### Link Broke Highlight (Step 53)

When a link transitions from Active to Broken/Warning:
```
✓ Row highlighted in red background
✓ "Link Broke" badge in destructive variant
✓ Timestamp of when it broke
✓ Visual prominence for critical events
```

### Status Badges

Each check shows current status:
- **Active**: Green badge - HTTP 200-299
- **Broken**: Red badge - HTTP 404, 410, 4xx
- **Warning**: Yellow badge - HTTP 5xx, timeouts, network errors

## Data Visualization

### Response Time Trends (Step 52)

```typescript
import { getResponseTimeTrend } from '@/lib/link-history-analyzer';

const trendData = getResponseTimeTrend(checks);
// Returns: [{ timestamp: Date, responseTime: number }, ...]

// Ready for charting libraries like Recharts, Chart.js, etc.
```

### Uptime Trends

```typescript
import { getUptimeTrend } from '@/lib/link-history-analyzer';

const uptimeTrend = getUptimeTrend(checks, 10); // 10-check rolling window
// Returns: [{ timestamp: Date, uptimePercentage: number }, ...]
```

## UI Examples

### Check History Table

| Date & Time | Status | Code | Response | Retries | Confidence | Error |
|-------------|--------|------|----------|---------|------------|-------|
| Dec 29, 10:00 AM **Status Changed** | ⚫ Active | 200 | 450ms | - | 100% | - |
| Dec 29, 9:00 AM | ⚫ Warning | 500 | 2100ms | 2 retries | 100% | Internal Server Error |
| Dec 29, 8:00 AM **Link Broke** | 🔴 Broken | 404 | 350ms | - | 95% | Not Found |
| Dec 29, 7:00 AM | ⚫ Active | 200 | 420ms | - | 100% | - |

### Status Change Detection

```typescript
// Example: Link status changes from Active to Broken
{
  from: 'active',
  to: 'broken',
  timestamp: '2025-12-29T08:00:00Z',
  checkId: 'abc-123'
}
```

## Helper Functions

### Status Determination

```typescript
import { getStatusFromCheck } from '@/lib/link-history-analyzer';

const status = getStatusFromCheck(check);
// Returns: 'active' | 'broken' | 'warning'
```

### Format Status Change

```typescript
import { formatStatusChange } from '@/lib/link-history-analyzer';

const message = formatStatusChange(statusChange);
// Returns: "Active → Broken"
```

### Time Since Last Break

```typescript
import { getTimeSinceLastBreak } from '@/lib/link-history-analyzer';

const timeSince = getTimeSinceLastBreak(lastBreakTimestamp);
// Returns: "2 days ago" | "5 hours ago" | "Never broken"
```

## Usage Examples

### Display Check History

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getLinkCheckHistory } from '@/lib/link-check-storage';

export function LinkHistory({ linkId }: { linkId: string }) {
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      const { data } = await getLinkCheckHistory(linkId, 20);
      setChecks(data || []);
    }
    fetchHistory();
  }, [linkId]);

  return (
    <div>
      {checks.map((check, index) => (
        <CheckHistoryRow key={check.id} check={check} index={index} />
      ))}
    </div>
  );
}
```

### Analyze History

```typescript
import { analyzeCheckHistory } from '@/lib/link-history-analyzer';

const analysis = analyzeCheckHistory(checks);

// Display insights
console.log(`Uptime: ${analysis.uptimePercentage.toFixed(1)}%`);
console.log(`Avg Response: ${analysis.averageResponseTime}ms`);
console.log(`Status Changes: ${analysis.statusChanges.length}`);

if (analysis.lastBreakTimestamp) {
  console.log(`Last broke: ${getTimeSinceLastBreak(analysis.lastBreakTimestamp)}`);
}
```

### Detect Recent Issues

```typescript
const recentChecks = checks.slice(0, 5); // Last 5 checks
const hasRecentIssues = recentChecks.some(
  check => getStatusFromCheck(check) !== 'active'
);

if (hasRecentIssues) {
  console.warn('Link has recent issues!');
}
```

## Benefits

1. **Historical Insight**: See complete check history
2. **Status Tracking**: Monitor status changes over time
3. **Issue Detection**: Quickly identify when links break
4. **Performance Trends**: Track response time patterns
5. **Retry Transparency**: See how many retries were needed
6. **Confidence Metrics**: Understand result reliability

## Integration Points

### Database

Automatically fetches from `link_checks` table:
- All checks for a specific link
- Ordered by timestamp
- Includes retry and confidence data
- Respects RLS policies (users see only their links)

### UI Components

Integrates with existing UI:
- Check history table
- Status badges
- Error messages
- Visual highlights

### Analytics

Data ready for:
- Response time charts
- Uptime graphs
- Status distribution
- Retry statistics

## Performance Considerations

### Query Optimization

```typescript
// Limit number of checks fetched
getLinkCheckHistory(linkId, 20); // Only fetch 20 most recent

// For large datasets, consider pagination
const CHECKS_PER_PAGE = 20;
const offset = page * CHECKS_PER_PAGE;
```

### Database Indexes

Already created for fast queries:
```sql
CREATE INDEX idx_link_checks_link_id ON link_checks(link_id);
CREATE INDEX idx_link_checks_checked_at ON link_checks(checked_at DESC);
```

## Future Enhancements

Potential improvements:
- [ ] Interactive charts (Recharts, Chart.js)
- [ ] Export history to CSV
- [ ] Compare multiple links
- [ ] Customizable time ranges
- [ ] Anomaly detection
- [ ] Predictive alerts

## Example: Complete Analysis

```typescript
import { analyzeCheckHistory, getTimeSinceLastBreak } from '@/lib/link-history-analyzer';

// Fetch and analyze
const { data: checks } = await getLinkCheckHistory(linkId);
const analysis = analyzeCheckHistory(checks);

// Generate report
const report = {
  summary: {
    total: analysis.totalChecks,
    successful: analysis.successfulChecks,
    failed: analysis.failedChecks,
    uptime: `${analysis.uptimePercentage.toFixed(1)}%`,
  },
  performance: {
    avgResponseTime: `${analysis.averageResponseTime}ms`,
    totalRetries: analysis.totalRetries,
    avgConfidence: `${analysis.averageConfidence}%`,
  },
  history: {
    statusChanges: analysis.statusChanges.length,
    lastBroke: analysis.lastBreakTimestamp
      ? getTimeSinceLastBreak(analysis.lastBreakTimestamp)
      : 'Never',
  },
};

console.table(report);
```

## Monitoring Best Practices

1. **Regular Review**: Check history weekly for patterns
2. **Watch Trends**: Monitor response time increases
3. **Track Changes**: Investigate frequent status changes
4. **Review Retries**: High retry counts may indicate issues
5. **Confidence Scores**: Low scores warrant investigation

## Troubleshooting

### No History Showing

- Check link has been checked at least once
- Verify RLS policies allow access
- Confirm link ID is correct

### Incomplete Data

- Older checks may not have retry/confidence data
- Run database migration to add fields
- New checks will include all fields

### Performance Issues

- Limit number of checks fetched
- Use pagination for large datasets
- Consider archiving old checks
