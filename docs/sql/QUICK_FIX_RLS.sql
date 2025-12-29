-- ============================================
-- QUICK FIX: Run this in Supabase SQL Editor
-- This fixes the RLS policy error immediately
-- ============================================

-- Fix link_checks policies
DROP POLICY IF EXISTS "Users can view own link checks" ON link_checks;
DROP POLICY IF EXISTS "Service role can insert checks" ON link_checks;
DROP POLICY IF EXISTS "Users can insert own link checks" ON link_checks;
DROP POLICY IF EXISTS "Service role can manage all checks" ON link_checks;

-- Users can view checks for their links
CREATE POLICY "Users can view own link checks"
  ON link_checks FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );

-- Users can insert checks for their links
CREATE POLICY "Users can insert own link checks"
  ON link_checks FOR INSERT
  WITH CHECK (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );

-- Service role can do everything (for cron jobs)
CREATE POLICY "Service role can manage all checks"
  ON link_checks FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Fix notifications policies (bonus)
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can manage all notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all notifications"
  ON notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Verify policies are correct
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('link_checks', 'notifications')
ORDER BY tablename, policyname;
