import { NextRequest, NextResponse } from "next/server";
import { listInstances, searchInstances } from "@/lib/instance-store";

/** Opt out of static prerender so searchParams can be used. */
export const dynamic = "force-dynamic";

/**
 * GET /api/instances?q=search
 * Returns list of instances (id, name, slug, createdAt) for the library.
 */
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? "";
    const list = q.trim() ? await searchInstances(q) : await listInstances();
    return NextResponse.json(list);
  } catch (e) {
    console.error("List instances error:", e);
    return NextResponse.json({ error: "Failed to list instances" }, { status: 500 });
  }
}
