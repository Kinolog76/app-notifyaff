-- Add workspace_id column to links table with ON DELETE SET NULL
-- This ensures links are preserved when their workspace is deleted

-- Add the column if it doesn't exist
ALTER TABLE links
ADD COLUMN IF NOT EXISTS workspace_id UUID;

-- Add foreign key constraint that sets workspace_id to NULL when workspace is deleted
-- Drop existing constraint if it exists
ALTER TABLE links
DROP CONSTRAINT IF EXISTS links_workspace_id_fkey;

-- Add new constraint with ON DELETE SET NULL
ALTER TABLE links
ADD CONSTRAINT links_workspace_id_fkey
FOREIGN KEY (workspace_id)
REFERENCES workspaces(id)
ON DELETE SET NULL;

-- Create index for better query performance when filtering by workspace
CREATE INDEX IF NOT EXISTS idx_links_workspace_id ON links(workspace_id);

-- Create index for queries that need to find links without a workspace
CREATE INDEX IF NOT EXISTS idx_links_no_workspace ON links(user_id) WHERE workspace_id IS NULL;
