"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WorkspaceSelector } from "@/components/workspace/workspace-selector";
import { usePlanLimits } from "@/lib/hooks/use-plan-limits";
import { UpgradeModal } from "@/components/upgrade-modal";

const linkFormSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  workspace_id: z.string().optional(),
});

type LinkFormValues = z.infer<typeof linkFormSchema>;

interface Link {
  id: string;
  url: string;
  name: string;
  category?: string;
  tags?: string[];
  workspace_id?: string;
}

interface AddLinkFormProps {
  link?: Link | null;
  workspaceId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddLinkForm = ({ link, workspaceId, onSuccess, onCancel }: AddLinkFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { canAddLink, settings } = usePlanLimits();
  const isEditing = !!link;

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      url: link?.url || "",
      name: link?.name || "",
      category: link?.category || "",
      tags: link?.tags || [],
      workspace_id: workspaceId || link?.workspace_id || "",
    },
  });

  useEffect(() => {
    form.reset({
      url: link?.url || "",
      name: link?.name || "",
      category: link?.category || "",
      tags: link?.tags || [],
      workspace_id: workspaceId || link?.workspace_id || "",
    });
  }, [link, workspaceId, form]);

  const onSubmit = async (data: LinkFormValues) => {
    if (!isEditing && !canAddLink) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(isEditing ? `/api/links/${link.id}` : "/api/links", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(result.error || (isEditing ? "Failed to update link" : "Failed to add link"));
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving link:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliate URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/affiliate/abc123"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The full affiliate link you want to monitor
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Name</FormLabel>
              <FormControl>
                <Input placeholder="Product name or description" {...field} />
              </FormControl>
              <FormDescription>
                A friendly name to identify this link
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Amazon, Social Media, E-commerce"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Organize your links by category (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="fashion, summer, promotion (comma-separated)"
                  value={field.value?.join(", ") || ""}
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean);
                    field.onChange(tags);
                  }}
                />
              </FormControl>
              <FormDescription>
                Add tags separated by commas (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!workspaceId && (
          <FormField
            control={form.control}
            name="workspace_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace</FormLabel>
                <FormControl>
                  <WorkspaceSelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Select which workspace this link belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading || (!isEditing && !canAddLink)}>
            {isLoading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Link" : "Add Link")}
          </Button>
        </div>
      </form>
      {showUpgradeModal && settings && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          message={`You've reached your limit of ${settings.links_limit} links on the ${settings.plan} plan.`}
          currentPlan={settings.plan}
          type="links"
        />
      )}
    </Form>
  );
};
