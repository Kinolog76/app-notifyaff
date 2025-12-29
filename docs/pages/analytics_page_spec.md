# Analytics Page - Technical Specification

## Overview
Analytics page provides insights into link health, performance trends, and system usage using existing database tables (`links`, `link_checks`, `notifications`).

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        Analytics                             │
├─────────────────────────────────────────────────────────────┤
│  [Date Range Picker]  [Export CSV]                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Total       │  │  Avg Response│  │  Uptime      │      │
│  │  Checks      │  │  Time        │  │  Rate        │      │
│  │  1,234       │  │  456ms       │  │  98.5%       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Link Health Over Time (Chart)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Line chart: Active/Broken/Warning links by date]  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Response Time Trends (Chart)                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Line chart: Average response time over time]      │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ Top Broken Links    │  │ Slowest Links               │  │
│  │ 1. amazon.com/...   │  │ 1. site.com (2.3s)          │  │
│  │ 2. shop.io/...      │  │ 2. slow.io (1.8s)           │  │
│  │ 3. brand.com/...    │  │ 3. example.com (1.5s)       │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Link Status Distribution (Pie Chart)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Pie: Active 85%, Broken 10%, Warning 5%]          │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Category Performance (Table)                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Category  | Total | Active | Broken | Avg Response │   │
│  │ Amazon    |   45  |   43   |   2    |    340ms     │   │
│  │ Fashion   |   23  |   20   |   3    |    520ms     │   │
│  │ Beauty    |   18  |   18   |   0    |    280ms     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Sources (Existing Tables)

### From `links` table:
- Total links count
- Links by status (active/broken/warning)
- Links by category
- Last checked timestamps

### From `link_checks` table:
- Check history
- Response times
- Status codes
- Error messages
- Redirect chains
- Check timestamps

### From `notifications` table:
- Notification count
- Alert frequency
- Most alerted links

---

## Metrics & Calculations

### 1. Overview Stats Cards

**Total Checks (Last 30 Days)**
```sql
SELECT COUNT(*) 
FROM link_checks 
WHERE user_id IN (SELECT id FROM links WHERE user_id = auth.uid())
  AND checked_at >= NOW() - INTERVAL '30 days'
```

**Average Response Time**
```sql
SELECT AVG(response_time_ms) 
FROM link_checks 
WHERE link_id IN (SELECT id FROM links WHERE user_id = auth.uid())
  AND checked_at >= NOW() - INTERVAL '30 days'
  AND status_code = 200
```

**Uptime Rate (% of successful checks)**
```sql
SELECT 
  (COUNT(*) FILTER (WHERE status_code = 200) * 100.0 / COUNT(*))::DECIMAL(5,2)
FROM link_checks 
WHERE link_id IN (SELECT id FROM links WHERE user_id = auth.uid())
  AND checked_at >= NOW() - INTERVAL '30 days'
```

---

### 2. Link Health Over Time Chart

**Data Query:**
```sql
SELECT 
  DATE(checked_at) as date,
  COUNT(*) FILTER (WHERE status_code = 200) as active_count,
  COUNT(*) FILTER (WHERE status_code >= 400 AND status_code < 500) as broken_count,
  COUNT(*) FILTER (WHERE status_code >= 500) as warning_count
FROM link_checks
WHERE link_id IN (SELECT id FROM links WHERE user_id = auth.uid())
  AND checked_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(checked_at)
ORDER BY date ASC
```

**Chart Type:** Line chart (Recharts `<LineChart>`)
- X-axis: Date
- Y-axis: Count
- Three lines: Active (green), Broken (red), Warning (yellow)

---

### 3. Response Time Trends Chart

**Data Query:**
```sql
SELECT 
  DATE(checked_at) as date,
  AVG(response_time_ms) as avg_response,
  MIN(response_time_ms) as min_response,
  MAX(response_time_ms) as max_response
FROM link_checks
WHERE link_id IN (SELECT id FROM links WHERE user_id = auth.uid())
  AND checked_at >= NOW() - INTERVAL '30 days'
  AND status_code = 200
GROUP BY DATE(checked_at)
ORDER BY date ASC
```

**Chart Type:** Area chart (Recharts `<AreaChart>`)
- X-axis: Date
- Y-axis: Response time (ms)
- Show average with min/max range shading

---

### 4. Top Broken Links List

**Data Query:**
```sql
SELECT 
  l.id,
  l.url,
  l.category,
  COUNT(*) as broken_count,
  MAX(lc.checked_at) as last_broken
FROM links l
JOIN link_checks lc ON lc.link_id = l.id
WHERE l.user_id = auth.uid()
  AND lc.status_code >= 400
  AND lc.checked_at >= NOW() - INTERVAL '30 days'
GROUP BY l.id, l.url, l.category
ORDER BY broken_count DESC
LIMIT 10
```

**Display:**
- Table with columns: URL (truncated), Category, Failed Checks, Last Broken
- Click to view link details
- Red badge with failure count

---

### 5. Slowest Links List

