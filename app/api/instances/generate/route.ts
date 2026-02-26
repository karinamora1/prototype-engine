import { NextRequest, NextResponse } from "next/server";
import { parseBriefFromTextWithAI } from "@/lib/brief-parser";
import { createInstance } from "@/lib/instance-store";
import type { CreateInstanceInput, FirstRecentProjectDetail } from "@/lib/types";
import { analyzeThemeImage } from "@/lib/ai-theme-from-image";
import { generateProjectDetailWithAI, projectDetailImageFromQuery } from "@/lib/ai-project-detail";
import { generateConceptImagesInParallel } from "@/lib/ai-concept-image";

/**
 * POST /api/instances/generate
 * Body: { brief, password?, clientName?, childrenBrands?, uiScheme?, themeImage?, wordmarkImage? (data URL), logoImage? (data URL = logomark/icon), overrides? }
 * If themeImage is provided, an AI analyzes it and appends the color-scheme prompt to uiScheme.
 * Generates first-recent-project detail (2 opportunities + concepts) from the brief and stores it on the instance.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const briefText: string = body.brief ?? body.text ?? "";
    const password: string | undefined = body.password;
    const clientName: string | undefined = body.clientName?.trim() || undefined;
    const childrenBrands: string | undefined = body.childrenBrands?.trim() || undefined;
    let uiScheme: string | undefined = body.uiScheme?.trim() || undefined;
    const themeImage: string | undefined = body.themeImage;
    const wordmarkImage: string | undefined = body.wordmarkImage;
    const logoImage: string | undefined = body.logoImage; // logomark/icon
    const overrides: Partial<CreateInstanceInput> = body.overrides ?? {};

    if (!briefText.trim()) {
      return NextResponse.json({ error: "No brief content provided" }, { status: 400 });
    }

    if (themeImage && typeof themeImage === "string") {
      const analyzed = await analyzeThemeImage(themeImage);
      if (analyzed) {
        uiScheme = uiScheme ? `${uiScheme}\n${analyzed}` : analyzed;
      }
    }

    const parsed = await parseBriefFromTextWithAI(briefText, { clientName, childrenBrands, uiScheme });
    const content = overrides.content ?? parsed.content;
    const input: CreateInstanceInput = {
      name: overrides.name ?? parsed.name,
      theme: overrides.theme ?? parsed.theme,
      brand: overrides.brand ?? {
        ...parsed.brand,
        wordmarkUrl: wordmarkImage && typeof wordmarkImage === "string" ? wordmarkImage : parsed.brand.wordmarkUrl,
        logoUrl: logoImage && typeof logoImage === "string" ? logoImage : parsed.brand.logoUrl,
      },
      content,
      features: overrides.features ?? parsed.features,
      password,
      briefSummary: briefText.slice(0, 500),
    };

    const firstProjectName = (content.recentProject1 as string)?.trim() || input.name;
    const opportunities = await generateProjectDetailWithAI({
      projectTitle: firstProjectName,
      brief: briefText,
    });
    if (opportunities && opportunities.length >= 2) {
      const allConcepts = opportunities.flatMap((opp) =>
        opp.concepts.map((c) => ({ title: c.title, description: c.overview }))
      );
      const imageUrls = await generateConceptImagesInParallel(allConcepts);
      let idx = 0;
      const firstRecentProjectDetail: FirstRecentProjectDetail = {
        projectTitle: firstProjectName,
        opportunities: opportunities.map((opp) => ({
          ...opp,
          concepts: opp.concepts.map((c) => {
            const url = imageUrls[idx] ?? projectDetailImageFromQuery(c.imageQuery);
            idx += 1;
            return {
              id: c.id,
              title: c.title,
              overview: c.overview,
              image: url,
            };
          }),
        })),
      };
      input.firstRecentProjectDetail = firstRecentProjectDetail;
    }

    const instance = await createInstance(input);
    return NextResponse.json(instance);
  } catch (e) {
    console.error("Generate error:", e);
    return NextResponse.json({ error: "Failed to generate instance" }, { status: 500 });
  }
}
