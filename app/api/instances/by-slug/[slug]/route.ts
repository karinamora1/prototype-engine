import { NextRequest, NextResponse } from "next/server";
import { getInstanceBySlug } from "@/lib/instance-store";

/**
 * GET /api/instances/by-slug/[slug]
 * Returns full instance by slug (for published view /p/[slug]).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const instance = await getInstanceBySlug(slug);
    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }
    const { passwordHash, ...safe } = instance;
    return NextResponse.json({ ...safe, passwordProtected: !!passwordHash });
  } catch (e) {
    console.error("Get instance by slug error:", e);
    return NextResponse.json({ error: "Failed to load instance" }, { status: 500 });
  }
}
