import { NextRequest, NextResponse } from "next/server";
import { getInstance, verifyPassword } from "@/lib/instance-store";

/**
 * POST /api/instances/[id]/verify
 * Body: { password: string }
 * Returns { ok: true } if no password or password matches.
 */
export async function POST(
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
    const password: string = body.password ?? "";
    const ok = verifyPassword(instance, password);
    return NextResponse.json({ ok });
  } catch (e) {
    console.error("Verify error:", e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
