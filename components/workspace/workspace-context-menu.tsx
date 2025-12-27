'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Star, StarOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Workspace {
  id: string;
  name: string;
  is_default?: boolean;
}

interface WorkspaceContextMenuProps {
  workspace: Workspace;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleDefault?: () => void;
}

export function WorkspaceContextMenu({
  workspace,
  onEdit,
  onDelete,
  onToggleDefault,
}: WorkspaceContextMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting workspace:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Workspace
            </DropdownMenuItem>
          )}
          {onToggleDefault && (
            <DropdownMenuItem onClick={onToggleDefault}>
              {workspace.is_default ? (
                <>
                  <StarOff className="h-4 w-4 mr-2" />
                  Remove as Default
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Default
                </>
              )}
            </DropdownMenuItem>
          )}
          {(onEdit || onToggleDefault) && onDelete && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (workspace.is_default) {
                  alert('Cannot delete the default workspace');
                  return;
                }
                setIsDeleteDialogOpen(true);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Workspace
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{workspace.name}"? This will also delete all links
              associated with this workspace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
