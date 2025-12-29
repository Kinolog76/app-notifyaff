# Cron Job Setup Guide

This document explains how to set up and configure the automated link checking cron job.

## Overview

The link checking system uses Vercel Cron Jobs to automatically check links based on user subscription plans:

- **Free**: Weekly checks (every 168 hours)
- **Basic**: Daily checks (every 24 hours)
- **Pro**: 2x daily checks (every 12 hours)
- **Agency**: 4x daily checks (every 6 hours)

## Configuration

### 1. Vercel Cron Configuration

The `vercel.json` file configures the cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-links",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Schedule**: `0 */6 * * *` - Runs every 6 hours (at 00:00, 06:00, 12:00, 18:00 UTC)

### 2. Environment Variables

Add the following to your `.env` file:

```bash
CRON_SECRET=your_random_secret_here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. Vercel Dashboard Setup

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `CRON_SECRET` with your generated secret
4. Deploy your project

### 4. Security

The cron endpoint verifies requests using the `CRON_SECRET`:

```typescript
const authHeader = request.headers.get('authorization');
// Must match: Bearer YOUR_CRON_SECRET
```

Vercel automatically adds this header to cron requests.

## How It Works

### Step-by-Step Process

1. **Cron Trigger**: Vercel triggers `/api/cron/check-links` every 6 hours
2. **Fetch Links**: Retrieves all links with user plan information
3. **Filter by Plan**: Determines which links need checking based on:
   - Last check time (`last_checked_at`)
   - User plan frequency
4. **Batch Processing**: Processes links in batches of 50
5. **Rate Limiting**: 100ms delay between individual checks
6. **Update Status**: Stores results and updates link status
7. **Logging**: Logs execution details and statistics

### Plan Frequencies

```typescript
const PLAN_CHECK_FREQUENCIES = {
  free: 168,    // Weekly (7 days * 24 hours)
  basic: 24,    // Daily
  pro: 12,      // 2x per day
  agency: 6,    // 4x per day
};
```

### Batch Processing

- **Batch Size**: 50 links per batch
- **Rate Limit**: 100ms delay between checks
- **Sequential Processing**: Batches processed one at a time

## API Endpoint

### GET `/api/cron/check-links`

**Headers Required**:
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response**:
```json
{
  "message": "Link check completed",
  "stats": {
    "totalLinks": 1000,
    "linksNeedingCheck": 250,
    "totalChecked": 250,
    "totalSuccessful": 245,
    "totalFailed": 5,
    "batchesProcessed": 5,
    "duration": 45000
  },
  "results": [...]
}
```

## Testing Locally

Test the cron job locally:

```bash
# Set CRON_SECRET in .env.local
echo "CRON_SECRET=test-secret-123" >> .env.local

# Make a request
curl -X GET http://localhost:3000/api/cron/check-links \
  -H "Authorization: Bearer test-secret-123"
```

## Monitoring

### Logs

Check Vercel logs for cron execution:
- Go to Vercel Dashboard → Your Project → Logs
- Filter by `/api/cron/check-links`

### Log Output

```
[CRON] Starting scheduled link check job
[CRON] Found 250 links needing check (out of 1000 total)
[CRON] Processing 5 batch(es) of up to 50 links
[CRON] Processing batch 1/5 (50 links)
[CRON] Completed link check job in 45000ms
[CRON] Stats: 250 checked, 245 successful, 5 failed
```

## Troubleshooting

### Cron not running

1. Check `vercel.json` is committed and deployed
2. Verify environment variable `CRON_SECRET` is set in Vercel
3. Check Vercel Dashboard → Cron Jobs tab

### 401 Unauthorized

- Ensure `CRON_SECRET` environment variable matches
- Check Authorization header format: `Bearer YOUR_SECRET`

### Performance Issues

- Adjust `BATCH_SIZE` (default: 50)
- Increase `RATE_LIMIT_DELAY_MS` (default: 100ms)
- Monitor execution time in logs

## Schedule Customization

To change the cron schedule, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-links",
      "schedule": "0 */12 * * *"  // Every 12 hours
    }
  ]
}
```

### Cron Expression Reference

- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight
- `0 */2 * * *` - Every 2 hours
- `0 0 */2 * *` - Every 2 days

## Cost Optimization

- Free plan checks run weekly to minimize costs
- Batch processing reduces concurrent requests
- Rate limiting prevents API throttling
- Only checks links that need checking (based on last check time)

## Next Steps

1. Set up monitoring/alerting for failed cron jobs
2. Implement retry logic for failed checks (Section 6 of plan)
3. Add notification triggers (Section 8 of plan)
4. Create admin dashboard for cron statistics (Section 10 of plan)
