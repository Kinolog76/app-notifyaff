import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { checkLink } from "@/lib/link-checker-server";
import { getLatestLinkCheck } from "@/lib/supabase/link-checks-server";

/**
 * POST /api/links/[id]/check
 * Manual link check endpoint
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: linkId } = await params;

    // Verify user owns link (RLS handles this)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get link from database by ID
    const { data: link, error: linkError } = await supabase
      .from("links")
      .select("id, url, status")
      .eq("id", linkId)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    // Call link-checker function with link_id
    // Checker saves to link_checks automatically
    const checkResult = await checkLink(link.url, linkId);

    // Get the latest check record
    const latestCheck = await getLatestLinkCheck(linkId);

    // Get updated link data
    const { data: updatedLink } = await supabase
      .from("links")
      .select("status, last_checked_at")
      .eq("id", linkId)
      .single();

    // Return check result + updated link status
    return NextResponse.json(
      {
        message: "Link checked successfully",
        data: {
          linkId,
          url: link.url,
          status: updatedLink?.status || link.status,
          lastCheckedAt: updatedLink?.last_checked_at,
          checkResult: {
            success: checkResult.success,
            finalUrl: checkResult.finalUrl,
            statusCode: checkResult.statusCode,
            responseTime: checkResult.responseTime,
            redirectChain: checkResult.redirectChain,
            error: checkResult.error,
            timestamp: checkResult.timestamp,
          },
          checkRecord: latestCheck,
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
