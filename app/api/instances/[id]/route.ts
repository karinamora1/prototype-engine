import { NextRequest, NextResponse } from "next/server";
import { getInstance, deleteInstance, updateInstance } from "@/lib/instance-store";

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
 * Body: { theme?: { colors?: Partial<BrandTheme["colors"]> } }
 * Updates instance theme colors and returns the full instance (without password hash).
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
    if (!themeUpdates || typeof themeUpdates !== "object") {
      return NextResponse.json({ error: "theme object required" }, { status: 400 });
    }
    const updated = await updateInstance(id, {
      theme: {
        colors: themeUpdates.colors && typeof themeUpdates.colors === "object" ? themeUpdates.colors : undefined,
      },
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
