-- ============================================
-- PERFORMANCE OPTIMIZATION
-- Steps 60-65 from link_checking_plan.md
-- ============================================

-- Step 60: Add database index on last_checked_at
-- This speeds up queries that fetch links needing checks
CREATE INDEX IF NOT EXISTS idx_links_last_checked_at
ON links(last_checked_at DESC NULLS FIRST);

-- Step 61: Add composite index on user_id + status
-- This speeds up queries that filter links by user and status
CREATE INDEX IF NOT EXISTS idx_links_user_status
ON links(user_id, status);

-- Additional useful indexes
-- Index for finding links by workspace
CREATE INDEX IF NOT EXISTS idx_links_workspace_id
ON links(workspace_id) WHERE workspace_id IS NOT NULL;

-- Index for finding links that need checking (combination of user, last_checked, and status)
CREATE INDEX IF NOT EXISTS idx_links_needs_check
ON links(user_id, last_checked_at, status)
WHERE status IN ('active', 'broken', 'warning');

-- Index for notifications by user and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
ON notifications(user_id, is_read, created_at DESC);

-- Index for recent notifications (for rate limiting)
CREATE INDEX IF NOT EXISTS idx_notifications_link_type_created
ON notifications(link_id, type, created_at DESC);

-- Composite index for link_checks to speed up history queries
CREATE INDEX IF NOT EXISTS idx_link_checks_link_checked
ON link_checks(link_id, checked_at DESC);

-- Step 62: Optimize user_settings queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id
ON user_settings(user_id);

-- ============================================
-- QUERY OPTIMIZATION VIEWS (Step 65)
-- ============================================

-- View for links needing checks with user plan info
CREATE OR REPLACE VIEW links_needing_check AS
SELECT
  l.id,
  l.user_id,
  l.url,
  l.name,
  l.status,
  l.last_checked_at,
  l.created_at,
  us.plan,
  us.notification_preferences,
  CASE
    WHEN us.plan = 'free' THEN INTERVAL '168 hours'
    WHEN us.plan = 'basic' THEN INTERVAL '24 hours'
    WHEN us.plan = 'pro' THEN INTERVAL '12 hours'
    WHEN us.plan = 'agency' THEN INTERVAL '6 hours'
    ELSE INTERVAL '24 hours'
  END as check_interval,
  CASE
    WHEN l.last_checked_at IS NULL THEN true
    WHEN us.plan = 'free' AND l.last_checked_at < NOW() - INTERVAL '168 hours' THEN true
    WHEN us.plan = 'basic' AND l.last_checked_at < NOW() - INTERVAL '24 hours' THEN true
    WHEN us.plan = 'pro' AND l.last_checked_at < NOW() - INTERVAL '12 hours' THEN true
    WHEN us.plan = 'agency' AND l.last_checked_at < NOW() - INTERVAL '6 hours' THEN true
    ELSE false
  END as needs_check
FROM links l
LEFT JOIN user_settings us ON l.user_id = us.user_id
WHERE l.status IN ('active', 'broken', 'warning', 'checking');

-- View for link check statistics
CREATE OR REPLACE VIEW link_check_stats AS
SELECT
  l.id as link_id,
  l.user_id,
  l.url,
  l.name,
  l.status,
  COUNT(lc.id) as total_checks,
  COUNT(CASE WHEN lc.status_code >= 200 AND lc.status_code < 400 THEN 1 END) as successful_checks,
  COUNT(CASE WHEN lc.status_code >= 400 OR lc.status_code IS NULL THEN 1 END) as failed_checks,
  AVG(lc.response_time_ms)::INTEGER as avg_response_time,
  MAX(lc.checked_at) as last_checked_at,
  ROUND(
    (COUNT(CASE WHEN lc.status_code >= 200 AND lc.status_code < 400 THEN 1 END)::DECIMAL /
     NULLIF(COUNT(lc.id), 0) * 100), 2
  ) as uptime_percentage
FROM links l
LEFT JOIN link_checks lc ON l.id = lc.link_id
GROUP BY l.id, l.user_id, l.url, l.name, l.status;

-- ============================================
-- VACUUM AND ANALYZE (Step 63)
-- ============================================

-- Analyze tables to update statistics for query planner
ANALYZE links;
ANALYZE link_checks;
ANALYZE notifications;
ANALYZE user_settings;

-- ============================================
-- MONITORING QUERIES
-- ============================================

-- Query to check index usage
-- Run this periodically to ensure indexes are being used:
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Query to find slow queries (for monitoring)
-- SELECT
--   query,
--   calls,
--   total_time,
--   mean_time,
--   max_time
-- FROM pg_stat_statements
-- WHERE query LIKE '%links%' OR query LIKE '%link_checks%'
-- ORDER BY mean_time DESC
-- LIMIT 20;

-- ============================================
-- PARTITIONING SETUP (Future optimization)
-- ============================================

-- For very large datasets, consider partitioning link_checks by date
-- Example (commented out, implement when needed):
--
-- CREATE TABLE link_checks_2024 PARTITION OF link_checks
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
--
-- CREATE TABLE link_checks_2025 PARTITION OF link_checks
-- FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON INDEX idx_links_last_checked_at IS 'Optimizes queries fetching links that need checking';
COMMENT ON INDEX idx_links_user_status IS 'Optimizes user dashboard queries filtering by status';
COMMENT ON INDEX idx_links_needs_check IS 'Optimizes cron job queries for links needing checks';
COMMENT ON INDEX idx_notifications_user_read IS 'Optimizes notification list queries';
COMMENT ON INDEX idx_link_checks_link_checked IS 'Optimizes link history queries';

COMMENT ON VIEW links_needing_check IS 'Efficiently finds links that need checking based on user plan';
COMMENT ON VIEW link_check_stats IS 'Provides aggregated statistics for each link';
