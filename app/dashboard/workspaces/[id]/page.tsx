'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddLinkForm } from '@/components/links/add-link-form';
import { LinksTable } from '@/components/links/links-table';
import { BulkImportDialog } from '@/components/links/bulk-import-dialog';
import { WorkspaceModal } from '@/components/workspace/workspace-modal';
import { Plus, ArrowLeft, Settings, Trash2, Upload, Trash } from 'lucide-react';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  is_default: boolean;
  created_at: string;
}

interface LinkStats {
  total: number;
  active: number;
  broken: number;
  warning: number;
}

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [stats, setStats] = useState<LinkStats>({ total: 0, active: 0, broken: 0, warning: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditWorkspaceOpen, setIsEditWorkspaceOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        fetchWorkspace();
        fetchLinks();
      }
    };

    getUser();
  }, [router, supabase, workspaceId]);

  const fetchWorkspace = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (error) throw error;
      setWorkspace(data);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*, workspaces(id, name, icon, color)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLinks(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter((l) => l.status === 'active').length || 0;
      const broken = data?.filter((l) => l.status === 'error').length || 0;
      const warning = data?.filter((l) => l.status === 'warning').length || 0;

      setStats({ total, active, broken, warning });
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  const handleLinkAdded = () => {
    setIsDialogOpen(false);
    setEditingLink(null);
    fetchLinks();
  };

  const handleEdit = (link: any) => {
    setEditingLink(link);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingLink(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLinks.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedLinks.length} link${selectedLinks.length > 1 ? 's' : ''}?`,
      )
    ) {
      return;
    }

    try {
      const deletePromises = selectedLinks.map((id) =>
        fetch(`/api/links/${id}`, {
          method: 'DELETE',
        }),
      );

      await Promise.all(deletePromises);
      setSelectedLinks([]);
      fetchLinks();
    } catch (error) {
      console.error('Error deleting links:', error);
      alert('Failed to delete some links');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace) return;

    if (workspace.is_default) {
      alert('Cannot delete the default workspace');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${workspace.name}"? This will also delete all links in this workspace.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      alert('Failed to delete workspace');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <p className='text-muted-foreground'>Loading workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div className='flex items-start justify-between'>
          <div className='flex items-start gap-4'>
            <Link href='/dashboard'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='h-4 w-4' />
                Back
              </Button>
            </Link>
            <div>
              <div className='flex items-center gap-3'>
                <div
                  className='h-10 w-10 rounded-lg flex items-center justify-center text-2xl'
                  style={{ backgroundColor: workspace.color }}>
                  {workspace.icon || '📁'}
                </div>
                <div>
                  <h1 className='text-3xl font-bold'>{workspace.name}</h1>
                  {workspace.description && (
                    <p className='text-sm text-muted-foreground mt-1'>{workspace.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => setIsEditWorkspaceOpen(true)}>
              <Settings className='h-4 w-4' />
              Edit
            </Button>
            {!workspace.is_default && (
              <Button variant='destructive' size='sm' onClick={handleDeleteWorkspace}>
                <Trash2 className='h-4 w-4' />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Total Links</div>
            <div className='text-2xl font-bold mt-1'>{stats.total}</div>
          </Card>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Active</div>
            <div className='text-2xl font-bold mt-1 text-green-600'>{stats.active}</div>
          </Card>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Warning</div>
            <div className='text-2xl font-bold mt-1 text-yellow-600'>{stats.warning}</div>
          </Card>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Broken</div>
            <div className='text-2xl font-bold mt-1 text-red-600'>{stats.broken}</div>
          </Card>
        </div>

        <Card className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold'>Links in this workspace</h2>
            <div className='flex gap-2'>
              {selectedLinks.length > 0 && (
                <Button variant='destructive' onClick={handleBulkDelete}>
                  <Trash className='h-4 w-4' />
                  Delete ({selectedLinks.length})
                </Button>
              )}
              <Button variant='outline' onClick={() => setIsImportDialogOpen(true)}>
                <Upload className='h-4 w-4' />
                Import CSV
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='h-4 w-4' />
                    Add Link
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[550px]'>
                  <DialogHeader>
                    <DialogTitle>
                      {editingLink ? 'Edit Affiliate Link' : 'Add New Affiliate Link'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingLink
                        ? 'Update your affiliate link details.'
                        : 'Add a new affiliate link to this workspace.'}
                    </DialogDescription>
                  </DialogHeader>
                  <AddLinkForm
                    link={editingLink}
                    workspaceId={workspaceId}
                    onSuccess={handleLinkAdded}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <LinksTable
            links={links}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showCheckboxes={true}
            selectedLinks={selectedLinks}
            onSelectionChange={setSelectedLinks}
          />
        </Card>
      </div>

      <BulkImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={fetchLinks}
        workspaceId={workspaceId}
      />

      <WorkspaceModal
        isOpen={isEditWorkspaceOpen}
        onClose={() => setIsEditWorkspaceOpen(false)}
        workspace={workspace}
        onSuccess={fetchWorkspace}
      />
    </DashboardLayout>
  );
}
