import { NextRequest, NextResponse } from "next/server";
import { generateOpportunitySpacesWithAI, imageUrlFromQuery } from "@/lib/ai-opportunity-spaces";
import { generateOpportunityImageFromContent } from "@/lib/ai-opportunity-image";

/**
 * POST /api/generate-opportunity-spaces
 * Body: { subject: string, insights: { title, description, category? }[] }
 * Returns { opportunitySpaces: { id, title, snippet, score, image }[] } (4 items).
 * For the first two spaces, the header image is AI-generated from title, description, and benefits; for 3–4, a stock image URL is used.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const insights = Array.isArray(body.insights)
      ? body.insights
          .filter((i: unknown) => i && typeof i === "object" && "title" in i)
          .map((i: { title?: string; description?: string; category?: string }) => ({
            title: String(i.title ?? "").trim(),
            description: String(i.description ?? "").trim(),
            category: i.category,
          }))
      : [];

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    const spaces = await generateOpportunitySpacesWithAI({
      subject,
      insights: insights.slice(0, 4),
    });

    if (!spaces) {
      return NextResponse.json({ error: "Failed to generate opportunity spaces" }, { status: 500 });
    }

    const opportunitySpaces = await Promise.all(
      spaces.map(async (s, i) => {
        const id = String(i + 1);
        const title = s.title;
        const snippet = s.description;
        const score = s.score ?? 70 - i * 10;
        const benefits = s.benefits ?? [];
        const consumerGoals = s.consumerGoals ?? [];
        const painPoints = s.painPoints ?? [];
        const markets = s.markets ?? [];
        const fallbackImage = imageUrlFromQuery(s.imageQuery);

        let image = fallbackImage;
        if (i < 2 && title && (snippet || benefits.length > 0)) {
          const generatedUrl = await generateOpportunityImageFromContent(title, snippet, benefits);
          if (generatedUrl) image = generatedUrl;
        }

        return {
          id,
          title,
          snippet,
          score,
          image,
          benefits,
          consumerGoals,
          painPoints,
          markets,
        };
      })
    );

    return NextResponse.json({ opportunitySpaces });
  } catch (e) {
    console.error("Generate opportunity spaces error:", e);
    return NextResponse.json({ error: "Failed to generate opportunity spaces" }, { status: 500 });
  }
}
