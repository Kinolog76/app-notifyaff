import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { bulkImportLimiter, getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { checkLinkWithRetry } from "@/lib/link-checker-retry";
import { storeLinkCheck } from "@/lib/link-check-storage";
import { updateLinkStatusFromCheck } from "@/lib/link-status-updater";

const bulkImportSchema = z.object({
  links: z.array(
    z.object({
      url: z.string().url("Invalid URL format"),
      name: z.string().min(1, "Name is required"),
      category: z.string().optional(),
      tags: z.string().optional(),
    })
  ),
  workspaceId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting check (per user)
    const { success, limit, remaining, reset } = await checkRateLimit(
      bulkImportLimiter,
      user.id
    );

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many bulk imports",
          message: "You have exceeded the bulk import rate limit. Please try again later.",
          limit,
          remaining,
          reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit?.toString() || "0",
            "X-RateLimit-Remaining": remaining?.toString() || "0",
            "X-RateLimit-Reset": reset?.toString() || "0",
          },
        }
      );
    }

    const body = await request.json();
    const validation = bulkImportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { links, workspaceId } = validation.data;

    if (links.length === 0) {
      return NextResponse.json(
        { error: "No links provided" },
        { status: 400 }
      );
    }

    // Check user's plan limits before proceeding
    const { data: settings } = await supabase
      .from('user_settings')
      .select('links_count, links_limit, plan')
      .eq('user_id', user.id)
      .single()

    if (settings) {
      const newTotal = settings.links_count + links.length
      if (newTotal > settings.links_limit) {
        return NextResponse.json(
          {
            error: 'Link limit exceeded',
            message: `Your ${settings.plan} plan allows ${settings.links_limit} links. You currently have ${settings.links_count} and are trying to add ${links.length} more.`,
            current: settings.links_count,
            limit: settings.links_limit,
            requestedAmount: links.length,
            needsUpgrade: true,
          },
          { status: 403 }
        )
      }
    }

    // Prepare links for insertion
    const linksToInsert = links.map((link) => ({
      user_id: user.id,
      url: link.url,
      name: link.name,
      category: link.category || null,
      tags: link.tags ? link.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
      status: "checking",
      workspace_id: workspaceId || null,
    }));

    // Insert all links in a single query
    const { data, error } = await supabase
      .from("links")
      .insert(linksToInsert)
      .select();

    if (error) {
      console.error("Database error:", error);
      // Database trigger might also throw limit error
      if (error.message.includes('Link limit exceeded')) {
        return NextResponse.json(
          {
            error: 'Link limit exceeded',
            message: error.message,
            needsUpgrade: true,
          },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: "Failed to import links", details: error.message },
        { status: 500 }
      );
    }

    // Automatic verification: Check all imported links in background
    // Process in batches to avoid overwhelming the system
    (async () => {
      try {
        console.log(`[Auto-verify] Starting verification of ${data.length} bulk imported links`);

        for (const link of data) {
          try {
            const checkResult = await checkLinkWithRetry(link.url);
            await storeLinkCheck({ linkId: link.id, checkResult });
            await updateLinkStatusFromCheck(link.id, checkResult);

            console.log(`[Auto-verify] Verified bulk link: ${link.id}`);
          } catch (linkError) {
            console.error(`[Auto-verify] Failed to verify bulk link ${link.id}:`, linkError);
            // Continue with next link
          }

          // Small delay between checks to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(`[Auto-verify] Completed verification of bulk imported links`);
      } catch (verifyError) {
        console.error('[Auto-verify] Bulk verification failed:', verifyError);
      }
    })();

    return NextResponse.json(
      {
        message: `Successfully imported ${data.length} link${
          data.length !== 1 ? "s" : ""
        } and verification started`,
        data,
        verifying: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
