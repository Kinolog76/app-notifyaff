'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Trash2,
  Eye,
  BarChart3,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LinksFilters } from './links-filters';
import { LinkStatsDialog } from './link-stats-dialog';
import { createClient } from '@/utils/supabase/client';

interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  color: string;
}

interface Link {
  id: string;
  url: string;
  name: string;
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

interface LinksTableProps {
  links: Link[];
  onEdit?: (link: Link) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  selectedLinks?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  showCheckboxes?: boolean;
}

const statusConfig = {
  active: { label: 'Active', variant: 'default' as const, color: 'bg-green-500' },
  warning: { label: 'Warning', variant: 'secondary' as const, color: 'bg-yellow-500' },
  broken: { label: 'Broken', variant: 'destructive' as const, color: 'bg-red-500' },
  checking: { label: 'Checking', variant: 'outline' as const, color: 'bg-blue-500' },
};

export const LinksTable = ({
  links,
  onEdit,
  onDelete,
  onRefresh,
  selectedLinks = [],
  onSelectionChange,
  showCheckboxes = false,
}: LinksTableProps) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [statsLink, setStatsLink] = useState<Link | null>(null);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  // Extract unique categories from links
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    links.forEach((link) => {
      if (link.category) {
        uniqueCategories.add(link.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [links]);

  // Extract unique tags from links
  const tags = useMemo(() => {
    const uniqueTags = new Set<string>();
    links.forEach((link) => {
      if (link.tags && Array.isArray(link.tags)) {
        link.tags.forEach((tag) => {
          if (tag) uniqueTags.add(tag);
        });
      }
    });
    return Array.from(uniqueTags).sort();
  }, [links]);

  // Filter links based on search and filters
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.short_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || link.status === statusFilter;

      // Category filter
      const matchesCategory = categoryFilter === 'all' || link.category === categoryFilter;

      // Tag filter
      const matchesTag =
        tagFilter === 'all' ||
        (link.tags && link.tags.includes(tagFilter));

      return matchesSearch && matchesStatus && matchesCategory && matchesTag;
    });
  }, [links, searchQuery, statusFilter, categoryFilter, tagFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    setDeletingId(id);
    try {
      await onDelete?.(id);
    } finally {
      setDeletingId(null);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  const handleViewStats = (link: Link) => {
    setStatsLink(link);
    setIsStatsDialogOpen(true);
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onSelectionChange?.(filteredLinks.map((link) => link.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectLink = (linkId: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onSelectionChange?.([...selectedLinks, linkId]);
    } else {
      onSelectionChange?.(selectedLinks.filter((id) => id !== linkId));
    }
  };

  const isAllSelected = filteredLinks.length > 0 && selectedLinks.length === filteredLinks.length;
  const isSomeSelected = selectedLinks.length > 0 && selectedLinks.length < filteredLinks.length;

  const TagsDisplay = ({ tagsArray }: { tagsArray?: string[] }) => {
    const [showAll, setShowAll] = useState(false);

    if (!tagsArray || tagsArray.length === 0) {
      return <span className='text-muted-foreground text-sm'>-</span>;
    }

    const visibleTags = showAll ? tagsArray : tagsArray.slice(0, 3);
    const hasMore = tagsArray.length > 3;

    return (
      <div className='flex flex-wrap gap-1' onClick={(e) => e.stopPropagation()}>
        {visibleTags.map((tag, index) => (
          <Badge key={index} variant='secondary' className='text-xs'>
            {tag}
          </Badge>
        ))}
        {hasMore && !showAll && (
          <Button
            variant='ghost'
            size='sm'
            className='h-5 px-2 text-xs'
            onClick={() => setShowAll(true)}>
            +{tagsArray.length - 3} more
          </Button>
        )}
        {hasMore && showAll && (
          <Button
            variant='ghost'
            size='sm'
            className='h-5 px-2 text-xs'
            onClick={() => setShowAll(false)}>
            Show less
          </Button>
        )}
      </div>
    );
  };

  if (links.length === 0) {
    return (
      <div className='text-center py-12 border rounded-lg'>
        <p className='text-muted-foreground'>No links found. Add your first link to get started.</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <LinksFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={categories}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        tags={tags}
      />

      {filteredLinks.length === 0 ? (
        <div className='text-center py-12 border rounded-lg'>
          <p className='text-muted-foreground'>
            No links match your filters. Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className='border rounded-lg overflow-x-auto max-w-[-webkit-fill-available]'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                {showCheckboxes && (
                  <TableHead className='w-12'>
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label='Select all links'
                      className={isSomeSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                    />
                  </TableHead>
                )}
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => {
                const config = statusConfig[link.status];
                return (
                  <TableRow
                    key={link.id}
                    className='cursor-pointer hover:bg-muted/50'>
                    {showCheckboxes && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedLinks.includes(link.id)}
                          onCheckedChange={(checked) =>
                            handleSelectLink(link.id, checked as boolean)
                          }
                          aria-label={`Select ${link.name}`}
                        />
                      </TableCell>
                    )}
                    <TableCell
                      className='font-medium'
                      onClick={() => router.push(`/dashboard/links/${link.id}`)}>
                      {link.name}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/dashboard/links/${link.id}`)}>
                      <Badge variant={config.variant} className='gap-1.5'>
                        <div className={`h-2 w-2 rounded-full ${config.color}`} />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className='max-w-md'>
                      <div className='flex flex-col gap-1'>
                        <a
                          href={link.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm font-medium hover:underline flex items-center gap-1.5'
                          title={link.url}>
                          {truncateUrl(link.url)}
                          <ExternalLink className='h-3 w-3' />
                        </a>
                        {link.short_url && (
                          <span className='text-xs text-muted-foreground'>
                            Short: {link.short_url}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => router.push(`/dashboard/links/${link.id}`)}>
                      {link.workspaces ? (
                        <div className='flex items-center gap-2'>
                          <div
                            className='h-3 w-3 rounded-full'
                            style={{ backgroundColor: link.workspaces.color }}
                          />
                          <span className='text-sm'>
                            {link.workspaces.icon} {link.workspaces.name}
                          </span>
                        </div>
                      ) : (
                        <span className='text-muted-foreground text-sm'>-</span>
                      )}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/dashboard/links/${link.id}`)}>
                      {link.category ? (
                        <Badge variant='outline'>{link.category}</Badge>
                      ) : (
                        <span className='text-muted-foreground text-sm'>-</span>
                      )}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/dashboard/links/${link.id}`)}>
                      <TagsDisplay tagsArray={link.tags} />
                    </TableCell>
                    <TableCell
                      className='text-sm text-muted-foreground'
                      onClick={() => router.push(`/dashboard/links/${link.id}`)}>
                      {link.last_checked_at ? formatDate(link.last_checked_at) : 'Never'}
                    </TableCell>
                    <TableCell
                      className='text-sm text-muted-foreground'
                      onClick={() => router.push(`/dashboard/links/${link.id}`)}>
                      {formatDate(link.created_at)}
                    </TableCell>
                    <TableCell className='text-right' onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='lg' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => handleViewStats(link)}
                            className='cursor-pointer'>
                            <BarChart3 className='mr-2 h-4 w-4' />
                            View Statistics
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/links/${link.id}`)}
                            className='cursor-pointer'>
                            <Eye className='mr-2 h-4 w-4' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEdit?.(link)}
                            className='cursor-pointer'>
                            <Pencil className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(link.url, '_blank')}
                            className='cursor-pointer'>
                            <ExternalLink className='mr-2 h-4 w-4' />
                            Open Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(link.id)}
                            disabled={deletingId === link.id}
                            className='cursor-pointer text-destructive focus:text-destructive'>
                            <Trash2 className='mr-2 h-4 w-4' />
                            {deletingId === link.id ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <LinkStatsDialog
        link={statsLink}
        isOpen={isStatsDialogOpen}
        onClose={() => setIsStatsDialogOpen(false)}
      />
    </div>
  );
};
