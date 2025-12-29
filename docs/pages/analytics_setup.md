# Analytics Page Setup Guide

## Overview
This guide explains how to set up and use the Analytics page in LinkGuardian.

## Files Created

### 1. **Database Functions** (`/supabase/migrations/analytics_functions.sql`)
SQL functions and indexes for analytics queries:
- `get_link_health_over_time()` - Track link health trends
- `get_response_time_trends()` - Monitor response time performance
- `get_top_broken_links()` - Identify most problematic links
- `get_slowest_links()` - Find performance bottlenecks
- `get_category_performance()` - Analyze links by category
- Database indexes for optimal performance

### 2. **Analytics Library** (`/lib/analytics/`)
- `queries.ts` - TypeScript functions to call Supabase RPC functions
- `calculations.ts` - Helper functions for formatting and calculations
- `export.ts` - CSV export functionality

### 3. **React Components** (`/components/analytics/`)
- `OverviewStats.tsx` - Three stat cards (Total Checks, Avg Response Time, Uptime Rate)
- `LinkHealthChart.tsx` - Line chart showing active/broken/warning links over time
- `ResponseTimeChart.tsx` - Area chart for response time trends
- `TopBrokenLinks.tsx` - List of most frequently broken links
- `SlowestLinks.tsx` - List of slowest responding links
- `StatusPieChart.tsx` - Pie chart showing link status distribution
- `CategoryTable.tsx` - Sortable table of category performance
- `DateRangePicker.tsx` - Date range selector (7/30/90 days)
- `ExportButton.tsx` - CSV export button

### 4. **Analytics Page** (`/app/dashboard/analytics/page.tsx`)
Main analytics dashboard page that integrates all components.

## Setup Instructions

### Step 1: Apply Database Migrations

Run the SQL migration to create the required functions and indexes:

```bash
npx supabase db push
```

Or manually run the SQL file in your Supabase dashboard:
1. Go to the SQL Editor in Supabase Dashboard
2. Paste the contents of `supabase/migrations/analytics_functions.sql`
3. Execute the SQL

### Step 2: Verify Installation

All required dependencies are already installed:
- ✅ `recharts` - Chart library
- ✅ `date-fns` - Date formatting

### Step 3: Access the Analytics Page

Navigate to: [http://localhost:3000/dashboard/analytics](http://localhost:3000/dashboard/analytics)

The Analytics link is already added to the dashboard sidebar.

## Features

### 1. Overview Statistics
Three key metrics cards showing:
- **Total Checks**: Number of link checks performed in the date range
- **Average Response Time**: Mean response time across all successful checks
- **Uptime Rate**: Percentage of successful checks (200 status codes)

### 2. Date Range Filtering
Select different time periods:
- Last 7 days
- Last 30 days (default)
- Last 90 days

All charts and metrics update based on the selected range.

### 3. Charts and Visualizations
- **Link Health Over Time**: Line chart showing trends in active, broken, and warning links
- **Response Time Trends**: Area chart showing min, average, and max response times
- **Link Status Distribution**: Pie chart showing the breakdown of link statuses

### 4. Data Tables
- **Top Broken Links**: Links with the most failures, including failure count and last broken date
- **Slowest Links**: Links with highest average response times, with visual progress bars
- **Category Performance**: Sortable table showing metrics by category

### 5. CSV Export
Export all analytics data to CSV format with a single click.

## Data Requirements

For the analytics page to show meaningful data, you need:
1. **Links**: Add affiliate links to track
2. **Link Checks**: Run link checks (automatic or manual)
3. **Historical Data**: At least a few days of check history for trend analysis

## Performance Optimizations

The following database indexes are created for optimal performance:
- `idx_link_checks_link_id_checked_at` - For time-based queries
- `idx_link_checks_status_code_checked_at` - For status filtering
- `idx_link_checks_checked_at` - For date range queries
- `idx_links_user_id_status` - For user and status filtering

## Troubleshooting

### No Data Showing
1. Verify that links have been added to your account
2. Check that link checks have been performed
3. Ensure the date range includes dates when checks were performed

### Slow Performance
1. Verify database indexes are created
2. Check the number of records in `link_checks` table
3. Consider reducing the date range for very large datasets

### RPC Function Errors
1. Verify that the SQL migration has been applied
2. Check Supabase logs for function execution errors
3. Ensure Row Level Security (RLS) policies allow access to required tables

## Future Enhancements

Potential features for future releases:
- Real-time updates using Supabase Realtime
- Custom date range picker (calendar)
- Comparison between time periods
- Anomaly detection
- Scheduled email reports
- Advanced filtering options
