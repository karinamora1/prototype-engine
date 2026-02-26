import { NextRequest, NextResponse } from "next/server";
import { generateConceptsWithAI, conceptImageFromQuery } from "@/lib/ai-concepts";
import { generateConceptImageFromContent } from "@/lib/ai-concept-image";

/**
 * POST /api/generate-concepts
 * Body: { opportunityId: string, title: string, snippet: string, benefits?: string[], consumerGoals?: string[], painPoints?: string[], markets?: { id, market, alignment, nuances[] }[] }
 * Returns { concepts: { id, opportunityId, title, image, shortSummary, overview, variations, painPointsSolved, consumerGoal, painPoints, opportunityScore }[] } (5 items).
 * Flow: (1) One ideation agent creates 5 concept seeds (title + 1–2 line description) from the opportunity space, increasingly differentiated from safe to out-there. (2) Five detail agents in parallel flesh out each seed using opportunity context; then five visual agents run in parallel for header images.
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
    // Markets are fixed across opportunity spaces and concepts
    const markets = [
      { id: "USA", market: "United States", alignment: "Great consumer alignment", nuances: ["Relevant market nuances."] },
      { id: "JPN", market: "Japan", alignment: "Fair consumer alignment", nuances: ["Relevant market nuances."] },
      { id: "DEU", market: "Germany", alignment: "Fair consumer alignment", nuances: ["Relevant market nuances."] },
    ];

    if (!opportunityId) {
      return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
    }

    const contents = await generateConceptsWithAI({
      title,
      snippet,
      benefits,
      consumerGoals,
      painPoints,
      markets,
    });

    // Five visual agents in parallel: one image per concept from title + description
    const imageUrls = await Promise.all(
      contents.map((c) => generateConceptImageFromContent(c.title, c.overview || c.shortSummary))
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
