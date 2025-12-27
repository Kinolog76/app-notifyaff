-- Add tracking_enabled column to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT true;

-- Create index for better query performance when filtering by tracking_enabled
CREATE INDEX IF NOT EXISTS idx_links_tracking_enabled ON links(tracking_enabled);

-- Update existing links to have tracking enabled by default
UPDATE links SET tracking_enabled = true WHERE tracking_enabled IS NULL;
