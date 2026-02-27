import { NextRequest, NextResponse } from "next/server";
import { enrichProjectForInnovationFlow } from "@/lib/ai-enrich-project";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunities } = body;

    if (!Array.isArray(opportunities) || opportunities.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty opportunities array" },
        { status: 400 }
      );
    }

    const enriched = await enrichProjectForInnovationFlow(opportunities);

    if (!enriched) {
      return NextResponse.json(
        { error: "Failed to enrich project data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ opportunities: enriched });
  } catch (error) {
    console.error("Enrich project API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
