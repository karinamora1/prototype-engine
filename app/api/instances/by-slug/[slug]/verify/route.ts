import { NextRequest, NextResponse } from "next/server";
import { getInstanceBySlug, verifyPassword } from "@/lib/instance-store";

/**
 * POST /api/instances/by-slug/[slug]/verify
 * Body: { password: string }
 * Returns { ok: true } if no password or password matches (for published page).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const instance = await getInstanceBySlug(slug);
    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }
    const body = await request.json().catch(() => ({}));
    const password: string = body.password ?? "";
    const ok = verifyPassword(instance, password);
    return NextResponse.json({ ok });
  } catch (e) {
    console.error("Verify by slug error:", e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
