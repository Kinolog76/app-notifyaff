# Retry Logic Documentation

This document explains the retry logic implementation for link checking.

## Overview

The link checking system includes automatic retry logic with exponential backoff to handle transient failures and ensure accurate link status detection.

## Implementation (Steps 43-47)

### Features

✅ **Step 43**: 3 retry attempts for failed checks
✅ **Step 44**: Exponential backoff (1s, 2s, 4s)
✅ **Step 45**: Only marks as broken after all retries fail
✅ **Step 46**: Stores retry attempts in check record
✅ **Step 47**: Calculates confidence score (0-100%)

## How It Works

### 1. Retry Attempts (Step 43)

The system attempts to check each link up to 3 times:

```typescript
const MAX_RETRIES = 3;
```

- **Attempt 1**: Initial check
- **Attempt 2**: First retry (after 1s delay)
- **Attempt 3**: Second retry (after 2s delay)
- **Attempt 4**: Third retry (after 4s delay) - if needed

### 2. Exponential Backoff (Step 44)

Delays between retry attempts increase exponentially:

```typescript
const BACKOFF_DELAYS_MS = [1000, 2000, 4000]; // 1s, 2s, 4s
```

**Why exponential backoff?**
- Gives temporary issues time to resolve
- Reduces load on target servers
- Avoids rate limiting
- Industry standard practice

### 3. Retry Decision Logic

The system only retries on **transient errors**:

**Will Retry:**
- Network errors (connection timeout, DNS failures)
- 5xx server errors (500, 502, 503, 504)
- 429 Too Many Requests
- 408 Request Timeout
- SSL/TLS certificate errors (may be temporary)

**Won't Retry (Permanent Failures):**
- 2xx success responses (200-299)
- 404 Not Found
- 410 Gone
- 403 Forbidden
- 401 Unauthorized
- Other 4xx client errors

### 4. Marking as Broken (Step 45)

Links are only marked as "broken" after:
1. All retry attempts are exhausted (3 total attempts)
2. OR a permanent failure is detected (404, 410, etc.)

Example scenario:
```
Attempt 1: 500 Internal Server Error → Retry after 1s
Attempt 2: 500 Internal Server Error → Retry after 2s
Attempt 3: 200 OK → Success! Mark as "active"
```

### 5. Storing Retry Information (Step 46)

The system stores detailed retry information:

```typescript
{
  retry_count: 2,           // Number of retries (0 = success on first try)
  confidence_score: 100,    // 0-100% confidence in result
  retry_history: [          // Details of each attempt
    {
      attempt: 1,
      statusCode: 500,
      error: "Internal Server Error",
      timestamp: "2025-12-29T10:00:00Z"
    },
    {
      attempt: 2,
      statusCode: 500,
      error: "Internal Server Error",
      timestamp: "2025-12-29T10:00:01Z"
    },
    {
      attempt: 3,
      statusCode: 200,
      timestamp: "2025-12-29T10:00:03Z"
    }
  ]
}
```

**Database Schema:**

```sql
ALTER TABLE link_checks
ADD COLUMN retry_count INTEGER DEFAULT 0,
ADD COLUMN confidence_score INTEGER DEFAULT 100,
ADD COLUMN retry_history JSONB;
```

### 6. Confidence Score (Step 47)

The confidence score indicates how reliable the check result is:

