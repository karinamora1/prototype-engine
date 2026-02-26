import { NextRequest, NextResponse } from "next/server";
import { generateProjectDetailWithAI, projectDetailImageFromQuery } from "@/lib/ai-project-detail";

/**
 * POST /api/generate-project-detail
 * Body: { projectTitle: string, brief: string }
 * Returns { opportunities: { id, title, snippet, concepts: { id, title, overview, image }[] }[] }
 * Agent ingests project title and client brief and fills in 2 opportunity spaces with 3–4 concepts each.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const projectTitle = typeof body.projectTitle === "string" ? body.projectTitle.trim() : "";
    const brief = typeof body.brief === "string" ? body.brief.trim() : "";

    if (!projectTitle) {
      return NextResponse.json({ error: "projectTitle is required" }, { status: 400 });
    }

    const opportunities = await generateProjectDetailWithAI({ projectTitle, brief });

    if (!opportunities) {
      return NextResponse.json(
        { error: "Failed to generate project detail. Check OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const withImages = opportunities.map((opp) => ({
      ...opp,
      concepts: opp.concepts.map((c) => ({
        id: c.id,
        title: c.title,
        overview: c.overview,
        image: projectDetailImageFromQuery(c.imageQuery),
      })),
    }));

    return NextResponse.json({ opportunities: withImages });
  } catch (e) {
    console.error("Generate project detail error:", e);
    return NextResponse.json({ error: "Failed to generate project detail" }, { status: 500 });
  }
}
