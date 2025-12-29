'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Trash2,
  RefreshCw,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddLinkForm } from '@/components/links/add-link-form';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface Link {
  id: string;
  url: string;
  name: string;
  short_url?: string;
  category?: string;
  tags?: string[];
  status: 'active' | 'checking' | 'broken' | 'warning';
  created_at: string;
  updated_at: string;
  last_checked_at?: string;
  workspace_id?: string;
  workspaces?: Workspace;
}

interface LinkCheck {
  id: string;
  link_id: string;
  checked_at: string;
  status_code: number | null;
  response_time_ms: number;
  error_message?: string;
  redirect_chain?: string[];
  retry_count?: number;
  confidence_score?: number;
}

const statusConfig = {
  active: { label: 'Active', variant: 'default' as const, color: 'bg-green-500' },
  warning: { label: 'Warning', variant: 'secondary' as const, color: 'bg-yellow-500' },
  broken: { label: 'Broken', variant: 'destructive' as const, color: 'bg-red-500' },
  checking: { label: 'Checking', variant: 'outline' as const, color: 'bg-gray-500' },
};

export default function LinkDetailPage() {
  const [link, setLink] = useState<Link | null>(null);
  const [checks, setChecks] = useState<LinkCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const linkId = params.id as string;

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        fetchLinkDetails();
        fetchLinkChecks();
        setupRealtimeSubscriptions();
      }
    };

    getUser();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[Realtime] 🧹 Cleaning up subscriptions');
      console.log('[Realtime] Link ID:', linkId);
      console.log('[Realtime] Timestamp:', new Date().toISOString());

      const channelsBefore = supabase.getChannels();
      console.log('[Realtime] Channels before cleanup:', channelsBefore.length);

      supabase.removeAllChannels();

      const channelsAfter = supabase.getChannels();
      console.log('[Realtime] Channels after cleanup:', channelsAfter.length);
      console.log('[Realtime] ✅ All channels removed');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    };
  }, [linkId]);

  const setupRealtimeSubscriptions = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Realtime] 🚀 Setting up subscriptions for link:', linkId);
    console.log('[Realtime] Timestamp:', new Date().toISOString());

    // Subscribe to link updates
    const linkChannel = supabase
      .channel(`link:${linkId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'links',
          filter: `id=eq.${linkId}`,
        },
        (payload) => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('[Realtime] 📝 Link UPDATE event received');
          console.log('[Realtime] Timestamp:', new Date().toISOString());
          console.log('[Realtime] Event type:', payload.eventType);
          console.log('[Realtime] Old data:', payload.old);
          console.log('[Realtime] New data:', payload.new);

          // Detect what changed
          if (payload.old && payload.new) {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;
            if (oldStatus !== newStatus) {
              console.log(`[Realtime] 🔄 Status changed: ${oldStatus} → ${newStatus}`);
            }

            const oldLastChecked = payload.old.last_checked_at;
            const newLastChecked = payload.new.last_checked_at;
            if (oldLastChecked !== newLastChecked) {
              console.log('[Realtime] ✅ Last checked timestamp updated');
            }
          }

          // Update link state with new data
          setLink((prevLink) => {
            if (!prevLink) {
              console.warn('[Realtime] ⚠️ Previous link state is null, skipping update');
              return null;
            }

            const updated = {
              ...prevLink,
              ...payload.new,
            } as Link;

            console.log('[Realtime] ✅ Link state updated successfully');
            return updated;
          });

          // Show visual feedback
          setJustUpdated(true);
          setTimeout(() => setJustUpdated(false), 2000);
          console.log('[Realtime] 💫 Visual feedback triggered (2s)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
      )
      .subscribe((status, err) => {
        console.log('[Realtime] 📡 Link channel subscription status:', status);
        if (err) {
          console.error('[Realtime] ❌ Link channel error:', err);
        }

        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] ✅ Successfully subscribed to link updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] ❌ Channel error occurred');
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] ⏱️ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('[Realtime] 🔒 Channel closed');
        }
      });

    // Subscribe to new check results
    const checksChannel = supabase
      .channel(`link_checks:${linkId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'link_checks',
          filter: `link_id=eq.${linkId}`,
        },
        (payload) => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('[Realtime] 📊 Check INSERT event received');
          console.log('[Realtime] Timestamp:', new Date().toISOString());
          console.log('[Realtime] Event type:', payload.eventType);
          console.log('[Realtime] Check data:', payload.new);

          // Log check details
          const check = payload.new;
          if (check) {
            console.log('[Realtime] Check details:');
            console.log('  - Status Code:', check.status_code || 'N/A');
            console.log('  - Response Time:', check.response_time_ms ? `${check.response_time_ms}ms` : 'N/A');
            console.log('  - Retry Count:', check.retry_count || 0);
            console.log('  - Confidence:', check.confidence_score ? `${check.confidence_score}%` : 'N/A');
            console.log('  - Error:', check.error_message || 'None');
          }

          // Add new check to the beginning of the list
          setChecks((prevChecks) => {
            const updated = [payload.new as LinkCheck, ...prevChecks];
            console.log(`[Realtime] ✅ Check added to history (total: ${updated.length})`);
            return updated;
          });

          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
      )
      .subscribe((status, err) => {
        console.log('[Realtime] 📡 Checks channel subscription status:', status);
        if (err) {
          console.error('[Realtime] ❌ Checks channel error:', err);
        }

        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] ✅ Successfully subscribed to check updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] ❌ Channel error occurred');
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] ⏱️ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('[Realtime] 🔒 Channel closed');
        }
      });

    console.log('[Realtime] ✅ All subscriptions initiated');
    console.log('[Realtime] Channels:', {
      link: `link:${linkId}`,
      checks: `link_checks:${linkId}`,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };

  const fetchLinkDetails = async () => {
    setIsLoading(true);

    // Fetch link data
    const { data: linkData, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('id', linkId)
      .single();

    if (linkError) {
      console.error('Error fetching link:', linkError);
      router.push('/dashboard');
      setIsLoading(false);
      return;
    }

    // Fetch workspace data if link has a workspace_id
    if (linkData.workspace_id) {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id, name, description, icon, color')
        .eq('id', linkData.workspace_id)
        .single();

      if (!workspaceError && workspaceData) {
        linkData.workspaces = workspaceData;
      }
    }

    setLink(linkData);
    setIsLoading(false);
  };

  const fetchLinkChecks = async () => {
    const { data, error } = await supabase
      .from('link_checks')
      .select('*')
      .eq('link_id', linkId)
      .order('checked_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching link checks:', error);
    } else {
      setChecks(data || []);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    const { error } = await supabase.from('links').delete().eq('id', linkId);

    if (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
      setIsDeleting(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleCheckNow = async () => {
    setIsChecking(true);
    setCheckError(null);

    try {
      const response = await fetch(`/api/links/${linkId}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to check link');
      }

      // Refresh link details and checks to show updated status
      await fetchLinkDetails();
      await fetchLinkChecks();

      // Show success message with check result
      const { checkResult } = result.data;
      const statusText = checkResult.success ? 'Link is working!' : 'Link has issues';
      const details = checkResult.statusCode
        ? `Status: ${checkResult.statusCode} | Response time: ${checkResult.responseTime}ms`
        : checkResult.error || 'Unknown error';

      alert(`${statusText}\n${details}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check link';
      setCheckError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggleTracking = async () => {
    // This feature has been removed as tracking_enabled field doesn't exist in new schema
    alert('Tracking toggle feature is deprecated');
  };

  const handleEditSuccess = async () => {
    setIsEditDialogOpen(false);
    await fetchLinkDetails();
    await fetchLinkChecks();
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-600';
    if (code >= 300 && code < 400) return 'text-blue-600';
    if (code >= 400 && code < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Step 51: Show status changes over time
  const getCheckStatus = (check: LinkCheck): 'active' | 'broken' | 'warning' => {
    if (!check.status_code) return 'warning';
    if (check.status_code >= 200 && check.status_code < 300) return 'active';
    if (check.status_code === 404 || check.status_code === 410) return 'broken';
    if (check.status_code >= 400) return 'broken';
    if (check.status_code >= 500) return 'warning';
    return 'warning';
  };

  // Step 51: Detect status changes
  const hasStatusChanged = (index: number): boolean => {
    if (index >= checks.length - 1) return false;
    const currentStatus = getCheckStatus(checks[index]);
    const previousStatus = getCheckStatus(checks[index + 1]);
    return currentStatus !== previousStatus;
  };

  // Step 53: Highlight when link broke
  const didLinkBreak = (index: number): boolean => {
    if (index >= checks.length - 1) return false;
    const currentStatus = getCheckStatus(checks[index]);
    const previousStatus = getCheckStatus(checks[index + 1]);
    return previousStatus === 'active' && (currentStatus === 'broken' || currentStatus === 'warning');
  };

  const calculateUptime = () => {
    if (checks.length === 0) return 'N/A';
    const successfulChecks = checks.filter(
      (check) => check.status_code !== null && check.status_code >= 200 && check.status_code < 400,
    ).length;
    const percentage = (successfulChecks / checks.length) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  const calculateAvgResponseTime = () => {
    if (checks.length === 0) return 'N/A';
    const total = checks.reduce((sum, check) => sum + check.response_time_ms, 0);
    const avg = total / checks.length;
    return `${avg.toFixed(0)}ms`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      </DashboardLayout>
    );
  }

  if (!link) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>Link not found</p>
          <Button onClick={() => router.push('/dashboard')} className='mt-4'>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const config = statusConfig[link.status];

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between flex-wrap gap-4 '>
          <div className='flex items-start gap-4 flex-1'>
            <Button variant='ghost' size='sm' onClick={() => router.push('/dashboard')}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2 flex-wrap'>
                <h1 className='text-3xl font-bold overflow-wrap-anywhere'>{link.name}</h1>
                <Badge
                  variant={config.variant}
                  className={`gap-1.5 transition-all ${justUpdated ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                >
                  <div className={`h-2 w-2 rounded-full ${config.color}`} />
                  {config.label}
                </Badge>
                {justUpdated && (
                  <Badge variant='outline' className='text-xs animate-pulse'>
                    Updated
                  </Badge>
                )}
              </div>
              <a
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-muted-foreground hover:underline flex items-center gap-1.5'>
                {link.url}
                <ExternalLink className='h-3 w-3' />
              </a>
              <div className='flex items-center gap-2 mt-2 flex-wrap'>
                {link.category && <Badge variant='outline'>{link.category}</Badge>}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button variant='outline' onClick={handleCheckNow} disabled={isChecking}>
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Check Now'}
            </Button>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className='h-4 w-4' />
              Edit
            </Button>
            <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className='h-4 w-4' />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-6 md:grid-cols-4'>
          <Card className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
                <TrendingUp className='h-5 w-5 text-green-600 dark:text-green-500' />
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Uptime</h3>
                <p className='text-2xl font-bold'>{calculateUptime()}</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
                <Clock className='h-5 w-5 text-blue-600 dark:text-blue-500' />
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Avg Response Time</h3>
                <p className='text-2xl font-bold'>{calculateAvgResponseTime()}</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg'>
                <RefreshCw className='h-5 w-5 text-purple-600 dark:text-purple-500' />
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Total Checks</h3>
                <p className='text-2xl font-bold'>{checks.length}</p>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg'>
                <AlertCircle className='h-5 w-5 text-orange-600 dark:text-orange-500' />
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Last Checked</h3>
                <p className='text-sm font-semibold' suppressHydrationWarning>
                  {link.last_checked_at ? formatDateShort(link.last_checked_at) : 'Never'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Link Information */}
        <Card className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>Link Information</h2>
          <div className='grid gap-4 md:grid-cols-2'>
            {link.workspaces && (
              <div>
                <p className='text-sm text-muted-foreground'>Workspace</p>
                <div className='flex items-center gap-2 mt-1'>
                  <Badge
                    variant='outline'
                    className='gap-1.5'
                    style={{ borderColor: link.workspaces.color }}>
                    {link.workspaces.icon && <span>{link.workspaces.icon}</span>}
                    {link.workspaces.name}
                  </Badge>
                </div>
              </div>
            )}
            <div>
              <p className='text-sm text-muted-foreground'>Created At</p>
              <p className='font-medium' suppressHydrationWarning>
                {formatDate(link.created_at)}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Last Updated</p>
              <p className='font-medium' suppressHydrationWarning>
                {formatDate(link.updated_at)}
              </p>
            </div>
            {link.short_url && (
              <div>
                <p className='text-sm text-muted-foreground'>Short URL</p>
                <p className='font-medium'>{link.short_url}</p>
              </div>
            )}
            {link.tags && link.tags.length > 0 && (
              <div>
                <p className='text-sm text-muted-foreground'>Tags</p>
                <div className='flex gap-2 mt-1 flex-wrap'>
                  {link.tags.map((tag, index) => (
                    <Badge key={index} variant='secondary'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Check History - Steps 48-53 */}
        <Card className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>Check History</h2>
          {checks.length === 0 ? (
            <div className='text-center py-12 border rounded-lg'>
              <p className='text-muted-foreground'>
                No check history available yet. Checks will appear here once monitoring begins.
              </p>
            </div>
          ) : (
            <div className='border rounded-lg overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Status Code</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((check, index) => {
                    const checkStatus = getCheckStatus(check);
                    const statusChanged = hasStatusChanged(index);
                    const linkBroke = didLinkBreak(index);
                    const config = statusConfig[checkStatus];

                    return (
                      <TableRow
                        key={check.id}
                        className={linkBroke ? 'bg-red-50 dark:bg-red-950/20' : ''}
                      >
                        <TableCell className='font-medium' suppressHydrationWarning>
                          <div className='flex items-center gap-2'>
                            {formatDate(check.checked_at)}
                            {statusChanged && (
                              <Badge variant='outline' className='text-xs'>
                                Status Changed
                              </Badge>
                            )}
                            {linkBroke && (
                              <Badge variant='destructive' className='text-xs'>
                                Link Broke
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className='gap-1.5'>
                            <div className={`h-2 w-2 rounded-full ${config.color}`} />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {check.status_code !== null ? (
                            <span className={getStatusCodeColor(check.status_code)}>
                              {check.status_code}
                            </span>
                          ) : (
                            <span className='text-muted-foreground'>N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{check.response_time_ms}ms</TableCell>
                        <TableCell>
                          {check.retry_count !== undefined && check.retry_count > 0 ? (
                            <Badge variant='secondary' className='text-xs'>
                              {check.retry_count} {check.retry_count === 1 ? 'retry' : 'retries'}
                            </Badge>
                          ) : (
                            <span className='text-muted-foreground text-sm'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {check.confidence_score !== undefined ? (
                            <span className={check.confidence_score >= 95 ? 'text-green-600' : 'text-yellow-600'}>
                              {check.confidence_score}%
                            </span>
                          ) : (
                            <span className='text-muted-foreground text-sm'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {check.error_message ? (
                            <span className='text-red-600 text-sm max-w-xs truncate block'>
                              {check.error_message}
                            </span>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[550px]'>
          <DialogHeader>
            <DialogTitle>Edit Affiliate Link</DialogTitle>
            <DialogDescription>Update your affiliate link details.</DialogDescription>
          </DialogHeader>
          <AddLinkForm link={link} onSuccess={handleEditSuccess} onCancel={handleEditCancel} />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