**Data Query:**
```sql
SELECT 
  l.id,
  l.url,
  l.category,
  AVG(lc.response_time_ms) as avg_response
FROM links l
JOIN link_checks lc ON lc.link_id = l.id
WHERE l.user_id = auth.uid()
  AND lc.checked_at >= NOW() - INTERVAL '30 days'
  AND lc.status_code = 200
GROUP BY l.id, l.url, l.category
HAVING AVG(lc.response_time_ms) > 1000
ORDER BY avg_response DESC
LIMIT 10
```

**Display:**
- Table with columns: URL (truncated), Category, Avg Response Time
- Yellow/red color coding for slow links (>2000ms = red)
- Progress bar visual

---

### 6. Link Status Distribution Pie Chart

**Data Query:**
```sql
SELECT 
  status,
  COUNT(*) as count
FROM links
WHERE user_id = auth.uid()
GROUP BY status
```

**Chart Type:** Pie chart (Recharts `<PieChart>`)
- Colors: Active (green), Broken (red), Warning (yellow), Checking (gray)
- Show percentage labels
- Legend at bottom

---

### 7. Category Performance Table

**Data Query:**
```sql
SELECT 
  COALESCE(l.category, 'Uncategorized') as category,
  COUNT(l.id) as total_links,
  COUNT(*) FILTER (WHERE l.status = 'active') as active_links,
  COUNT(*) FILTER (WHERE l.status = 'broken') as broken_links,
  COALESCE(AVG(lc.response_time_ms)::INTEGER, 0) as avg_response
FROM links l
LEFT JOIN link_checks lc ON lc.link_id = l.id 
  AND lc.checked_at >= NOW() - INTERVAL '7 days'
  AND lc.status_code = 200
WHERE l.user_id = auth.uid()
GROUP BY category
ORDER BY total_links DESC
```

**Display:**
- Sortable table
- Columns: Category, Total, Active, Broken, Avg Response Time
- Health indicator (green/red dot)
- Click to filter main links list by category

---

### 8. Notification Analytics (Optional)

**Data Query:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as notification_count,
  type
FROM notifications
WHERE user_id = auth.uid()
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), type
ORDER BY date ASC
```

**Display:** Small bar chart showing notifications per day

---

## Features

### Date Range Picker
- Presets: Last 7 days, Last 30 days, Last 90 days, Custom
- Updates all charts and metrics
- Default: Last 30 days

### Export CSV
- Button to export analytics data
- Includes: All metrics, link performance, check history
- Filename: `linkguardian-analytics-{date}.csv`

### Real-time Updates
- Use Supabase realtime subscriptions
- Update stats when new checks complete
- Smooth chart transitions

### Loading States
- Skeleton loaders for all sections
- Progressive rendering (stats → charts → tables)

### Empty States
- "No data yet" message if no checks
- "Add links to see analytics" CTA

### Mobile Responsive
- Stack cards vertically on mobile
- Scrollable charts
- Simplified tables

---

## Technical Implementation

### File Structure
```
/app/analytics/
  page.tsx                 (Main analytics page)
  
/components/analytics/
  OverviewStats.tsx        (Stats cards)
  LinkHealthChart.tsx      (Health over time)
  ResponseTimeChart.tsx    (Response trends)
  TopBrokenLinks.tsx       (Broken links list)
  SlowestLinks.tsx         (Slow links list)
  StatusPieChart.tsx       (Status distribution)
  CategoryTable.tsx        (Category performance)
  DateRangePicker.tsx      (Date selector)
  ExportButton.tsx         (CSV export)

/lib/analytics/
  queries.ts               (All SQL queries)
  calculations.ts          (Metric calculations)
  export.ts                (CSV export logic)
```

### Dependencies
```json
{
  "recharts": "^2.10.0",
  "date-fns": "^3.0.0",
  "react-day-picker": "^8.10.0"
}
```

### API Routes
```
GET /api/analytics/overview?from={date}&to={date}
GET /api/analytics/health-chart?from={date}&to={date}
GET /api/analytics/response-chart?from={date}&to={date}
GET /api/analytics/top-broken?limit={number}
GET /api/analytics/slowest?limit={number}
GET /api/analytics/status-distribution
GET /api/analytics/category-performance
GET /api/analytics/export?from={date}&to={date}
```

---

## Performance Considerations

### Database Optimization
- Add indexes on `link_checks(link_id, checked_at)`
- Add indexes on `link_checks(status_code, checked_at)`
- Use materialized views for complex aggregations (future)

### Caching
- Cache analytics data for 5 minutes
- Use React Query for client-side caching
- Invalidate cache on new checks

### Pagination
- Limit queries to reasonable date ranges
- Paginate long lists (top broken, slowest)
- Lazy load chart data on scroll

---

## User Permissions

### By Plan
**Free Plan:**
- Last 7 days only
- Basic charts only
- No export

**Basic Plan ($12/mo):**
- Last 30 days
- All charts
- CSV export

**Pro Plan ($24/mo):**
- Last 90 days
- All features
- Advanced metrics

**Agency Plan ($79/mo):**
- Unlimited history
- All features
- Team analytics (future)

---

## Future Enhancements

### Phase 2
- Compare time periods (this month vs last month)
- Anomaly detection (unusual patterns)
- Predictive analytics (link likely to break)
- Email weekly/monthly reports

### Phase 3
- Custom dashboards
- Saved analytics views
- Scheduled reports
- Team performance comparison
- API endpoint analytics