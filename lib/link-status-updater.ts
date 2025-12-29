import { createClient } from "@/utils/supabase/server";
import { LinkCheckResult } from "./link-checker";

export type LinkStatus = "checking" | "active" | "broken" | "warning";

export interface LinkStatusUpdate {
  status: LinkStatus;
  last_checked_at: Date;
}

/**
 * Determine the link status based on check result
 * Steps 18-21: Status determination logic
 * - active: HTTP 200-299 (success)
 * - broken: HTTP 404, 410 (not found, gone)
 * - warning: HTTP 500-599 (server errors), timeouts, network errors
 * - checking: while check is in progress
 */
export function determineLinkStatus(checkResult: LinkCheckResult): LinkStatus {
  // If check failed without a status code (network error, timeout, DNS, SSL)
  if (checkResult.statusCode === null) {
    return "warning";
  }

  // HTTP 200-299: Success
  if (checkResult.statusCode >= 200 && checkResult.statusCode < 300) {
    return "active";
  }

  // HTTP 404 Not Found or 410 Gone
  if (checkResult.statusCode === 404 || checkResult.statusCode === 410) {
    return "broken";
  }

  // HTTP 500-599: Server errors
  if (checkResult.statusCode >= 500 && checkResult.statusCode < 600) {
    return "warning";
  }

  // HTTP 400-499 (except 404, 410): Client errors - treat as broken
  if (checkResult.statusCode >= 400 && checkResult.statusCode < 500) {
    return "broken";
  }

  // HTTP 300-399: Redirects (should have been followed by axios)
  // If we get here, it means redirect limit was exceeded or other redirect issue
  if (checkResult.statusCode >= 300 && checkResult.statusCode < 400) {
    return "warning";
  }

  // Default to warning for any unexpected status codes
  return "warning";
}

/**
 * Update link status and last_checked_at timestamp in the database
 * Steps 22-24: Update links table with new status and timestamp
 */
export async function updateLinkStatus(
  linkId: string,
  status: LinkStatus,
  timestamp: Date = new Date()
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("links")
      .update({
        status,
        last_checked_at: timestamp.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", linkId);

    if (error) {
      console.error("Failed to update link status:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating link status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Set link status to "checking" before performing a check
 * Step 22: Mark as "checking" while in progress
 */
export async function setLinkChecking(
  linkId: string
): Promise<{ success: boolean; error?: string }> {
  return updateLinkStatus(linkId, "checking");
}

/**
 * Update link status based on check result
 * Combines status determination and database update
 */
export async function updateLinkStatusFromCheck(
  linkId: string,
  checkResult: LinkCheckResult
): Promise<{ success: boolean; error?: string; status?: LinkStatus }> {
  const status = determineLinkStatus(checkResult);
  const result = await updateLinkStatus(linkId, status, checkResult.timestamp);

  return {
    ...result,
    status,
  };
}

/**
 * Get current link status from database
 */
export async function getLinkStatus(
  linkId: string
): Promise<{ success: boolean; error?: string; status?: LinkStatus; last_checked_at?: Date }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("links")
      .select("status, last_checked_at")
      .eq("id", linkId)
      .single();

    if (error) {
      console.error("Failed to fetch link status:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return {
      success: true,
      status: data.status as LinkStatus,
      last_checked_at: data.last_checked_at ? new Date(data.last_checked_at) : undefined,
    };
  } catch (error) {
    console.error("Unexpected error fetching link status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Check if link status has changed from previous status
 * Useful for triggering notifications
 */
export function hasStatusChanged(
  previousStatus: LinkStatus,
  newStatus: LinkStatus
): boolean {
  return previousStatus !== newStatus;
}

/**
 * Check if status change should trigger a notification
 * Only notify on transitions to "broken" or "warning"
 */
export function shouldNotify(
  previousStatus: LinkStatus,
  newStatus: LinkStatus
): boolean {
  // Don't notify if status hasn't changed
  if (!hasStatusChanged(previousStatus, newStatus)) {
    return false;
  }

  // Notify when transitioning from active to broken or warning
  if (previousStatus === "active" && (newStatus === "broken" || newStatus === "warning")) {
    return true;
  }

  // Notify when transitioning from checking to broken
  if (previousStatus === "checking" && newStatus === "broken") {
    return true;
  }

  return false;
}
