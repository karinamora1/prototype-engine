import { NextRequest, NextResponse } from "next/server";
import { getInstance } from "@/lib/instance-store";

/**
 * GET /api/instances/[id]/download
 * Downloads a single instance as a JSON file so it can be used as a
 * standalone project configuration outside this environment.
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

    // Strip password hash before exporting.
    const { passwordHash, ...safe } = instance;
    const slug = (safe as { slug?: string }).slug ?? id;
    const filename = `instance-${slug}.json`;
    const body = JSON.stringify(safe, null, 2);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    console.error("Download instance error:", e);
    return NextResponse.json({ error: "Failed to download project" }, { status: 500 });
  }
}

