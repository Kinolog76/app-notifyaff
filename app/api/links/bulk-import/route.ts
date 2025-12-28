import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bulkImportSchema = z.object({
  links: z.array(
    z.object({
      url: z.string().url("Invalid URL format"),
      name: z.string().min(1, "Name is required"),
      category: z.string().optional(),
      tags: z.string().optional(),
    })
  ),
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
    const validation = bulkImportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { links } = validation.data;

    if (links.length === 0) {
      return NextResponse.json(
        { error: "No links provided" },
        { status: 400 }
      );
    }

    // Prepare links for insertion
    const linksToInsert = links.map((link) => ({
      user_id: user.id,
      url: link.url,
      name: link.name,
      category: link.category || null,
      tags: link.tags ? link.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
      status: "checking",
    }));

    // Insert all links in a single query
    const { data, error } = await supabase
      .from("links")
      .insert(linksToInsert)
      .select();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to import links", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Successfully imported ${data.length} link${
          data.length !== 1 ? "s" : ""
        }`,
        data,
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
