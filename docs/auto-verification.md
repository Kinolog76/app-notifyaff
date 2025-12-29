# Automatic Link Verification

This document explains the automatic verification feature that checks links immediately after they are created.

## Overview

When users add new links (single or bulk import), the system automatically verifies them in the background to provide immediate feedback on link status.

## Features

### Automatic Verification on Creation

✅ **Single Link Creation**: Verified immediately after adding
✅ **Bulk Import**: All imported links verified sequentially
✅ **Background Processing**: Non-blocking, doesn't delay API response
✅ **Retry Logic**: Uses retry mechanism with exponential backoff
✅ **Status Updates**: Real-time status updates via Supabase
✅ **Error Handling**: Graceful failure handling

## How It Works

### Single Link Creation

```
User adds link → Link saved to database → Response sent immediately → Background verification starts
                  ↓
              status: "checking"
                  ↓
          [Background Process]
                  ↓
        Check link with retry
                  ↓
        Store check result
                  ↓
        Update status (active/broken/warning)
                  ↓
          User sees updated status
```

### Bulk Import

```
User imports CSV → All links saved → Response sent → Sequential verification
                      ↓
                All start with status: "checking"
                      ↓
                [Background Process]
                      ↓
            Check each link (with 200ms delay)
                      ↓
            Store results & update statuses
                      ↓
            Users see statuses update in real-time
```

## Implementation

### POST /api/links

**Single link creation with auto-verification:**

```typescript
// Link is created
const { data } = await supabase.from("links").insert({
  user_id: user.id,
  url,
  name,
  status: "checking", // Initial status
  // ... other fields
});

// Background verification (fire and forget)
(async () => {
  try {
    const checkResult = await checkLinkWithRetry(linkUrl);
    await storeLinkCheck({ linkId, checkResult });
    await updateLinkStatusFromCheck(linkId, checkResult);

    console.log(`[Auto-verify] Completed: ${linkId}`);
  } catch (error) {
    console.error(`[Auto-verify] Failed: ${linkId}`, error);
  }
})();

// Response sent immediately (doesn't wait for verification)
return NextResponse.json({
  message: "Link created successfully and verification started",
  data,
  verifying: true,
});
```

### POST /api/links/bulk-import

**Bulk import with sequential verification:**

```typescript
// All links inserted
const { data } = await supabase.from("links").insert(linksToInsert);

// Background verification
(async () => {
  for (const link of data) {
    try {
      const checkResult = await checkLinkWithRetry(link.url);
      await storeLinkCheck({ linkId: link.id, checkResult });
      await updateLinkStatusFromCheck(link.id, checkResult);

      // Small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to verify ${link.id}:`, error);
    }
  }
})();

return NextResponse.json({
  message: "Successfully imported and verification started",
  data,
  verifying: true,
});
```

## Benefits

### 1. Immediate Feedback

Users don't have to wait for scheduled checks to see if their links work:
- See link status within seconds of adding
- Identify broken links immediately
- Fix issues before sharing

### 2. Better User Experience

- No confusion about link status
- Clear "checking" → "active/broken" progression
- Real-time updates via Supabase Realtime

### 3. Early Problem Detection

- Catch typos in URLs immediately
- Identify dead links before they cause issues
- Verify affiliate links work before promotion

### 4. Non-Blocking Design

- API responds immediately
- Verification happens in background
- Doesn't slow down user workflow
- Doesn't impact API response times

## User Flow

### Adding a Single Link

```
1. User fills out "Add Link" form
2. Clicks "Add Link" button
3. ✅ Link appears immediately with "Checking" status
4. [Background: verification starts]
5. ✅ Status updates to "Active" (or "Broken"/"Warning")
6. User sees final status within 1-10 seconds
```

### Bulk Import

```
1. User uploads CSV with 50 links
2. Clicks "Import" button
3. ✅ All links appear with "Checking" status
4. [Background: sequential verification]
5. ✅ Statuses update one by one as checks complete
6. User watches progress in real-time
7. All links verified within 1-5 minutes
```

## Response Format

### Single Link

```json
{
  "message": "Link created successfully and verification started",
  "data": {
    "id": "abc-123",
    "url": "https://example.com",
    "name": "My Link",
    "status": "checking",
    "created_at": "2025-12-29T10:00:00Z"
  },
  "verifying": true
}
```

### Bulk Import

```json
{
  "message": "Successfully imported 50 links and verification started",
  "data": [
    {
      "id": "abc-123",
      "url": "https://example.com/1",
      "status": "checking"
    },
    // ... 49 more links
  ],
  "verifying": true
}
```

## Logging

### Console Logs

**Verification Start:**
```
[Auto-verify] Checking new link: abc-123
```

**Verification Complete:**
```
[Auto-verify] Completed check for link: abc-123 - Status: success
```

**Verification Failure:**
```
[Auto-verify] Failed to verify link abc-123: Network timeout
```

**Bulk Import:**
```
[Auto-verify] Starting verification of 50 bulk imported links
[Auto-verify] Verified bulk link: abc-123
[Auto-verify] Verified bulk link: abc-124
...
[Auto-verify] Completed verification of bulk imported links
```

## Performance Considerations

### Single Link

- **Non-blocking**: Response sent immediately
- **Time to verify**: 1-10 seconds (depends on target server)
- **Retries**: Up to 3 attempts with exponential backoff
- **Maximum time**: ~17 seconds with all retries

### Bulk Import

- **Sequential processing**: One link at a time
- **Rate limiting**: 200ms delay between checks
- **Time per link**: ~1-2 seconds average
- **Total time**: ~1-5 minutes for 50 links
- **Memory efficient**: Doesn't load all checks in parallel

## Error Handling

### Verification Failures

If verification fails, the link status remains "checking":
- User can manually trigger re-check
- Scheduled checks will verify later
- Error is logged but doesn't break the flow

### Database Errors

If storing check results fails:
- Error is logged
- Link status may not update
- User can manually re-check

### Network Issues

- Retry logic handles transient failures
- Permanent failures are detected
- Status updates appropriately

## Monitoring

### Track Auto-Verification

```sql
-- Links currently being verified
SELECT COUNT(*) FROM links WHERE status = 'checking';

