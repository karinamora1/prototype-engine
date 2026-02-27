import { NextRequest, NextResponse } from "next/server";
import { getInstance, deleteInstance, updateInstance, duplicateInstance, updateIndexEntry } from "@/lib/instance-store";

/**
 * GET /api/instances/[id]
 * Returns full instance (for viewing). Password check is done in verify route.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const instance = await getInstance(id);
    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }
    // Don't expose password hash to client
    const { passwordHash, ...safe } = instance;
    return NextResponse.json({ ...safe, passwordProtected: !!passwordHash });
  } catch (e) {
    console.error("Get instance error:", e);
    return NextResponse.json({ error: "Failed to load instance" }, { status: 500 });
  }
}

/**
 * PATCH /api/instances/[id]
 * Body: { theme?: { colors?: Partial<BrandTheme["colors"]> }, content?: Partial<ContentMap> }
 * Updates this instance only (theme and/or content). Does not modify the base prototype or default config.
 * Returns the full instance (without password hash).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const instance = await getInstance(id);
    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }
    const body = await request.json().catch(() => ({}));
    const themeUpdates = body.theme;
    const contentUpdates = body.content;
    const hasTheme = themeUpdates && typeof themeUpdates === "object";
    const hasContent = contentUpdates != null && typeof contentUpdates === "object";
    if (!hasTheme && !hasContent) {
      return NextResponse.json({ error: "theme or content object required" }, { status: 400 });
    }
    const updated = await updateInstance(id, {
      theme: hasTheme
        ? {
            colors: themeUpdates.colors && typeof themeUpdates.colors === "object" ? themeUpdates.colors : undefined,
          }
        : undefined,
      content: hasContent ? contentUpdates : undefined,
    });
    if (!updated) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }
    const { passwordHash, ...safe } = updated;
    return NextResponse.json({ ...safe, passwordProtected: !!passwordHash });
  } catch (e) {
    console.error("Patch instance error:", e);
    return NextResponse.json({ error: "Failed to update instance" }, { status: 500 });
  }
}

/**
 * DELETE /api/instances/[id]
 * Permanently deletes the instance and all its data.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteInstance(id);
    if (!deleted) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete instance error:", e);
    return NextResponse.json({ error: "Failed to delete instance" }, { status: 500 });
  }
}

/**
 * POST /api/instances/[id]/publish
 * Body: { name: string, password?: string }
 * Creates a copy of this instance with the given page name and optional password.
 * Returns the new instance (with slug) for the published URL /p/[slug].
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const password = typeof body.password === "string" && body.password.trim() 
      ? body.password.trim() 
      : undefined;
    const published = await duplicateInstance(id, { name, password });
    if (!published) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }
    await updateInstance(id, { publishedSlug: published.slug });
    await updateIndexEntry(id, { publishedSlug: published.slug });
    const { passwordHash, ...safe } = published;
    return NextResponse.json({ ...safe, passwordProtected: !!passwordHash });
  } catch (e) {
    console.error("Publish instance error:", e);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}
