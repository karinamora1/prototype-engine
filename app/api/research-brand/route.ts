import { NextRequest, NextResponse } from "next/server";
import { researchBrandWithAI } from "@/lib/ai-research-brand";

export const dynamic = "force-dynamic";

/**
 * POST /api/research-brand
 * Body: { brandName: string, brandWebsiteUrl: string }
 * Returns { clientName, childBrands, space, voice, audience, products, innovationFocus } for pre-filling the Create Prototype form.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const brandName = typeof body.brandName === "string" ? body.brandName.trim() : "";
    const brandWebsiteUrl = typeof body.brandWebsiteUrl === "string" ? body.brandWebsiteUrl.trim() : "";

    if (!brandName) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const result = await researchBrandWithAI(brandName, brandWebsiteUrl || "");

    if (!result) {
      return NextResponse.json(
        { error: "Failed to research brand" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Research brand API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
