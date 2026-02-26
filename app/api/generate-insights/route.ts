import { NextRequest, NextResponse } from "next/server";
import { generateInsightsWithAI } from "@/lib/ai-insights";

/**
 * POST /api/generate-insights
 * Body: { scopeChoice: "narrow" | "broad", customFocus?: string, focusPills?: string[], selectedGlobalInsight?: { type, title, description }, selectedCrossInsight?: { index, title, description } }
 * Returns { insights: { title, description, category }[] } (4 items).
 * Used when user clicks Next on Choose data sources to generate Insights Studio content from research scope.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const scopeChoice = body.scopeChoice === "narrow" || body.scopeChoice === "broad" ? body.scopeChoice : "broad";
    const customFocus = typeof body.customFocus === "string" ? body.customFocus : undefined;
    const focusPills = Array.isArray(body.focusPills)
      ? body.focusPills.filter((p: unknown) => typeof p === "string").map((p: string) => p.trim()).filter(Boolean)
      : undefined;

    const rawGlobal = body.selectedGlobalInsight;
    const selectedGlobalInsight =
      rawGlobal && typeof rawGlobal === "object" && typeof rawGlobal.title === "string" && rawGlobal.title.trim()
        ? {
            type: String(rawGlobal.type ?? "Global").trim(),
            title: String(rawGlobal.title).trim(),
            description: String(rawGlobal.description ?? "").trim(),
          }
        : undefined;

    const rawCross = body.selectedCrossInsight;
    const selectedCrossInsight =
      rawCross && typeof rawCross === "object" && typeof rawCross.title === "string" && rawCross.title.trim()
        ? {
            index: typeof rawCross.index === "number" ? rawCross.index : 0,
            title: String(rawCross.title).trim(),
            description: String(rawCross.description ?? "").trim(),
          }
        : undefined;

    const insights = await generateInsightsWithAI({
      scopeChoice,
      customFocus,
      focusPills,
      selectedGlobalInsight,
      selectedCrossInsight,
    });

    if (!insights) {
      return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
    }

    return NextResponse.json({ insights });
  } catch (e) {
    console.error("Generate insights error:", e);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
