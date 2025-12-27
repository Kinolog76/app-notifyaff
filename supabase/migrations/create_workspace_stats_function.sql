-- Create function to get workspace statistics
CREATE OR REPLACE FUNCTION get_workspace_stats(workspace_uuid UUID)
RETURNS TABLE (
  total_links INTEGER,
  active_links INTEGER,
  broken_links INTEGER,
  pending_links INTEGER,
  last_check_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_links,
    COUNT(*) FILTER (WHERE status = 'active')::INTEGER AS active_links,
    COUNT(*) FILTER (WHERE status = 'error')::INTEGER AS broken_links,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending_links,
    MAX(last_check_at) AS last_check_at
  FROM links
  WHERE workspace_id = workspace_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_workspace_stats(UUID) TO authenticated;
