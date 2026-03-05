import { NextRequest, NextResponse } from "next/server";
import { parseBriefFromTextWithAI } from "@/lib/brief-parser";
import { createInstance, updateInstance } from "@/lib/instance-store";
import type { CreateInstanceInput, FirstRecentProjectDetail, PreGeneratedFlowData } from "@/lib/types";
import { analyzeThemeImage } from "@/lib/ai-theme-from-image";
import { generateProjectDetailWithAI, projectDetailImageFromQuery } from "@/lib/ai-project-detail";
import { generateConceptImagesInParallel } from "@/lib/ai-concept-image";
import { enrichProjectForInnovationFlow } from "@/lib/ai-enrich-project";
import { generateInsightsWithAI } from "@/lib/ai-insights";
import {
  generateOpportunitySpacesWithAI,
  imageUrlFromQuery,
  type GeneratedOpportunitySpace,
} from "@/lib/ai-opportunity-spaces";
import { generateOpportunityImageFromContent } from "@/lib/ai-opportunity-image";
import {
  generateConceptsWithAI,
  conceptImageFromQuery,
  type OpportunityContext,
  type ChildBrand,
} from "@/lib/ai-concepts";
import {
  generateConceptImagePrompt,
  generateConceptHeaderImageWithOpenAI,
  generateConceptHeaderImage,
} from "@/lib/ai-concept-image";

