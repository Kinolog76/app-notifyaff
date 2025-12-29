-- ============================================
-- LINK CHECKS INTEGRATION MIGRATION
-- Creates link_checks table if not exists
-- ============================================

-- Ensure uuid extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create link_checks table
CREATE TABLE IF NOT EXISTS link_checks (
  -- Unique ID
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link being checked (cascades on delete)
  link_id UUID REFERENCES links(id) ON DELETE CASCADE NOT NULL,

  -- HTTP status code (200, 404, 500, etc.)
  status_code INTEGER,

  -- Response time in milliseconds
  response_time_ms INTEGER,

  -- Error message if check failed
  error_message TEXT,

  -- JSON array of redirect chain
  redirect_chain JSONB,

  -- When the check was performed
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_link_checks_link_id ON link_checks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_checks_checked_at ON link_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_checks_link_checked ON link_checks(link_id, checked_at DESC);

-- Enable Row Level Security
ALTER TABLE link_checks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view checks for their own links
DROP POLICY IF EXISTS "Users can view own link checks" ON link_checks;
CREATE POLICY "Users can view own link checks"
  ON link_checks FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert checks for their own links
DROP POLICY IF EXISTS "Users can insert own link checks" ON link_checks;
CREATE POLICY "Users can insert own link checks"
  ON link_checks FOR INSERT
  WITH CHECK (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role can manage all checks (for cron jobs)
DROP POLICY IF EXISTS "Service role can manage all checks" ON link_checks;
CREATE POLICY "Service role can manage all checks"
  ON link_checks FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Ensure links table has required columns
DO $$
BEGIN
  -- Add status column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'status'
  ) THEN
    ALTER TABLE links ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  -- Add last_checked_at column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'last_checked_at'
  ) THEN
    ALTER TABLE links ADD COLUMN last_checked_at TIMESTAMP;
  END IF;

  -- Add tracking_enabled column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'tracking_enabled'
  ) THEN
    ALTER TABLE links ADD COLUMN tracking_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create index on last_checked_at for cron queries
CREATE INDEX IF NOT EXISTS idx_links_last_checked_at
  ON links(last_checked_at DESC NULLS FIRST);

-- Create index on tracking_enabled for cron queries
CREATE INDEX IF NOT EXISTS idx_links_tracking_enabled
  ON links(tracking_enabled) WHERE tracking_enabled = true;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

-- Ensure notifications table exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_link_id ON notifications(link_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_link_type_created ON notifications(link_id, type, created_at DESC);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can update their own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can insert their own notifications
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Service role can manage all notifications
DROP POLICY IF EXISTS "Service role can manage all notifications" ON notifications;
CREATE POLICY "Service role can manage all notifications"
  ON notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE link_checks IS 'Stores history of link health checks';
COMMENT ON TABLE notifications IS 'Stores user notifications for link status changes';
COMMENT ON COLUMN link_checks.status_code IS 'HTTP status code from the check (200, 404, etc.)';
COMMENT ON COLUMN link_checks.response_time_ms IS 'Time taken to receive response in milliseconds';
COMMENT ON COLUMN link_checks.redirect_chain IS 'Array of URLs if redirects occurred';
COMMENT ON COLUMN links.status IS 'Current link status: active, broken, warning, pending';
COMMENT ON COLUMN links.last_checked_at IS 'Timestamp of last automated check';
COMMENT ON COLUMN links.tracking_enabled IS 'Whether automated checking is enabled for this link';
