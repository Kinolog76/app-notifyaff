-- ============================================
-- Migration: Add retry fields to link_checks table
-- ============================================

-- Add retry_count field to track number of retry attempts
ALTER TABLE link_checks
ADD COLUMN retry_count INTEGER DEFAULT 0;

-- Add confidence_score field (0-100) indicating how confident we are in the result
ALTER TABLE link_checks
ADD COLUMN confidence_score INTEGER DEFAULT 100;

-- Add retry_history field to store JSON array of retry attempts
ALTER TABLE link_checks
ADD COLUMN retry_history JSONB;

-- Add comments to document the new fields
COMMENT ON COLUMN link_checks.retry_count IS 'Number of retry attempts made before final result (0 = succeeded on first try)';
COMMENT ON COLUMN link_checks.confidence_score IS 'Confidence score (0-100) indicating reliability of the check result';
COMMENT ON COLUMN link_checks.retry_history IS 'JSON array containing details of each retry attempt';
