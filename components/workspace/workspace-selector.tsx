'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  color: string;
}

interface WorkspaceSelectorProps {
  value?: string;
  onChange: (workspaceId: string) => void;
  onCreateNew?: () => void;
  showAllOption?: boolean;
  onAllSelected?: () => void;
}

export function WorkspaceSelector({
  value,
  onChange,
  onCreateNew,
  showAllOption,
  onAllSelected,
}: WorkspaceSelectorProps) {
  const supabase = createClient();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function fetchWorkspaces() {
    try {
      const { data } = await supabase
        .from('workspaces')
        .select('id, name, icon, color')
        .order('created_at', { ascending: false });

      if (data) setWorkspaces(data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleValueChange = (newValue: string) => {
    if (newValue === 'new' && onCreateNew) {
      onCreateNew();
    } else if (newValue === 'all' && onAllSelected) {
      onAllSelected();
    } else {
      onChange(newValue);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Loading...' />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder='Select workspace'>
          {value && workspaces.find((w) => w.id === value) && (
            <div className='flex items-center gap-2'>
              <div
                className='h-3 w-3 rounded-full'
                style={{
                  backgroundColor:
                    workspaces.find((w) => w.id === value)?.color || '#3b82f6',
                }}
              />
              <span>
                {workspaces.find((w) => w.id === value)?.icon}{' '}
                {workspaces.find((w) => w.id === value)?.name}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value='all'>
            <span className='font-medium'>All Workspaces</span>
          </SelectItem>
        )}
        {workspaces.map((workspace) => (
          <SelectItem key={workspace.id} value={workspace.id}>
            <div className='flex items-center gap-2'>
              <div
                className='h-3 w-3 rounded-full'
                style={{ backgroundColor: workspace.color }}
              />
              <span>
                {workspace.icon} {workspace.name}
              </span>
            </div>
          </SelectItem>
        ))}
        {onCreateNew && (
          <SelectItem value='new'>
            <span className='font-medium'>+ Create new workspace</span>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
