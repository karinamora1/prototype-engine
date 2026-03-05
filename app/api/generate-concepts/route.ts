import { NextRequest, NextResponse } from "next/server";
import { generateConceptsWithAI, conceptImageFromQuery } from "@/lib/ai-concepts";
import { generateConceptImageFromContent } from "@/lib/ai-concept-image";

/**
 * POST /api/generate-concepts
 * Body: { opportunityId, title, snippet, benefits?, consumerGoals?, painPoints?, markets?, childBrands?: { name: string; description: string }[] }
 * Returns { concepts: { id, opportunityId, title, image, ... }[] } (5 items).
 * When childBrands is provided, each concept is assigned to a different child brand and informed by its description.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const opportunityId = typeof body.opportunityId === "string" ? body.opportunityId.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "Opportunity";
    const snippet = typeof body.snippet === "string" ? body.snippet.trim() : "";
    const benefits = Array.isArray(body.benefits) ? body.benefits.map((b: unknown) => String(b ?? "").trim()).filter(Boolean) : [];
    const consumerGoals = Array.isArray(body.consumerGoals) ? body.consumerGoals.map((g: unknown) => String(g ?? "").trim()).filter(Boolean) : [];
    const painPoints = Array.isArray(body.painPoints) ? body.painPoints.map((p: unknown) => String(p ?? "").trim()).filter(Boolean) : [];
    const childBrandsRaw = body.childBrands;
    const childBrands: { name: string; description: string }[] = Array.isArray(childBrandsRaw)
      ? childBrandsRaw
          .map((b: unknown) => {
            if (b && typeof b === "object" && "name" in b) {
              const name = String((b as { name?: unknown }).name ?? "").trim();
              if (!name) return null;
              const description = String((b as { description?: unknown }).description ?? "").trim();
              return { name, description };
            }
            return null;
          })
          .filter(Boolean) as { name: string; description: string }[]
      : [];
    const markets = [
      { id: "USA", market: "United States", alignment: "Great consumer alignment", nuances: ["Relevant market nuances."] },
      { id: "JPN", market: "Japan", alignment: "Fair consumer alignment", nuances: ["Relevant market nuances."] },
      { id: "DEU", market: "Germany", alignment: "Fair consumer alignment", nuances: ["Relevant market nuances."] },
    ];

    if (!opportunityId) {
      return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
    }

    const contents = await generateConceptsWithAI(
      {
        title,
        snippet,
        benefits,
        consumerGoals,
        painPoints,
        markets,
      },
      childBrands.length > 0 ? childBrands : undefined
    );

    // Five visual agents in parallel: one image per concept from title, description, and brand info
    const imageUrls = await Promise.all(
      contents.map((c) =>
        generateConceptImageFromContent(
          c.title,
          c.overview || c.shortSummary,
          c.brandName != null && c.brandDescription != null
            ? { name: c.brandName, description: c.brandDescription }
            : undefined
        )
      )
    );
    const baseId = `gen-${Date.now()}`;
    const concepts = contents.map((c, i) => {
      const generatedImage = imageUrls[i];
      return {
        id: `${baseId}-${i}`,
        opportunityId,
        title: c.title,
        image: generatedImage ?? conceptImageFromQuery(c.imageQuery),
        shortSummary: c.shortSummary,
        overview: c.overview,
        variations: c.variations,
        painPointsSolved: c.painPointsSolved,
        consumerGoal: c.consumerGoal,
        painPoints: c.painPoints,
        opportunityScore: c.opportunityScore,
        pricePackSizeOptions: c.pricePackSizeOptions,
      };
    });

    return NextResponse.json({ concepts });
  } catch (e) {
    console.error("Generate concepts error:", e);
    return NextResponse.json({ error: "Failed to generate concepts" }, { status: 500 });
  }
}