-- Average verification time
SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)))
FROM links
WHERE status != 'checking';

-- Failed verifications (still checking after 1 hour)
SELECT * FROM links
WHERE status = 'checking'
AND created_at < NOW() - INTERVAL '1 hour';
```

### Logs to Monitor

- `[Auto-verify]` prefixed logs
- Completion rates
- Failure patterns
- Average check times

## Best Practices

### For Single Links

1. Show "Checking..." status immediately
2. Use Supabase Realtime to update UI
3. Provide manual re-check button
4. Show error messages if verification fails

### For Bulk Import

1. Show progress indicator
2. Display verification count (e.g., "25/50 verified")
3. Allow users to navigate away
4. Send notification when complete (optional)

### For Developers

1. Monitor verification logs
2. Track failure rates
3. Adjust rate limiting if needed
4. Consider adding verification queue for scale

## Comparison: With vs Without Auto-Verification

### Without Auto-Verification

```
Add link → Save to DB → Status: "checking"
           ↓
    Wait for scheduled check (hours/days)
           ↓
    Status updates eventually
```

**Issues:**
- Long wait times
- User uncertainty
- Broken links not caught early
- Poor user experience

### With Auto-Verification

```
Add link → Save to DB → Immediate check → Status: "active"
                          (seconds)
```

**Benefits:**
- Instant feedback
- Catch issues early
- Better UX
- Increased confidence

## Future Enhancements

Potential improvements:

- [ ] Parallel bulk verification (with concurrency limits)
- [ ] Priority queue for user-triggered checks
- [ ] Verification webhooks/callbacks
- [ ] Real-time progress updates via WebSocket
- [ ] Batch verification API endpoint
- [ ] Configurable verification delay
- [ ] Verification status in UI with progress bar

## Integration with Other Features

### Works With:

- **Retry Logic**: Uses retry mechanism automatically
- **Status Updates**: Updates status via standard logic
- **Check History**: Creates first check record
- **Notifications**: Can trigger if link is broken
- **Scheduled Checks**: Complements (not replaces) scheduled checks

### Example Integration

```typescript
// When link is created
const link = await createLink(data);

// Auto-verification happens automatically
// ✅ Link is checked
// ✅ Status is updated
// ✅ First check record is created
// ✅ If broken, notification can be triggered

// User sees updated status immediately
```

## Troubleshooting

### Links Stuck in "Checking" Status

**Possible causes:**
- Verification failed silently
- Background process crashed
- Database update failed

**Solution:**
- Check logs for errors
- Manually trigger re-check
- Run scheduled check
- Check database connection

### Verification Taking Too Long

**Possible causes:**
- Slow target servers
- Network issues
- Too many retries

**Solution:**
- Monitor average check times
- Adjust timeout settings
- Reduce retry attempts
- Implement timeout alerts

## Configuration

Currently no configuration needed. Future options:

```typescript
// Potential config
const AUTO_VERIFY_CONFIG = {
  enabled: true,
  bulkDelay: 200,        // ms between bulk checks
  maxRetries: 3,
  timeout: 10000,        // 10 seconds
};
```

## Summary

Automatic verification provides:
- ✅ Immediate feedback on new links
- ✅ Better user experience
- ✅ Early problem detection
- ✅ Non-blocking background processing
- ✅ Seamless integration with retry logic
- ✅ Real-time status updates

This feature significantly improves the user experience by providing instant validation of newly added links.
