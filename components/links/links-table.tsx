"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ExternalLink, Pencil, Trash2, Eye, BarChart3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinksFilters } from "./links-filters";
import { LinkStatsDialog } from "./link-stats-dialog";

interface Link {
  id: string;
  url: string;
  name: string;
  short_url?: string;
  category?: string;
  status: "active" | "inactive" | "broken" | "warning";
  created_at: string;
  updated_at: string;
  last_checked_at?: string;
}

interface LinksTableProps {
  links: Link[];
  onEdit?: (link: Link) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  active: { label: "Active", variant: "default" as const, color: "bg-green-500" },
  warning: { label: "Warning", variant: "secondary" as const, color: "bg-yellow-500" },
  broken: { label: "Broken", variant: "destructive" as const, color: "bg-red-500" },
  inactive: { label: "Inactive", variant: "outline" as const, color: "bg-gray-500" },
};

export const LinksTable = ({ links, onEdit, onDelete }: LinksTableProps) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
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

  // Filter links based on search and filters
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.short_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.category?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || link.status === statusFilter;

      // Category filter
      const matchesCategory =
        categoryFilter === "all" || link.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [links, searchQuery, statusFilter, categoryFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    setDeletingId(id);
    try {
      await onDelete?.(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
  };

  const handleViewStats = (link: Link) => {
    setStatsLink(link);
    setIsStatsDialogOpen(true);
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No links found. Add your first link to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LinksFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={categories}
      />

      {filteredLinks.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            No links match your filters. Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => {
            const config = statusConfig[link.status];
            return (
              <TableRow
                key={link.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/links/${link.id}`)}
              >
                <TableCell>
                  <Badge variant={config.variant} className="gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${config.color}`} />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="flex flex-col gap-1">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline flex items-center gap-1.5"
                      title={link.url}
                    >
                      {truncateUrl(link.url)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {link.short_url && (
                      <span className="text-xs text-muted-foreground">
                        Short: {link.short_url}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {link.category ? (
                    <Badge variant="outline">{link.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {link.last_checked_at
                    ? formatDate(link.last_checked_at)
                    : "Never"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(link.created_at)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="lg" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewStats(link)}
                        className="cursor-pointer"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Statistics
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/links/${link.id}`)}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit?.(link)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(link.url, "_blank")}
                        className="cursor-pointer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(link.id)}
                        disabled={deletingId === link.id}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === link.id ? "Deleting..." : "Delete"}
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
