-- Fix get_category_performance function
DROP FUNCTION IF EXISTS get_category_performance(UUID);

CREATE OR REPLACE FUNCTION get_category_performance(
  p_user_id UUID
)
RETURNS TABLE (
  category TEXT,
  total_links BIGINT,
  active_links BIGINT,
  broken_links BIGINT,
  avg_response NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH recent_checks AS (
    SELECT
      link_id,
      AVG(response_time_ms) as avg_response_time
    FROM link_checks
    WHERE checked_at >= NOW() - INTERVAL '7 days'
      AND status_code = 200
    GROUP BY link_id
  )
  SELECT
    COALESCE(l.category, 'Uncategorized')::TEXT as category,
    COUNT(l.id)::BIGINT as total_links,
    COUNT(*) FILTER (WHERE l.status = 'active')::BIGINT as active_links,
    COUNT(*) FILTER (WHERE l.status = 'broken')::BIGINT as broken_links,
    COALESCE(AVG(rc.avg_response_time), 0)::NUMERIC as avg_response
  FROM links l
  LEFT JOIN recent_checks rc ON rc.link_id = l.id
  WHERE l.user_id = p_user_id
  GROUP BY COALESCE(l.category, 'Uncategorized')
  ORDER BY total_links DESC;
END;
$$;
