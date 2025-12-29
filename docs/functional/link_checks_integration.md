# Link Checker ↔ link_checks Table Integration Plan

## Phase 1: Database Functions

1. Create Supabase client helper in `/lib/supabase/client.ts`
2. Create `/lib/supabase/link-checks.ts` for DB operations
3. Write `insertLinkCheck()` function
4. Write `getLinkCheckHistory()` function
5. Write `getLatestLinkCheck()` function
6. Write `getCheckStats()` function (avg response time, success rate)

## Phase 2: Link Checker Integration

7. Import Supabase client in `/lib/link-checker.ts`
8. After successful check, call `insertLinkCheck()`
9. Pass link_id to checker function
10. Store status_code from response
11. Store response_time_ms (Date.now() difference)
12. Store redirect_chain array if redirects occurred
13. Store error_message if check failed
14. Handle database insert errors gracefully

## Phase 3: Link Status Update

15. Create `/lib/link-status.ts` helper
16. Write `determineStatus()` function (200 = active, 404 = broken, etc.)
17. After inserting check, update `links` table status
18. Update `links.last_checked_at` timestamp
19. Use Supabase `.update()` with link_id
20. Handle concurrent updates (optimistic locking)

## Phase 4: Manual Check Endpoint

21. Update `/api/links/[id]/check` route
22. Get link from database by ID
23. Verify user owns link (RLS handles this)
24. Call link-checker function with link_id
25. Checker saves to link_checks automatically
26. Return check result + updated link status
27. Frontend refreshes link data

## Phase 5: Scheduled Checks Integration

28. Update `/api/cron/check-links` route
29. Fetch links that need checking with their IDs
30. For each link, call checker with link_id
31. Checker automatically saves to link_checks
32. Batch process: check 50 links at a time
33. Log summary (X checked, Y broken, Z errors)

## Phase 6: Check History Display

34. Create `/components/LinkCheckHistory.tsx` component
35. Fetch check history using `getLinkCheckHistory(link_id)`
36. Display table with columns: Time, Status, Response Time, Error
37. Add color coding (green = 200, red = 404/500)
38. Show redirect chain if exists
39. Add "View Details" modal for full check data
40. Paginate if >100 checks

## Phase 7: Status Timeline

41. Create `/components/StatusTimeline.tsx` component
42. Fetch checks ordered by checked_at DESC
43. Group by status changes only
44. Display timeline: "Active → Broken → Active"
45. Show duration in each status
46. Highlight when link first broke
47. Add timestamp labels

## Phase 8: Response Time Chart

48. Create `/components/ResponseTimeChart.tsx`
49. Fetch last 30 checks for link
50. Extract response_time_ms values
51. Use Recharts library to display line chart
52. Show average response time
53. Highlight slow responses (>2000ms)
54. Add trend line

## Phase 9: Notification Triggers

55. After check saved, query if status changed
56. Compare current status with previous check status
57. If changed from "active" to "broken", trigger notification
58. Check if notification already sent today (avoid spam)
59. Insert into notifications table
60. Call email sending function

## Phase 10: Performance Optimization

61. Add database index on link_checks(link_id, checked_at)
62. Limit history queries to last 100 checks
63. Use Supabase `.select('*').limit(100)`
64. Cache check stats for 5 minutes
65. Use Supabase realtime subscriptions for live updates
66. Implement pagination for large check histories

## Phase 11: Error Handling

67. Wrap all DB operations in try-catch
68. Log failed insertions to error tracking (Sentry)
69. If insert fails, don't block checker (continue)
70. Store failed checks in fallback queue
71. Retry failed inserts later
72. Alert admin if DB connection fails

## Phase 12: Data Cleanup

73. Create cleanup job for old checks (>90 days)
74. Schedule weekly cleanup cron job
75. Delete checks older than retention period (by plan)
76. Free plan: 30 days, Basic: 90 days, Pro: 1 year, Agency: unlimited
77. Keep at least last 10 checks per link

## Phase 13: Testing

78. Test manual check saves to link_checks
79. Test scheduled check saves to link_checks
80. Test check history display shows correct data
81. Test redirect_chain JSON parsing
82. Test error_message display
83. Test status updates after check
84. Test notification triggers on status change

## Phase 14: Admin Dashboard

85. Create admin view of all checks
86. Display total checks today/week/month
87. Show average response times across all links
88. Display most frequently broken links
89. Show checker system health metrics
90. Add retry queue monitoring

## Code Structure Example

```typescript
// /lib/link-checker.ts
export async function checkLink(linkId: string, url: string) {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(url, { 
      maxRedirects: 5,
      timeout: 10000 
    });
    
    const responseTime = Date.now() - startTime;
    
    // Save check result
    await insertLinkCheck({
      link_id: linkId,
      status_code: response.status,
      response_time_ms: responseTime,
      redirect_chain: response.request._redirectable._redirects || [],
      error_message: null,
    });
    
    // Update link status
    await updateLinkStatus(linkId, determineStatus(response.status));
    
    return { success: true, status: response.status };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Save failed check
    await insertLinkCheck({
      link_id: linkId,
      status_code: error.response?.status || null,
      response_time_ms: responseTime,
      redirect_chain: null,
      error_message: error.message,
    });
    
    // Update link status to broken
    await updateLinkStatus(linkId, 'broken');
    
    return { success: false, error: error.message };
  }
}
```

```typescript
// /lib/supabase/link-checks.ts
export async function insertLinkCheck(data: LinkCheckInsert) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('link_checks')
    .insert(data);
  
  if (error) {
    console.error('Failed to insert link check:', error);
    // Don't throw - log and continue
  }
}

export async function getLinkCheckHistory(linkId: string, limit = 100) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('link_checks')
    .select('*')
    .eq('link_id', linkId)
    .order('checked_at', { ascending: false })
    .limit(limit);
  
  return data || [];
}
```