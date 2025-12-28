'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { StatsOverviewCard } from '@/components/dashboard/stats-overview-card';
import { WorkspaceGrid } from '@/components/workspace/workspace-grid';
import { WorkspaceModal } from '@/components/workspace/workspace-modal';
import { Plus, Upload } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
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
        setUser(user);
        fetchLinks();
        fetchWorkspaces();
      }
    };

    getUser();
  }, [router, supabase]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('links')
      .select('*, workspaces(id, name, icon, color)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching links:', error);
    } else {
      setLinks(data || []);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const { data: workspacesData, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch link counts for each workspace
      const workspacesWithStats = await Promise.all(
        (workspacesData || []).map(async (workspace) => {
          const { data: links } = await supabase
            .from('links')
            .select('status')
            .eq('workspace_id', workspace.id);

          const linkCount = links?.length || 0;
          const activeCount = links?.filter((l) => l.status === 'active').length || 0;
          const brokenCount = links?.filter((l) => l.status === 'error').length || 0;

          return {
            ...workspace,
            linkCount,
            activeCount,
            brokenCount,
          };
        }),
      );

      setWorkspaces(workspacesWithStats);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  if (!user) {
    return null;
  }

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

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div className='flex items-center flex-wrap gap-4 justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Dashboard</h1>
            <p className='mt-1 text-sm text-muted-foreground'>Welcome back, {user.email}</p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => setIsBulkImportOpen(true)}>
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
                      : 'Add a new affiliate link to start monitoring its health and performance.'}
                  </DialogDescription>
                </DialogHeader>
                <AddLinkForm
                  link={editingLink}
                  onSuccess={handleLinkAdded}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <StatsOverviewCard links={links} />

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-semibold'>Your Workspaces</h2>
          </div>
          <WorkspaceGrid
            workspaces={workspaces}
            onCreateNew={() => setIsWorkspaceModalOpen(true)}
            onRefresh={fetchWorkspaces}
          />
        </div>

        <Card className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>Recent Links</h2>
          <LinksTable links={links.slice(0, 10)} onEdit={handleEdit} onDelete={handleDelete} />
        </Card>
      </div>

      <BulkImportDialog
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={fetchLinks}
      />

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSuccess={fetchWorkspaces}
      />
    </DashboardLayout>
  );
}
