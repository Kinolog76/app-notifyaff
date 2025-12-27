'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  Clock,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Activity,
  BarChart3,
} from 'lucide-react';

interface Link {
  id: string;
  url: string;
  name: string;
  short_url?: string;
  category?: string;
  status: 'active' | 'checking' | 'broken' | 'warning';
  created_at: string;
  last_checked_at?: string;
}

interface LinkCheck {
  id: string;
  checked_at: string;
  status_code: number;
  response_time: number;
  error_message?: string;
}

interface LinkStatsDialogProps {
  link: Link | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  active: { label: 'Active', variant: 'default' as const, color: 'bg-green-500' },
  warning: { label: 'Warning', variant: 'secondary' as const, color: 'bg-yellow-500' },
  broken: { label: 'Broken', variant: 'destructive' as const, color: 'bg-red-500' },
  checking: { label: 'Checking', variant: 'outline' as const, color: 'bg-gray-500' },
};

export const LinkStatsDialog = ({ link, isOpen, onClose }: LinkStatsDialogProps) => {
  const [checks, setChecks] = useState<LinkCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (link && isOpen) {
      fetchLinkChecks();
    }
  }, [link, isOpen]);

  const fetchLinkChecks = async () => {
    if (!link) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('link_checks')
      .select('*')
      .eq('link_id', link.id)
      .order('checked_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching link checks:', error);
    } else {
      setChecks(data || []);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-600';
    if (code >= 300 && code < 400) return 'text-blue-600';
    if (code >= 400 && code < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateUptime = () => {
    if (checks.length === 0) return { percentage: 'N/A', successful: 0, total: 0 };
    const successfulChecks = checks.filter(
      (check) => check.status_code >= 200 && check.status_code < 400,
    ).length;
    const percentage = ((successfulChecks / checks.length) * 100).toFixed(1);
    return { percentage: `${percentage}%`, successful: successfulChecks, total: checks.length };
  };

  const calculateAvgResponseTime = () => {
    if (checks.length === 0) return 'N/A';
    const total = checks.reduce((sum, check) => sum + check.response_time, 0);
    const avg = total / checks.length;
    return `${avg.toFixed(0)}ms`;
  };

  const getMinMaxResponseTime = () => {
    if (checks.length === 0) return { min: 'N/A', max: 'N/A' };
    const times = checks.map((c) => c.response_time);
    return {
      min: `${Math.min(...times)}ms`,
      max: `${Math.max(...times)}ms`,
    };
  };

  const getRecentErrors = () => {
    return checks.filter((c) => c.error_message || c.status_code >= 400).length;
  };

  if (!link) return null;

  const config = statusConfig[link.status];
  const uptime = calculateUptime();
  const responseStats = getMinMaxResponseTime();
  const errorCount = getRecentErrors();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            <Activity className='h-5 w-5' />
            Link Statistics
          </DialogTitle>
          <DialogDescription>
            Detailed performance and health metrics for this link
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Link Info */}
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <h3 className='font-semibold text-lg'>{link.name}</h3>
                <Badge variant={config.variant} className='gap-1.5'>
                  <div className={`h-2 w-2 rounded-full ${config.color}`} />
                  {config.label}
                </Badge>
              </div>
              <a
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-muted-foreground hover:underline flex items-center gap-1.5'>
                {link.url}
                <ExternalLink className='h-3 w-3' />
              </a>
              {link.category && (
                <Badge variant='outline' className='mt-2'>
                  {link.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card className='p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-2 bg-green-50 dark:bg-green-950 rounded-lg'>
                  <TrendingUp className='h-4 w-4 text-green-600' />
                </div>
                <div className='text-xs text-muted-foreground'>Uptime</div>
              </div>
              <div className='text-2xl font-bold'>{uptime.percentage}</div>
              <div className='text-xs text-muted-foreground mt-1'>
                {uptime.successful}/{uptime.total} checks
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-2 bg-blue-50 dark:bg-blue-950 rounded-lg'>
                  <Clock className='h-4 w-4 text-blue-600' />
                </div>
                <div className='text-xs text-muted-foreground'>Avg Response</div>
              </div>
              <div className='text-2xl font-bold'>{calculateAvgResponseTime()}</div>
              <div className='text-xs text-muted-foreground mt-1'>
                Min: {responseStats.min} | Max: {responseStats.max}
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-2 bg-purple-50 dark:bg-purple-950 rounded-lg'>
                  <RefreshCw className='h-4 w-4 text-purple-600' />
                </div>
                <div className='text-xs text-muted-foreground'>Total Checks</div>
              </div>
              <div className='text-2xl font-bold'>{checks.length}</div>
              <div className='text-xs text-muted-foreground mt-1'>Last 10 records</div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-2 bg-red-50 dark:bg-red-950 rounded-lg'>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                </div>
                <div className='text-xs text-muted-foreground'>Recent Errors</div>
              </div>
              <div className='text-2xl font-bold'>{errorCount}</div>
              <div className='text-xs text-muted-foreground mt-1'>In last 10 checks</div>
            </Card>
          </div>

          {/* Performance Breakdown */}
          {checks.length > 0 && (
            <Card className='p-4'>
              <div className='flex items-center gap-2 mb-4'>
                <BarChart3 className='h-4 w-4' />
                <h3 className='font-semibold'>Status Code Distribution</h3>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-sm'>
                <div className='p-3 bg-green-50 dark:bg-green-950 rounded-lg'>
                  <div className='text-xs text-muted-foreground'>2xx Success</div>
                  <div className='text-lg font-bold text-green-600'>
                    {checks.filter((c) => c.status_code >= 200 && c.status_code < 300).length}
                  </div>
                </div>
                <div className='p-3 bg-blue-50 dark:bg-blue-950 rounded-lg'>
                  <div className='text-xs text-muted-foreground'>3xx Redirect</div>
                  <div className='text-lg font-bold text-blue-600'>
                    {checks.filter((c) => c.status_code >= 300 && c.status_code < 400).length}
                  </div>
                </div>
                <div className='p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg'>
                  <div className='text-xs text-muted-foreground'>4xx Client Error</div>
                  <div className='text-lg font-bold text-yellow-600'>
                    {checks.filter((c) => c.status_code >= 400 && c.status_code < 500).length}
                  </div>
                </div>
                <div className='p-3 bg-red-50 dark:bg-red-950 rounded-lg'>
                  <div className='text-xs text-muted-foreground'>5xx Server Error</div>
                  <div className='text-lg font-bold text-red-600'>
                    {checks.filter((c) => c.status_code >= 500).length}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Check History */}
          <div>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Recent Check History
            </h3>
            {isLoading ? (
              <div className='text-center py-8'>
                <RefreshCw className='h-6 w-6 animate-spin mx-auto text-muted-foreground' />
              </div>
            ) : checks.length === 0 ? (
              <div className='text-center py-8 border rounded-lg'>
                <p className='text-sm text-muted-foreground'>No check history available yet</p>
              </div>
            ) : (
              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className='font-medium text-sm'>
                          {formatDate(check.checked_at)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${getStatusCodeColor(check.status_code)}`}>
                            {check.status_code}
                          </span>
                        </TableCell>
                        <TableCell className='text-sm'>{check.response_time}ms</TableCell>
                        <TableCell className='text-sm'>
                          {check.error_message ? (
                            <span className='text-red-600'>{check.error_message}</span>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
