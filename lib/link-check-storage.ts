import { createClient } from "@/utils/supabase/server";
import { LinkCheckResult } from "./link-checker";
import { RetryCheckResult } from "./link-checker-retry";

export interface LinkCheckRecord {
  id?: string;
  link_id: string;
  status_code: number | null;
  response_time_ms: number;
  error_message: string | null;
  redirect_chain: string[];
  checked_at: Date;
  retry_count?: number;
  confidence_score?: number;
  retry_history?: any;
}

export interface StoreLinkCheckParams {
  linkId: string;
  checkResult: LinkCheckResult | RetryCheckResult;
}

/**
 * Store link check results in the database
 * Steps 11-17: Store all check data including timestamp, status code,
 * response time, redirect chain, and error messages
 * Step 46: Store retry attempts in check record
 */
export async function storeLinkCheck({
  linkId,
  checkResult,
}: StoreLinkCheckParams): Promise<{ success: boolean; error?: string; data?: LinkCheckRecord }> {
  try {
    const supabase = await createClient();

    // Check if this is a RetryCheckResult with retry information
    const isRetryResult = 'retryCount' in checkResult;

    // Prepare the record data
    const checkRecord: any = {
      link_id: linkId,
      status_code: checkResult.statusCode,
      response_time_ms: checkResult.responseTime,
      error_message: checkResult.error || null,
      redirect_chain: checkResult.redirectChain,
      checked_at: checkResult.timestamp,
    };

    // Add retry information if available (Step 46)
    if (isRetryResult) {
      const retryResult = checkResult as RetryCheckResult;
      checkRecord.retry_count = retryResult.retryCount;
      checkRecord.confidence_score = retryResult.confidenceScore;
      checkRecord.retry_history = retryResult.retryHistory || null;
    }

    // Insert the check record into the link_checks table
    const { data, error } = await supabase
      .from("link_checks")
      .insert(checkRecord)
      .select()
      .single();

    if (error) {
      console.error("Failed to store link check:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data as LinkCheckRecord,
    };
  } catch (error) {
    console.error("Unexpected error storing link check:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Store link check and return the record
 * Convenience function that throws on error
 */
export async function storeLinkCheckOrThrow(
  params: StoreLinkCheckParams
): Promise<LinkCheckRecord> {
  const result = await storeLinkCheck(params);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to store link check");
  }

  return result.data;
}

/**
 * Get recent check history for a link
 * @param linkId The link ID to fetch checks for
 * @param limit Maximum number of checks to return (default: 10)
 */
export async function getLinkCheckHistory(
  linkId: string,
  limit: number = 10
): Promise<{ success: boolean; error?: string; data?: LinkCheckRecord[] }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("link_checks")
      .select("*")
      .eq("link_id", linkId)
      .order("checked_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch link check history:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data as LinkCheckRecord[],
    };
  } catch (error) {
    console.error("Unexpected error fetching link check history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get the most recent check for a link
 */
export async function getLatestLinkCheck(
  linkId: string
): Promise<{ success: boolean; error?: string; data?: LinkCheckRecord }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("link_checks")
      .select("*")
      .eq("link_id", linkId)
      .order("checked_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No data found is not an error
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: undefined,
        };
      }

      console.error("Failed to fetch latest link check:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data as LinkCheckRecord,
    };
  } catch (error) {
    console.error("Unexpected error fetching latest link check:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