| Scenario | Retry Count | Confidence Score |
|----------|-------------|------------------|
| Success on first try | 0 | 100% |
| Success after 1 retry | 1 | 100% |
| Success after 2 retries | 2 | 100% |
| Failed after all retries | 3 | 100% (confident it's broken) |
| 404 Not Found (no retry) | 0 | 95% (permanent error) |
| Failed early (no retry) | 0 | ~33% (less confident) |

**Calculation Logic:**

```typescript
function calculateConfidenceScore(result, attemptNumber) {
  if (result.success) return 100;  // Success = high confidence
  if (attemptNumber >= MAX_RETRIES) return 100;  // Exhausted retries = high confidence
  if (result.statusCode >= 400 && result.statusCode < 500) return 95;  // 4xx = confident it's broken

  // Failed early = lower confidence
  const confidencePerAttempt = 100 / MAX_RETRIES;
  return Math.round(attemptNumber * confidencePerAttempt);
}
```

## Usage

### With Retry Logic (Recommended)

```typescript
import { checkLinkWithRetry } from '@/lib/link-checker-retry';

const result = await checkLinkWithRetry('https://example.com');

console.log({
  success: result.success,
  statusCode: result.statusCode,
  retryCount: result.retryCount,        // How many retries were needed
  confidenceScore: result.confidenceScore, // How confident we are (0-100%)
  retryHistory: result.retryHistory     // Detailed history of attempts
});
```

### Without Retry Logic (Basic)

```typescript
import { checkLink } from '@/lib/link-checker';

const result = await checkLink('https://example.com');
// No retry information available
```

## Benefits

1. **Reliability**: Reduces false positives from temporary network issues
2. **Accuracy**: Only marks links as broken after confirming the issue
3. **Transparency**: Stores retry history for debugging
4. **Confidence**: Provides confidence score for result reliability
5. **Cost-effective**: Avoids unnecessary notifications for transient failures

## Example Scenarios

### Scenario 1: Temporary Server Overload

```
Check: https://example.com/affiliate-link

Attempt 1: 503 Service Unavailable → Retry after 1s
Attempt 2: 503 Service Unavailable → Retry after 2s
Attempt 3: 200 OK → Success!

Result:
  status: "active"
  retryCount: 2
  confidenceScore: 100%
```

**Without retry logic**, this would be marked as "broken" and trigger a false alarm.

### Scenario 2: Genuinely Broken Link

```
Check: https://example.com/deleted-product

Attempt 1: 404 Not Found → No retry (permanent failure)

Result:
  status: "broken"
  retryCount: 0
  confidenceScore: 95%
```

No time wasted on retries for obvious permanent failures.

### Scenario 3: Network Timeout

```
Check: https://slow-server.com/link

Attempt 1: Timeout after 10s → Retry after 1s
Attempt 2: Timeout after 10s → Retry after 2s
Attempt 3: 200 OK → Success!

Result:
  status: "active"
  retryCount: 2
  confidenceScore: 100%
```

### Scenario 4: Persistent Failure

```
Check: https://down-site.com/link

Attempt 1: Connection refused → Retry after 1s
Attempt 2: Connection refused → Retry after 2s
Attempt 3: Connection refused → No more retries

Result:
  status: "warning"
  retryCount: 2
  confidenceScore: 100%
```

After 3 attempts, we're confident the link is genuinely down.

## Performance Impact

### Time Cost

- **Success on first try**: 0 extra time
- **Success after 1 retry**: +1s
- **Success after 2 retries**: +3s (1s + 2s)
- **Failure after all retries**: +7s (1s + 2s + 4s)

### Trade-offs

**Pros:**
- Significantly reduces false positives
- Improves data accuracy
- Reduces noise in notifications

**Cons:**
- Slightly longer check time for failed links
- More API calls for transient failures

**Overall**: The benefits far outweigh the costs for a monitoring system.

## Configuration

Retry behavior can be customized:

```typescript
import { RetryConfig } from '@/lib/link-checker-retry';

console.log(RetryConfig.maxRetries);      // 3
console.log(RetryConfig.backoffDelays);   // [1000, 2000, 4000]
console.log(RetryConfig.getBackoffDelay(0)); // 1000ms
```

## Monitoring

Track retry metrics:

```sql
-- Average retry count
SELECT AVG(retry_count) FROM link_checks;

-- Distribution of confidence scores
SELECT confidence_score, COUNT(*)
FROM link_checks
GROUP BY confidence_score;

-- Links that needed retries
SELECT * FROM link_checks
WHERE retry_count > 0
ORDER BY checked_at DESC;
```

## Best Practices

1. **Use retry logic for scheduled checks** - More reliable than manual checks
2. **Monitor retry patterns** - High retry rates may indicate infrastructure issues
3. **Review low confidence scores** - May indicate flaky links
4. **Don't retry too aggressively** - Could impact target servers

## Migration

To add retry fields to existing database:

```bash
# Run the migration
psql -f docs/sql/migrations/add_retry_fields_to_link_checks.sql
```

## Future Enhancements

Potential improvements:
- [ ] Configurable retry counts per user plan
- [ ] Adaptive backoff based on error type
- [ ] Circuit breaker for consistently failing domains
- [ ] Retry stats in admin dashboard
