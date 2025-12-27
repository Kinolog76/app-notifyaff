import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().default("#3b82f6"),
  is_default: z.boolean().optional(),
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

    const body = await request.json();
    const validation = createWorkspaceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, description, icon, color, is_default } = validation.data;

    const { data, error } = await supabase
      .from("workspaces")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        icon: icon || null,
        color,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create workspace", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Workspace created successfully", data },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: workspaces, error } = await supabase
      .from("workspaces")
      .select(
        `
        *,
        links:links(count)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch workspaces", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: workspaces }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
