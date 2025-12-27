"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink } from "lucide-react";
import { WorkspaceContextMenu } from "./workspace-context-menu";
import { WorkspaceModal } from "./workspace-modal";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  is_default: boolean;
  linkCount?: number;
  activeCount?: number;
  brokenCount?: number;
}

interface WorkspaceGridProps {
  workspaces: Workspace[];
  onCreateNew?: () => void;
  onRefresh?: () => void;
}

export function WorkspaceGrid({ workspaces, onCreateNew, onRefresh }: WorkspaceGridProps) {
  const router = useRouter();
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setIsModalOpen(true);
  };

  const handleDelete = async (workspace: Workspace) => {
    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete workspace');
      }

      onRefresh?.();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete workspace');
      throw error;
    }
  };

  const handleToggleDefault = async (workspace: Workspace) => {
    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_default: !workspace.is_default,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update workspace');
      }

      onRefresh?.();
    } catch (error) {
      console.error('Error updating workspace:', error);
      alert(error instanceof Error ? error.message : 'Failed to update workspace');
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingWorkspace(null);
    onRefresh?.();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingWorkspace(null);
  };

  if (workspaces.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-3xl">
            📁
          </div>
          <div>
            <h3 className="text-lg font-semibold">No workspaces yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first workspace to organize your affiliate links
            </p>
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4" />
              Create Workspace
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((workspace) => (
          <Card
            key={workspace.id}
            className="p-6 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => router.push(`/dashboard/workspaces/${workspace.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: workspace.color }}
                >
                  {workspace.icon || "📁"}
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {workspace.name}
                    {workspace.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </h3>
                  {workspace.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {workspace.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <WorkspaceContextMenu
                  workspace={workspace}
                  onEdit={() => handleEdit(workspace)}
                  onDelete={() => handleDelete(workspace)}
                  onToggleDefault={() => handleToggleDefault(workspace)}
                />
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
            <div>
              <div className="text-2xl font-bold">{workspace.linkCount || 0}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {workspace.activeCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {workspace.brokenCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">Broken</div>
            </div>
          </div>
        </Card>
      ))}

      {onCreateNew && (
        <Card
          className="p-6 border-dashed hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer flex items-center justify-center min-h-[200px]"
          onClick={onCreateNew}
        >
          <div className="text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
              <Plus className="h-6 w-6" />
            </div>
            <p className="font-medium">Create Workspace</p>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your links
            </p>
          </div>
        </Card>
      )}
    </div>

    <WorkspaceModal
      isOpen={isModalOpen}
      onClose={handleModalClose}
      workspace={editingWorkspace}
      onSuccess={handleModalSuccess}
    />
    </>
  );
}
