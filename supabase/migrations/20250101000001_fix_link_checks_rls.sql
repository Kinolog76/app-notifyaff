-- ============================================
-- FIX LINK CHECKS RLS POLICIES
-- Allow authenticated users to insert their own link checks
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own link checks" ON link_checks;
DROP POLICY IF EXISTS "Service role can insert checks" ON link_checks;
DROP POLICY IF EXISTS "Users can insert own link checks" ON link_checks;

-- Policy: Users can view checks for their own links
CREATE POLICY "Users can view own link checks"
  ON link_checks FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert checks for their own links
CREATE POLICY "Users can insert own link checks"
  ON link_checks FOR INSERT
  WITH CHECK (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );

-- Policy: Allow service role to insert checks (for cron jobs)
CREATE POLICY "Service role can manage all checks"
  ON link_checks FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- FIX NOTIFICATIONS RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can insert their own notifications
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Service role can manage all notifications
CREATE POLICY "Service role can manage all notifications"
  ON notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Users can view own link checks" ON link_checks IS 'Users can view checks for their own links';
COMMENT ON POLICY "Users can insert own link checks" ON link_checks IS 'Users can insert checks for their own links via API';
COMMENT ON POLICY "Service role can manage all checks" ON link_checks IS 'Service role can bypass RLS for cron jobs';
