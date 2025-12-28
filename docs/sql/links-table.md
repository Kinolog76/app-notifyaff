```sql
-- Links table
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  name TEXT,
  url TEXT NOT NULL,
  short_url TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'checking', -- 'active', 'broken', 'warning', 'checking'
  last_checked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_workspace_id ON links(workspace_id);
CREATE INDEX idx_links_status ON links(status);
CREATE INDEX idx_links_no_workspace ON links(user_id) WHERE workspace_id IS NULL;

-- Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own links"
  ON links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links"
  ON links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links"
  ON links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
  ON links FOR DELETE
  USING (auth.uid() = user_id);
```