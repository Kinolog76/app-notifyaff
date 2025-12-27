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

```
```js
// app/api/workspaces/route.ts
export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
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
  
  return Response.json(workspacesWithStats)
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
  
  // Check if workspace is default
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('is_default')
    .eq('id', params.id)
    .single()
  
  if (workspace?.is_default) {
    return Response.json(
      { error: 'Cannot delete default workspace' },
      { status: 400 }
    )
  }
  
  // Delete workspace (CASCADE will delete all links)
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', params.id)
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  return Response.json({ success: true })
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