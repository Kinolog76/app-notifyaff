'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { eventEmitter, WORKSPACE_UPDATED } from '@/lib/events';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { usePlanLimits } from '@/lib/hooks/use-plan-limits';
import { UpgradeModal } from '@/components/upgrade-modal';

const workspaceFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  is_default: z.boolean().optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color: string;
  is_default?: boolean;
}

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace?: Workspace | null;
  onSuccess?: () => void;
}

const ICON_OPTIONS = ['📁', '💼', '🎯', '📊', '💰', '🚀', '⭐', '🔥', '💡', '🎨'];
const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // orange
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
];

export function WorkspaceModal({ isOpen, onClose, workspace, onSuccess }: WorkspaceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { canAddWorkspace, settings } = usePlanLimits();
  const isEditing = !!workspace;

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: workspace?.name || '',
      description: workspace?.description || '',
      icon: workspace?.icon || '📁',
      color: workspace?.color || '#3b82f6',
      is_default: workspace?.is_default || false,
    },
  });

  useEffect(() => {
    if (workspace) {
      form.reset({
        name: workspace.name,
        description: workspace.description || '',
        icon: workspace.icon || '📁',
        color: workspace.color,
        is_default: workspace.is_default || false,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        icon: '📁',
        color: '#3b82f6',
        is_default: false,
      });
    }
  }, [workspace, form]);

  const onSubmit = async (data: WorkspaceFormValues) => {
    if (!isEditing && !canAddWorkspace) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing ? `/api/workspaces/${workspace.id}` : '/api/workspaces';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.status === 403 && result.needsUpgrade) {
        setShowUpgradeModal(true);
        alert(result.message);
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save workspace');
      }

      form.reset();
      eventEmitter.emit(WORKSPACE_UPDATED);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving workspace:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Workspace' : 'Create Workspace'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your workspace details.'
              : 'Create a new workspace to organize your affiliate links.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Workspace" {...field} />
                  </FormControl>
                  <FormDescription>A descriptive name for your workspace</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Organize links for..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional description (max 200 characters)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 flex-wrap">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => field.onChange(icon)}
                          className={`text-2xl w-12 h-12 rounded-lg border-2 transition-all ${
                            field.value === icon
                              ? 'border-primary bg-primary/10'
                              : 'border-transparent hover:border-muted-foreground/20'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>Choose an icon for your workspace</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            field.value === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>Pick a color to identify your workspace</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || (!isEditing && !canAddWorkspace)}>
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      {showUpgradeModal && settings && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          message={`You've reached your limit of ${settings.workspaces_limit} workspaces on the ${settings.plan} plan.`}
          currentPlan={settings.plan}
          type="workspaces"
        />
      )}
    </Dialog>
  );
}
