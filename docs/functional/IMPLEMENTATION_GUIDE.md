# Link Checks Integration - Implementation Guide

## Overview
This guide shows how the link checking system integrates with the database and UI components.

## Database Schema Required

Ensure your Supabase database has the `link_checks` table:

```sql
CREATE TABLE link_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  redirect_chain JSONB,
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_link_checks_link_id ON link_checks(link_id);
CREATE INDEX idx_link_checks_checked_at ON link_checks(checked_at DESC);

-- Row Level Security
ALTER TABLE link_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own link checks"
  ON link_checks FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );
```

Also ensure `links` table has required fields:
```sql
ALTER TABLE links ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE links ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP;
ALTER TABLE links ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT true;
```

## API Endpoints

### 1. Manual Link Check
**POST** `/api/links/[id]/check`

Triggers an immediate check of a specific link.

**Response:**
```json
{
  "message": "Link checked successfully",
  "data": {
    "linkId": "uuid",
    "url": "https://example.com",
    "status": "active",
    "lastCheckedAt": "2025-01-01T12:00:00Z",
    "checkResult": {
      "success": true,
      "statusCode": 200,
      "responseTime": 245,
      "redirectChain": ["https://example.com"],
      "error": null
    },
    "checkRecord": {
      "id": "uuid",
      "status_code": 200,
      "response_time_ms": 245,
      "checked_at": "2025-01-01T12:00:00Z"
    }
  }
}
```

### 2. Scheduled Checks (Cron)
**GET** `/api/cron/check-links`

Requires `Authorization: Bearer CRON_SECRET` header.

Checks all links based on their plan frequency:
- Free: Weekly (168 hours)
- Basic: Daily (24 hours)
- Pro: 2x daily (12 hours)
- Agency: 4x daily (6 hours)

### 3. Cleanup Old Checks (Cron)
**GET** `/api/cron/cleanup-old-checks`

Deletes old check records based on plan retention:
- Free: 30 days
- Basic: 90 days
- Pro: 365 days
- Agency: Unlimited

Always keeps minimum 10 checks per link.

## UI Components

### LinkCheckHistory Component

Display check history in a table with pagination.

```tsx
import { LinkCheckHistory } from "@/components/links/LinkCheckHistory";

export default function LinkDetailsPage({ linkId }: { linkId: string }) {
  return (
    <div>
      <h2>Check History</h2>
      <LinkCheckHistory linkId={linkId} limit={50} />
    </div>
  );
}
```

**Features:**
- Table view of all checks
- Status badges (active/broken/warning)
- Response time display
- Error messages
- Details modal with redirect chain

### StatusTimeline Component

Visual timeline of status changes.

```tsx
import { StatusTimeline } from "@/components/links/StatusTimeline";

export default function LinkDetailsPage({ linkId }: { linkId: string }) {
  return (
    <div>
      <h2>Status Timeline</h2>
      <StatusTimeline linkId={linkId} />
    </div>
  );
}
```

**Features:**
- Shows only status changes (not every check)
- Duration of each status
- Highlights when link first broke
- Visual icons for each status

### ResponseTimeChart Component

Chart showing response time trends.

```tsx
import { ResponseTimeChart } from "@/components/links/ResponseTimeChart";

export default function LinkDetailsPage({ linkId }: { linkId: string }) {
  return (
    <div>
      <h2>Response Time Trend</h2>
      <ResponseTimeChart linkId={linkId} limit={30} />
    </div>
  );
}
```

**Features:**
- Line chart of response times
- Average response time indicator
- Slow response threshold (>2s)
- Last N checks visualization

## Backend Functions

### Server-Side Functions (for API routes)

```typescript
// lib/link-checker-server.ts
import { checkLink } from '@/lib/link-checker-server';

// Automatically saves to database
const result = await checkLink(url, linkId);
```

### Client-Side Functions (for React components)

```typescript
// lib/supabase/link-checks.ts
import {
  getLinkCheckHistory,
  getLatestLinkCheck,
  getCheckStats
} from '@/lib/supabase/link-checks';

// Get history (client-side)
const checks = await getLinkCheckHistory(linkId, 100);

// Get latest check
const latest = await getLatestLinkCheck(linkId);

// Get statistics (with caching)
const stats = await getCheckStats(linkId);
```

## How It Works

### 1. Link Check Flow

```
User triggers check
    ↓
POST /api/links/[id]/check
    ↓
checkLink(url, linkId) - performs HTTP check
    ↓
insertLinkCheck() - saves to link_checks table
    ↓
updateLinkStatus() - updates links.status
    ↓
handleLinkStatusNotification() - triggers notifications if status changed
    ↓
Return result to user
```

### 2. Scheduled Check Flow

```
Vercel Cron triggers GET /api/cron/check-links
    ↓
Fetch links needing check (based on plan frequency)
    ↓
Process in batches of 50
    ↓
For each link: checkLink(url, linkId)
    ↓
Rate limiting (100ms between requests)
    ↓
Return statistics
```

### 3. Notification Flow

```
Link status changes (active → broken)
    ↓
updateLinkStatus() detects change
    ↓
handleLinkStatusNotification()
    ↓
Check rate limiting (max 1 per 24h)
    ↓
Store in notifications table
    ↓
Prepare email (ready for email service)
```

## Performance Optimizations

1. **Database Indexes** - Fast queries on `link_id` and `checked_at`
2. **Query Limits** - Maximum 100 checks per query
3. **Caching** - 5-minute cache for check statistics
4. **Batch Processing** - 50 links per batch in cron
5. **Rate Limiting** - 100ms delay between checks

## Error Handling

- All database operations wrapped in try-catch
- Graceful degradation (continues even if DB insert fails)
- Comprehensive error logging
- Different error messages for DNS, SSL, timeout, HTTP errors

## Testing

To test the integration:

1. **Manual Check:**
   ```bash
   curl -X POST http://localhost:3000/api/links/[link-id]/check \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Check Cron:**
   ```bash
   curl http://localhost:3000/api/cron/check-links \
     -H "Authorization: Bearer CRON_SECRET"
   ```

3. **Verify Database:**
   ```sql
   SELECT * FROM link_checks ORDER BY checked_at DESC LIMIT 10;
   ```

## Next Steps

1. Run performance optimization SQL:
   ```bash
   psql your_database < docs/sql/migrations/performance_optimization.sql
   ```

2. Set up Vercel Cron Jobs:
   - `/api/cron/check-links` - Every hour
   - `/api/cron/cleanup-old-checks` - Weekly

3. Integrate email service (Resend/SendGrid) for notifications

4. Add the UI components to your link details page
