-- Analytics RPC Functions for LinkGuardian

-- Function: Get link health over time
CREATE OR REPLACE FUNCTION get_link_health_over_time(
  p_user_id UUID,
  p_from TIMESTAMP,
  p_to TIMESTAMP
)
RETURNS TABLE (
  date DATE,
  active_count BIGINT,
  broken_count BIGINT,
  warning_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(lc.checked_at) as date,
    COUNT(*) FILTER (WHERE lc.status_code = 200) as active_count,
    COUNT(*) FILTER (WHERE lc.status_code >= 400 AND lc.status_code < 500) as broken_count,
    COUNT(*) FILTER (WHERE lc.status_code >= 500) as warning_count
  FROM link_checks lc
  INNER JOIN links l ON l.id = lc.link_id
  WHERE l.user_id = p_user_id
    AND lc.checked_at >= p_from
    AND lc.checked_at <= p_to
  GROUP BY DATE(lc.checked_at)
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get response time trends
CREATE OR REPLACE FUNCTION get_response_time_trends(
  p_user_id UUID,
  p_from TIMESTAMP,
  p_to TIMESTAMP
)
RETURNS TABLE (
  date DATE,
  avg_response NUMERIC,
  min_response INTEGER,
  max_response INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(lc.checked_at) as date,
    AVG(lc.response_time_ms)::NUMERIC as avg_response,
    MIN(lc.response_time_ms) as min_response,
    MAX(lc.response_time_ms) as max_response
  FROM link_checks lc
  INNER JOIN links l ON l.id = lc.link_id
  WHERE l.user_id = p_user_id
    AND lc.checked_at >= p_from
    AND lc.checked_at <= p_to
    AND lc.status_code = 200
  GROUP BY DATE(lc.checked_at)
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get top broken links
CREATE OR REPLACE FUNCTION get_top_broken_links(
  p_user_id UUID,
  p_from TIMESTAMP,
  p_to TIMESTAMP,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  category TEXT,
  broken_count BIGINT,
  last_broken TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.url,
    l.category,
    COUNT(*)::BIGINT as broken_count,
    MAX(lc.checked_at) as last_broken
  FROM links l
  INNER JOIN link_checks lc ON lc.link_id = l.id
  WHERE l.user_id = p_user_id
    AND lc.status_code >= 400
    AND lc.checked_at >= p_from
    AND lc.checked_at <= p_to
  GROUP BY l.id, l.url, l.category
  ORDER BY broken_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get slowest links
CREATE OR REPLACE FUNCTION get_slowest_links(
  p_user_id UUID,
  p_from TIMESTAMP,
  p_to TIMESTAMP,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  category TEXT,
  avg_response NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.url,
    l.category,
    AVG(lc.response_time_ms)::NUMERIC as avg_response
  FROM links l
  INNER JOIN link_checks lc ON lc.link_id = l.id
  WHERE l.user_id = p_user_id
    AND lc.checked_at >= p_from
    AND lc.checked_at <= p_to
    AND lc.status_code = 200
  GROUP BY l.id, l.url, l.category
  HAVING AVG(lc.response_time_ms) > 1000
  ORDER BY avg_response DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get category performance
CREATE OR REPLACE FUNCTION get_category_performance(
  p_user_id UUID
)
RETURNS TABLE (
  category TEXT,
  total_links BIGINT,
  active_links BIGINT,
  broken_links BIGINT,
  avg_response NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(l.category, 'Uncategorized') as category,
    COUNT(l.id)::BIGINT as total_links,
    COUNT(*) FILTER (WHERE l.status = 'active')::BIGINT as active_links,
    COUNT(*) FILTER (WHERE l.status = 'broken')::BIGINT as broken_links,
    COALESCE(AVG(lc.response_time_ms), 0)::NUMERIC as avg_response
  FROM links l
  LEFT JOIN link_checks lc ON lc.link_id = l.id
    AND lc.checked_at >= NOW() - INTERVAL '7 days'
    AND lc.status_code = 200
  WHERE l.user_id = p_user_id
  GROUP BY category
  ORDER BY total_links DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_link_checks_link_id_checked_at
  ON link_checks(link_id, checked_at);

CREATE INDEX IF NOT EXISTS idx_link_checks_status_code_checked_at
  ON link_checks(status_code, checked_at);

CREATE INDEX IF NOT EXISTS idx_link_checks_checked_at
  ON link_checks(checked_at);

CREATE INDEX IF NOT EXISTS idx_links_user_id_status
  ON links(user_id, status);