/**
 * POST /api/instances/generate
 * Body: { brief, password?, clientName?, childBrands?: { name: string; description: string }[], uiScheme?, themeImage?, wordmarkImage? (data URL), logoImage? (data URL = logomark/icon), overrides? }
 * If themeImage is provided, an AI analyzes it and appends the color-scheme prompt to uiScheme.
 * Generates first-recent-project detail (2 opportunities + concepts) from the brief and stores it on the instance.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const briefText: string = body.brief ?? body.text ?? "";
    const password: string | undefined = body.password;
    const clientName: string | undefined = body.clientName?.trim() || undefined;
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
    const childrenBrands = childBrands.length ? childBrands.map((b) => b.name).join(", ") : (body.childrenBrands as string)?.trim() || undefined;
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
    if (childBrands.length > 0) {
      content.brandOptions = childBrands.map((b) => b.name).join(", ");
      content.childBrandsJson = JSON.stringify(childBrands);
    }
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
      childBrands: childBrands.length > 0 ? childBrands : undefined,
    });
    if (opportunities && opportunities.length >= 2) {
      const allConcepts = opportunities.flatMap((opp) =>
        opp.concepts.map((c) => ({ title: c.title, description: c.overview }))
      );
      const imageUrls = await generateConceptImagesInParallel(allConcepts);
      let idx = 0;
      const basicOpportunities = opportunities.map((opp) => ({
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
      }));

      // Enrich the opportunities for innovation flow (adds all strategic details)
      const enrichedOpportunities = await enrichProjectForInnovationFlow(basicOpportunities);

      const firstRecentProjectDetail: FirstRecentProjectDetail = {
        projectTitle: firstProjectName,
        opportunities: basicOpportunities,
        enrichedForInnovationFlow: enrichedOpportunities ? { opportunities: enrichedOpportunities } : undefined,
      };
      input.firstRecentProjectDetail = firstRecentProjectDetail;
    }

    // Create instance first (avoids DB statement timeout during long pre-generation)
    const instance = await createInstance(input);

    // Pre-generate flow data for first focus pill (demo); then update instance
    try {
      const insights = await generateInsightsWithAI({ scopeChoice: "broad" });
      if (insights && insights.length >= 4) {
        const subject = (content.recentProject1 as string)?.trim() || input.name || briefText.slice(0, 200);
        const spaces = await generateOpportunitySpacesWithAI({
          subject,
          insights: insights.map((i) => ({ title: i.title, description: i.description, category: i.category })),
        });
        if (spaces && spaces.length >= 4) {
          const opportunitySpacesWithImages: PreGeneratedFlowData["opportunitySpaces"] = await Promise.all(
            spaces.map(async (s: GeneratedOpportunitySpace, i: number) => {
              const id = String(i + 1);
              const title = s.title;
              const snippet = s.description ?? "";
              const score = s.score ?? 70 - i * 10;
              const benefits = s.benefits ?? [];
              const consumerGoals = s.consumerGoals ?? [];
              const painPoints = s.painPoints ?? [];
              const markets = s.markets ?? [];
              let image = imageUrlFromQuery(s.imageQuery);
              if (i < 2 && (snippet || benefits.length > 0)) {
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

          const firstOpp = opportunitySpacesWithImages[0];
          const childBrandsForConcepts: ChildBrand[] = childBrands;
          const context: OpportunityContext = {
            title: firstOpp.title,
            snippet: firstOpp.snippet,
            benefits: firstOpp.benefits,
            consumerGoals: firstOpp.consumerGoals,
            painPoints: firstOpp.painPoints,
            markets: firstOpp.markets ?? [],
          };
          const contents = await generateConceptsWithAI(context, childBrandsForConcepts.length > 0 ? childBrandsForConcepts : undefined);
          const brandByName = new Map<string, ChildBrand>();
          childBrandsForConcepts.forEach((b) => brandByName.set(b.name.trim(), b));
          const imagePrompts = await Promise.all(
            contents.slice(0, 5).map((c, i) => {
              const content = contents[i] as { title: string; shortSummary: string; overview: string; brandName?: string; brandDescription?: string };
              const brand = content.brandName ? brandByName.get(content.brandName.trim()) : undefined;
              const brandInfo = brand ? { name: brand.name, description: brand.description } : (content.brandDescription ? { name: content.brandName!, description: content.brandDescription } : undefined);
              return generateConceptImagePrompt(content.title, content.shortSummary || content.overview, brandInfo);
            })
          );
          const conceptImageUrls = await Promise.all(
            imagePrompts.map((prompt) =>
              prompt
                ? generateConceptHeaderImageWithOpenAI(prompt, "1024x1024").then((url) => url ?? generateConceptHeaderImage(prompt))
                : Promise.resolve(null)
            )
          );
          const conceptsForFirstOpportunity: PreGeneratedFlowData["conceptsForFirstOpportunity"] = contents.slice(0, 5).map((c, i) => ({
            id: `pregen-1-${i}`,
            opportunityId: "1",
            title: c.title,
            image: conceptImageUrls[i] ?? conceptImageFromQuery(c.imageQuery),
            shortSummary: c.shortSummary,
            overview: c.overview,
            variations: c.variations ?? [],
            painPointsSolved: c.painPointsSolved ?? [],
            consumerGoal: c.consumerGoal ?? "",
            painPoints: c.painPoints ?? [],
            opportunityScore: c.opportunityScore ?? 65,
            pricePackSizeOptions: c.pricePackSizeOptions ?? [],
          }));

          const preGeneratedFlowData: PreGeneratedFlowData = {
            insights: insights.slice(0, 4).map((ins, i) => ({
              id: String(i + 1),
              title: ins.title,
              category: ins.category,
              description: ins.description,
            })),
            opportunitySpaces: opportunitySpacesWithImages,
            conceptsForFirstOpportunity,
          };
          const updated = await updateInstance(instance.id, { preGeneratedFlowData });
          if (updated) {
            return NextResponse.json(updated);
          }
          console.warn("Pre-generated flow data built but updateInstance returned null; instance saved without preGeneratedFlowData.");
          // Still return instance with preGeneratedFlowData so client can cache and use it on first load
          return NextResponse.json({ ...instance, preGeneratedFlowData });
        }
      }
    } catch (preGenErr) {
      console.error("Pre-generate flow data failed (instance already created):", preGenErr);
    }

    return NextResponse.json(instance);
  } catch (e) {
    console.error("Generate error:", e);
    return NextResponse.json({ error: "Failed to create instance" }, { status: 500 });
  }
}
