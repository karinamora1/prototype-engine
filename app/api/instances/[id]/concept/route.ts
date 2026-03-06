import { NextRequest, NextResponse } from "next/server";
import { updateInstanceConcept } from "@/lib/instance-store";
import { uploadInstanceImage } from "@/lib/instance-image-storage";

/**
 * PATCH /api/instances/[id]/concept
 * Body: { opportunityId: string, conceptId: string, title?: string, overview?: string, image?: string }
 * Updates only the specified concept. Reads/writes only first_recent_project_data (no full instance load).
 * Returns { firstRecentProjectDetail } so the client can merge into instance state.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const opportunityId = typeof body.opportunityId === "string" ? body.opportunityId.trim() : "";
    const conceptId = typeof body.conceptId === "string" ? body.conceptId.trim() : "";
    if (!opportunityId || !conceptId) {
      return NextResponse.json({ error: "opportunityId and conceptId required" }, { status: 400 });
    }
    const patch: { title?: string; overview?: string; image?: string } = {};
    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.overview === "string") patch.overview = body.overview;
    if (typeof body.image === "string") {
      // Upload data URLs to Supabase Storage and store the public URL
      patch.image = await uploadInstanceImage(
        id,
        `concepts/${opportunityId}-${conceptId}`,
        body.image
      );
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "At least one of title, overview, or image required" }, { status: 400 });
    }

    const firstRecentProjectDetail = await updateInstanceConcept(id, opportunityId, conceptId, patch);
    if (!firstRecentProjectDetail) {
      return NextResponse.json({ error: "Instance or concept not found" }, { status: 404 });
    }
    return NextResponse.json({ firstRecentProjectDetail });
  } catch (e) {
    console.error("PATCH concept error:", e);
    return NextResponse.json({ error: "Failed to update concept" }, { status: 500 });
  }
}
