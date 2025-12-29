import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkLinkWithRetry } from "@/lib/link-checker-retry";
import { storeLinkCheck } from "@/lib/link-check-storage";
import { updateLinkStatusFromCheck } from "@/lib/link-status-updater";

const createLinkSchema = z.object({
  url: z.string().url("Invalid URL format"),
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  short_url: z.string().optional(),
  workspace_id: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check user's plan limits before proceeding
    const { data: settings } = await supabase
      .from('user_settings')
      .select('links_count, links_limit, plan')
      .eq('user_id', user.id)
      .single()

    if (settings && settings.links_count >= settings.links_limit) {
      return NextResponse.json(
        {
          error: 'Link limit exceeded',
          message: `Your ${settings.plan} plan allows ${settings.links_limit} links. Please upgrade to add more.`,
          current: settings.links_count,
          limit: settings.links_limit,
          needsUpgrade: true,
        },
        { status: 403 }
      )
    }

    const body = await request.json();
    const validation = createLinkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { url, name, category, tags, short_url, workspace_id } = validation.data;

    const { data, error } = await supabase
      .from("links")
      .insert({
        user_id: user.id,
        url,
        name,
        category: category || null,
        tags: tags || null,
        short_url: short_url || null,
        workspace_id: workspace_id || null,
        status: "checking",
      })
      .select()
      .single();

    if (error) {
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
        { error: "Failed to create link", details: error.message },
        { status: 500 }
      );
    }

    // Automatic verification: Check the link immediately after creation
    // This runs in the background and doesn't block the response
    const linkId = data.id;
    const linkUrl = data.url;

    // Perform check asynchronously (fire and forget)
    (async () => {
      try {
        console.log(`[Auto-verify] Checking new link: ${linkId}`);
        const checkResult = await checkLinkWithRetry(linkUrl);

        // Store check result
        await storeLinkCheck({ linkId, checkResult });

        // Update link status
        await updateLinkStatusFromCheck(linkId, checkResult);

        console.log(`[Auto-verify] Completed check for link: ${linkId} - Status: ${checkResult.success ? 'success' : 'failed'}`);
      } catch (verifyError) {
        console.error(`[Auto-verify] Failed to verify link ${linkId}:`, verifyError);
        // Don't throw - this is a background operation
      }
    })();

    return NextResponse.json(
      {
        message: "Link created successfully and verification started",
        data,
        verifying: true,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const workspaceId = searchParams.get("workspace_id");

    let query = supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Optional workspace filter - if not provided, returns all links
    if (workspaceId) {
      if (workspaceId === "null" || workspaceId === "none") {
        query = query.is("workspace_id", null);
      } else {
        query = query.eq("workspace_id", workspaceId);
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch links", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
