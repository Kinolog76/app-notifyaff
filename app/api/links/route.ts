import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const createLinkSchema = z.object({
  url: z.string().url("Invalid URL format"),
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

    const body = await request.json();
    const validation = createLinkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { url, category, tags, short_url, workspace_id } = validation.data;

    const { data, error } = await supabase
      .from("links")
      .insert({
        user_id: user.id,
        url,
        category: category || null,
        tags: tags || null,
        short_url: short_url || null,
        workspace_id: workspace_id || null,
        status: "checking",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create link", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Link created successfully", data },
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
