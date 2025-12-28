```sql
-- ============================================
-- LINK CHECKS TABLE
-- History of all link health checks
-- ============================================

CREATE TABLE link_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  redirect_chain JSONB,
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_link_checks_link_id ON link_checks(link_id);
CREATE INDEX idx_link_checks_checked_at ON link_checks(checked_at DESC);

-- Row Level Security
ALTER TABLE link_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own link checks"
  ON link_checks FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );
```