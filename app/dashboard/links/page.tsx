'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Upload, Power, PowerOff } from 'lucide-react';
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

interface Link {
  id: string;
  url: string;
  name: string;
  short_url?: string;
  category?: string;
  tags?: string;
  status: 'active' | 'checking' | 'broken' | 'warning';
  created_at: string;
  updated_at: string;
  last_checked_at?: string;
  tracking_enabled?: boolean;
}

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [isTogglingBulk, setIsTogglingBulk] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching links:', error);
      } else {
        setLinks(data || []);
      }
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

  const handleBulkToggleTracking = async (enable: boolean) => {
    if (selectedLinks.length === 0) return;

    const action = enable ? 'enable' : 'disable';
    if (
      !confirm(
        `Are you sure you want to ${action} tracking for ${selectedLinks.length} selected link(s)?`,
      )
    )
      return;

    setIsTogglingBulk(true);
    try {
      const { error } = await supabase
        .from('links')
        .update({ tracking_enabled: enable })
        .in('id', selectedLinks);

      if (error) {
        console.error('Error toggling bulk tracking:', error);
        alert('Failed to update tracking status');
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
              <>
                <Button
                  variant='outline'
                  onClick={() => handleBulkToggleTracking(false)}
                  disabled={isTogglingBulk}>
                  <PowerOff className='h-4 w-4' />
                  Disable Tracking ({selectedLinks.length})
                </Button>
                <Button
                  variant='outline'
                  onClick={() => handleBulkToggleTracking(true)}
                  disabled={isTogglingBulk}>
                  <Power className='h-4 w-4' />
                  Enable Tracking ({selectedLinks.length})
                </Button>
              </>
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
          <h2 className='text-lg font-semibold mb-4'>Your Links</h2>
          {isLoading ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>Loading links...</p>
            </div>
          ) : (
            <LinksTable
              links={links}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={fetchLinks}
              selectedLinks={selectedLinks}
              onSelectionChange={setSelectedLinks}
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
