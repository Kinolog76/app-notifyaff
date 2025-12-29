import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { checkLinkWithRetry } from "@/lib/link-checker-retry";
import { storeLinkCheck } from "@/lib/link-check-storage";
import { setLinkChecking, updateLinkStatusFromCheck } from "@/lib/link-status-updater";

/**
 * POST /api/links/[id]/check
 * Manual link check endpoint
 * Steps 25-30: Create endpoint, validate ownership, check link, store results, update status
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: linkId } = await params;

    // Step 26: Validate user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Step 26: Validate user owns the link
    const { data: link, error: linkError } = await supabase
      .from("links")
      .select("id, url, user_id, status")
      .eq("id", linkId)
      .eq("user_id", user.id)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        {
          error: "Link not found",
          details: "The requested link does not exist or you don't have permission to access it"
        },
        { status: 404 }
      );
    }

    // Step 22: Mark as "checking" while in progress
    const setCheckingResult = await setLinkChecking(linkId);
    if (!setCheckingResult.success) {
      console.error("Failed to set checking status:", setCheckingResult.error);
      // Continue anyway - this is not critical
    }

    // Step 27: Call link checker function with retry logic (Steps 43-45)
    let checkResult;
    try {
      checkResult = await checkLinkWithRetry(link.url);
    } catch (error) {
      console.error("Link check failed:", error);
      return NextResponse.json(
        {
          error: "Failed to check link",
          details: error instanceof Error ? error.message : "Unknown error occurred"
        },
        { status: 500 }
      );
    }

    // Step 28: Store results in database
    const storageResult = await storeLinkCheck({
      linkId,
      checkResult,
    });

    if (!storageResult.success) {
      console.error("Failed to store check result:", storageResult.error);
      // Continue to update status even if storage fails
    }

    // Step 29: Update link status (with notification trigger)
    const statusResult = await updateLinkStatusFromCheck(linkId, checkResult, user.id);

    if (!statusResult.success) {
      console.error("Failed to update link status:", statusResult.error);
      return NextResponse.json(
        {
          error: "Failed to update link status",
          details: statusResult.error
        },
        { status: 500 }
      );
    }

    // Step 30: Return results to frontend
    return NextResponse.json(
      {
        message: "Link checked successfully",
        data: {
          linkId,
          url: link.url,
          status: statusResult.status,
          checkResult: {
            success: checkResult.success,
            finalUrl: checkResult.finalUrl,
            statusCode: checkResult.statusCode,
            responseTime: checkResult.responseTime,
            redirectChain: checkResult.redirectChain,
            error: checkResult.error,
            timestamp: checkResult.timestamp,
            retryCount: checkResult.retryCount,
            confidenceScore: checkResult.confidenceScore,
          },
          checkRecord: storageResult.data,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in check endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/links/[id]/check
 * Get the latest check result for a link
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: linkId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate user owns the link
    const { data: link, error: linkError } = await supabase
      .from("links")
      .select("id, user_id")
      .eq("id", linkId)
      .eq("user_id", user.id)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    // Get the latest check result
    const { data: latestCheck, error: checkError } = await supabase
      .from("link_checks")
      .select("*")
      .eq("link_id", linkId)
      .order("checked_at", { ascending: false })
      .limit(1)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        // No checks found
        return NextResponse.json(
          {
            message: "No check results found for this link",
            data: null
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch check result", details: checkError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Check result retrieved successfully",
        data: latestCheck
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error fetching check result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
