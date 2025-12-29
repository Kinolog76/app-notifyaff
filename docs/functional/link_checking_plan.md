# Link Checking System - Build Plan

## 1. Core Checker Function

1. Create `/lib/link-checker.ts` utility file
2. Install axios for HTTP requests
3. Implement basic HTTP GET request to URL
4. Add redirect following (follow up to 5 redirects)
5. Extract final destination URL
6. Capture status code (200, 404, 500, etc.)
7. Measure response time in milliseconds
8. Handle timeouts (set 10 second limit)
9. Catch and log errors (network, DNS, SSL)
10. Return structured result object

## 2. Check Results Storage

11. Create `link_checks` table insert function
12. Store check timestamp
13. Store status code
14. Store response time
15. Store redirect chain as JSON
16. Store error messages if failed
17. Link check to original link ID

## 3. Link Status Update Logic

18. Create status determination function
19. Mark as "active" if status 200
20. Mark as "broken" if status 404/410
21. Mark as "warning" if status 500/503
22. Mark as "checking" while in progress
23. Update `links` table status field
24. Update `last_checked_at` timestamp

## 4. Manual Check Endpoint

25. Create API route `/api/links/[id]/check`
26. Validate user owns the link
27. Call link checker function
28. Store results in database
29. Update link status
30. Return results to frontend
31. Add "Check Now" button in UI
32. Show loading state during check
33. Display check results
34. Handle errors gracefully

## 5. Scheduled Checking

35. Create `/api/cron/check-links` route
36. Add Vercel cron configuration
37. Fetch links that need checking (based on last_checked_at)
38. Filter by user plan (daily for basic, 2x/day for pro)
39. Process links in batches (50 at a time)
40. Implement queue system for large batches
41. Add rate limiting to avoid overwhelming servers
42. Log cron job execution

## 6. Retry Logic

43. Implement retry function (3 attempts)
44. Add exponential backoff (1s, 2s, 4s)
45. Only mark as broken after all retries fail
46. Store retry attempts in check record
47. Add confidence score (100% after 3 fails)

## 7. Status History

48. Create check history query function
49. Fetch last 10 checks for a link
50. Display timeline component in UI
51. Show status changes over time
52. Add chart for response time trends
53. Highlight when link broke

## 8. Notification Triggers

54. Create notification trigger function
55. Check if status changed from active to broken
56. Don't spam (max 1 notification per link per day)
57. Store notification in database
58. Trigger email send
59. Handle digest mode (batch notifications)

## 9. Performance Optimization

60. Add database index on `last_checked_at`
61. Add index on `user_id` + `status`
62. Implement connection pooling
63. Cache check results for 5 minutes
64. Use concurrent checking (Promise.all for batches)
65. Optimize query to fetch links needing checks

## 10. Monitoring & Debugging

66. Add logging for each check
67. Log failed checks with details
68. Create admin dashboard for check stats
69. Track average response times
70. Monitor check queue size
71. Set up alerts for checker failures
72. Add health check endpoint

## 11. Advanced Features (Optional)

73. Add headless browser option (Puppeteer)
74. Check JavaScript-heavy sites
75. Detect geo-blocking
76. Verify affiliate tags in URL
77. Check if product is in stock (Amazon)
78. Screenshot broken pages for debugging