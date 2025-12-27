```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name
  color TEXT DEFAULT '#3b82f6', -- hex color for visual distinction
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX idx_workspaces_is_default ON workspaces(user_id, is_default);

-- Ensure only one default workspace per user
CREATE UNIQUE INDEX idx_one_default_workspace 
ON workspaces(user_id) 
WHERE is_default = TRUE;
```

```sql
-- Add workspace_id column to existing links table (NULLABLE)
ALTER TABLE links 
ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- Index for faster queries (includes NULL values)
CREATE INDEX idx_links_workspace_id ON links(workspace_id);

-- Links without workspace will show in "Uncategorized" section
-- No automatic migration to default workspace
```

```sql
-- Function: Get workspace stats
CREATE OR REPLACE FUNCTION get_workspace_stats(workspace_uuid UUID)
RETURNS TABLE(
  total_links BIGINT,
  active_links BIGINT,
  broken_links BIGINT,
  warning_links BIGINT,
  last_check TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_links,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active_links,
    COUNT(*) FILTER (WHERE status = 'broken')::BIGINT as broken_links,
    COUNT(*) FILTER (WHERE status = 'warning')::BIGINT as warning_links,
    MAX(last_checked_at) as last_check
  FROM links
  WHERE workspace_id = workspace_uuid;
END;
$$ LANGUAGE plpgsql;
```

```js
// app/api/workspaces/route.ts
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const body = await req.json()
  const { name, description, icon, color } = body
  
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      user_id: session.user.id,
      name,
      description,
      icon,
      color,
    })
    .select()
    .single()
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  return Response.json(data)
}
```
```js
// app/api/workspaces/route.ts
export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Get workspaces with link counts
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select(`
      *,
      links:links(count)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  // Get count of uncategorized links
  const { count: uncategorizedCount } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })
    .is('workspace_id', null)
    .eq('user_id', session.user.id)
  
  // Fetch stats for each workspace
  const workspacesWithStats = await Promise.all(
    workspaces.map(async (workspace) => {
      const { data: stats } = await supabase
        .rpc('get_workspace_stats', { workspace_uuid: workspace.id })
        .single()
      
      return {
        ...workspace,
        stats,
      }
    })
  )
  
  return Response.json({
    workspaces: workspacesWithStats,
    uncategorized_count: uncategorizedCount || 0,
  })
}
```

```js
// app/api/workspaces/[id]/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await req.json()
  
  const { data, error } = await supabase
    .from('workspaces')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  return Response.json(data)
}
```

```js
// app/api/workspaces/[id]/route.ts
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Delete workspace
  // Links will have workspace_id set to NULL automatically (ON DELETE SET NULL)
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', params.id)
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  return Response.json({ 
    success: true,
    message: 'Workspace deleted. Links moved to uncategorized.'
  })
}
```

```js
// app/api/links/[id]/workspace/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { workspace_id } = await req.json()
  
  // Allow setting workspace_id to null for uncategorized
  const { data, error } = await supabase
    .from('links')
    .update({ workspace_id: workspace_id || null })
    .eq('id', params.id)
    .select()
    .single()
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  return Response.json(data)
}
```

```js
// app/api/links/uncategorized/route.ts
export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .is('workspace_id', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  return Response.json(data)
}
```

```js
// components/workspace-selector.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Workspace {
  id: string
  name: string
  icon: string
  color: string
}

export function WorkspaceSelector({
  value,
  onChange,
}: {
  value?: string
  onChange: (workspaceId: string) => void
}) {
  const supabase = createClientComponentClient()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  
  useEffect(() => {
    fetchWorkspaces()
  }, [])
  
  async function fetchWorkspaces() {
    const { data } = await supabase
      .from('workspaces')
      .select('id, name, icon, color')
      .order('created_at')
    
    if (data) setWorkspaces(data)
  }
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    >
      {workspaces.map((workspace) => (
        <option key={workspace.id} value={workspace.id}>
          {workspace.icon} {workspace.name}
        </option>
      ))}
      <option value="new">+ Create new workspace</option>
    </select>
  )
}
```


```sql
-- Migration: Add workspaces feature (optional workspaces)
BEGIN;

-- 1. Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#3b82f6',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add workspace_id to links (NULLABLE - optional)
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- 3. NO auto-creation of default workspace
-- Users start with uncategorized links and create workspaces as needed

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_links_workspace_id ON links(workspace_id);
CREATE INDEX IF NOT EXISTS idx_links_no_workspace ON links(user_id) WHERE workspace_id IS NULL;

-- 5. Add RLS policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces;
CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own workspaces" ON workspaces;
CREATE POLICY "Users can create own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workspaces" ON workspaces;
CREATE POLICY "Users can update own workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workspaces" ON workspaces;
CREATE POLICY "Users can delete own workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create helper function
CREATE OR REPLACE FUNCTION get_workspace_stats(workspace_uuid UUID)
RETURNS TABLE(
  total_links BIGINT,
  active_links BIGINT,
  broken_links BIGINT,
  warning_links BIGINT,
  last_check TIMESTAMP
) AS $
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'broken')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'warning')::BIGINT,
    MAX(last_checked_at)
  FROM links
  WHERE workspace_id = workspace_uuid;
END;
$ LANGUAGE plpgsql;

-- 7. Function to get uncategorized stats
CREATE OR REPLACE FUNCTION get_uncategorized_stats(user_uuid UUID)
RETURNS TABLE(
  total_links BIGINT,
  active_links BIGINT,
  broken_links BIGINT,
  warning_links BIGINT,
  last_check TIMESTAMP
) AS $
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'broken')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'warning')::BIGINT,
    MAX(last_checked_at)
  FROM links
  WHERE user_id = user_uuid AND workspace_id IS NULL;
END;
$ LANGUAGE plpgsql;

COMMIT;
```