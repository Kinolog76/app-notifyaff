'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LinksTable } from '@/components/links/links-table';
import { AddLinkForm } from '@/components/links/add-link-form';
import { BulkImportDialog } from '@/components/links/bulk-import-dialog';
import { WorkspaceSelector } from '@/components/workspace/workspace-selector';

interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  color: string;
}

interface Link {
  id: string;
  url: string;
  short_url?: string;
  category?: string;
  tags?: string[];
  status: 'active' | 'checking' | 'broken' | 'warning';
  workspace_id?: string;
  workspaces?: Workspace;
  created_at: string;
  updated_at: string;
  last_checked_at?: string;
}

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [isTogglingBulk, setIsTogglingBulk] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (selectedWorkspace === 'all') {
      setFilteredLinks(links);
    } else {
      setFilteredLinks(links.filter(link => link.workspace_id === selectedWorkspace));
    }
  }, [links, selectedWorkspace]);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('User not authenticated');
        setIsLoading(false);
        return;
      }

      // Fetch links first
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (linksError) {
        console.error('Error fetching links:', linksError);
        setIsLoading(false);
        return;
      }

      // Get unique workspace IDs
      const workspaceIds = [...new Set(
        linksData
          ?.map(link => link.workspace_id)
          .filter(id => id != null) || []
      )];

      // Fetch workspaces if there are any
      let workspacesMap: Record<string, Workspace> = {};
      if (workspaceIds.length > 0) {
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('id, name, icon, color')
          .in('id', workspaceIds);

        if (!workspacesError && workspacesData) {
          workspacesMap = workspacesData.reduce((acc, workspace) => {
            acc[workspace.id] = workspace;
            return acc;
          }, {} as Record<string, Workspace>);
        }
      }

      // Combine links with their workspaces
      const linksWithWorkspaces = linksData?.map(link => ({
        ...link,
        workspaces: link.workspace_id ? workspacesMap[link.workspace_id] : undefined
      })) || [];

      setLinks(linksWithWorkspaces);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('links').delete().eq('id', id);

      if (error) {
        throw new Error('Failed to delete link');
      }

      await fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  };

  const handleFormSuccess = async () => {
    setIsAddDialogOpen(false);
    setEditingLink(null);
    await fetchLinks();
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingLink(null);
  };

  const handleBulkDelete = async () => {
    if (selectedLinks.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedLinks.length} selected link(s)?`,
      )
    )
      return;

    setIsTogglingBulk(true);
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .in('id', selectedLinks);

      if (error) {
        console.error('Error deleting links:', error);
        alert('Failed to delete links');
      } else {
        setSelectedLinks([]);
        await fetchLinks();
      }
    } finally {
      setIsTogglingBulk(false);
    }
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div className='flex items-center flex-wrap gap-4 justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Links</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manage and monitor your affiliate links
            </p>
          </div>
          <div className='flex gap-2'>
            {selectedLinks.length > 0 && (
              <Button
                variant='destructive'
                onClick={handleBulkDelete}
                disabled={isTogglingBulk}>
                Bulk Delete ({selectedLinks.length})
              </Button>
            )}
            <Button variant='outline' onClick={() => setIsBulkImportOpen(true)}>
              <Upload className='h-4 w-4' />
              Import CSV
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={handleCloseDialog}>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className='h-4 w-4' />
                Add Link
              </Button>
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
                  onSuccess={handleFormSuccess}
                  onCancel={handleCloseDialog}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold'>Your Links</h2>
            <div className='w-64'>
              <WorkspaceSelector
                value={selectedWorkspace === 'all' ? undefined : selectedWorkspace}
                onChange={(value) => setSelectedWorkspace(value)}
                showAllOption={true}
                onAllSelected={() => setSelectedWorkspace('all')}
              />
            </div>
          </div>
          {isLoading ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>Loading links...</p>
            </div>
          ) : (
            <LinksTable
              links={filteredLinks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={fetchLinks}
              selectedLinks={selectedLinks}
              onSelectionChange={setSelectedLinks}
              showCheckboxes={true}
            />
          )}
        </Card>
      </div>

      <BulkImportDialog
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={fetchLinks}
      />
    </DashboardLayout>
  );
}
