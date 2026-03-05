import { NextRequest, NextResponse } from "next/server";
import {
  generateConceptSeedsWithAI,
  fleshOutConceptWithAI,
  conceptImageFromQuery,
  type OpportunityContext,
  type ConceptSeed,
  type ChildBrand,
  type GeneratedConceptContent,
} from "@/lib/ai-concepts";
import {
  generateConceptImagePrompt,
  generateConceptHeaderImageWithOpenAI,
  generateConceptHeaderImage,
} from "@/lib/ai-concept-image";

export const dynamic = "force-dynamic";

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * POST /api/generate-concepts/stream
 * Same body as /api/generate-concepts. Streams: stage → concepts (text only) → stage "Generating images…" → image events (one per concept) → final → done.
 * Overlaps image-prompt generation with flesh-out to reduce latency.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const opportunityId = typeof body.opportunityId === "string" ? body.opportunityId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "Opportunity";
  const snippet = typeof body.snippet === "string" ? body.snippet.trim() : "";
  const benefits = Array.isArray(body.benefits)
    ? body.benefits.map((b: unknown) => String(b ?? "").trim()).filter(Boolean)
    : [];
  const consumerGoals = Array.isArray(body.consumerGoals)
    ? body.consumerGoals.map((g: unknown) => String(g ?? "").trim()).filter(Boolean)
    : [];
  const painPoints = Array.isArray(body.painPoints)
    ? body.painPoints.map((p: unknown) => String(p ?? "").trim()).filter(Boolean)
    : [];
  const childBrandsRaw = body.childBrands;
  const childBrands: ChildBrand[] = Array.isArray(childBrandsRaw)
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
        .filter(Boolean) as ChildBrand[]
    : [];
  const markets = [
    { id: "USA", market: "United States", alignment: "Great consumer alignment", nuances: ["Relevant market nuances."] },
    { id: "JPN", market: "Japan", alignment: "Fair consumer alignment", nuances: ["Relevant market nuances."] },
    { id: "DEU", market: "Germany", alignment: "Fair consumer alignment", nuances: ["Relevant market nuances."] },
  ];

  if (!opportunityId) {
    return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
  }

  const context: OpportunityContext = {
    title,
    snippet,
    benefits,
    consumerGoals,
    painPoints,
    markets,
  };

  const encoder = new TextEncoder();
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();

  const write = async (text: string) => {
    await writer.write(encoder.encode(text));
  };

  (async () => {
    try {
      await write(sseEvent("stage", { message: "Generating concepts…" }));

      const seeds = await generateConceptSeedsWithAI(context, childBrands.length > 0 ? childBrands : undefined);
      if (!seeds || seeds.length === 0) {
        await write(sseEvent("error", { message: "Failed to generate concept seeds" }));
        await writer.close();
        return;
      }

      const brandByName = new Map<string, ChildBrand>();
      childBrands.forEach((b) => brandByName.set(b.name.trim(), b));
      const slice = seeds.slice(0, 5);

      // Overlap: flesh-out and image prompts in parallel
      const [fleshResults, imagePrompts] = await Promise.all([
        Promise.all(
          slice.map((seed) => {
            const brand = seed.brandName ? brandByName.get(seed.brandName) : undefined;
            return fleshOutConceptWithAI(context, seed, brand);
          })
        ),
        Promise.all(
          slice.map((seed) => {
            const brandInfo =
              seed.brandName && brandByName.get(seed.brandName)
                ? { name: seed.brandName, description: brandByName.get(seed.brandName)!.description }
                : undefined;
            return generateConceptImagePrompt(seed.title, seed.description, brandInfo);
          })
        ),
      ]);

      const baseId = `gen-${Date.now()}`;
      const fallback: GeneratedConceptContent = {
        title: "Concept",
        shortSummary: "",
        overview: "",
        variations: [],
        painPointsSolved: [],
        consumerGoal: "",
        painPoints: [],
        opportunityScore: 65,
        imageQuery: "fragrance concept",
        pricePackSizeOptions: [],
      };
      const contents = fleshResults.map((r) => r ?? fallback);

      const conceptsTextOnly = contents.map((c, i) => ({
        id: `${baseId}-${i}`,
        opportunityId,
        title: c.title,
        image: null as string | null,
        shortSummary: c.shortSummary,
        overview: c.overview,
        variations: c.variations,
        painPointsSolved: c.painPointsSolved,
        consumerGoal: c.consumerGoal,
        painPoints: c.painPoints,
        opportunityScore: c.opportunityScore,
        pricePackSizeOptions: c.pricePackSizeOptions,
      }));

      await write(sseEvent("concepts", { concepts: conceptsTextOnly }));

      await write(sseEvent("stage", { message: "Generating images…" }));

      const imageUrls: (string | null)[] = [];
      await Promise.all(
        (imagePrompts as (string | null)[]).map((prompt, i) =>
          (prompt
            ? generateConceptHeaderImageWithOpenAI(prompt, "1024x1024").then((url) => url ?? generateConceptHeaderImage(prompt))
            : Promise.resolve(null)
          )
            .then((url) => {
              imageUrls[i] = url;
              return write(sseEvent("image", { index: i, url }));
            })
            .catch(async () => {
              imageUrls[i] = null;
              return write(sseEvent("image", { index: i, url: null }));
            })
        )
      );

      const concepts = contents.map((c, i) => ({
        id: `${baseId}-${i}`,
        opportunityId,
        title: c.title,
        image: imageUrls[i] ?? conceptImageFromQuery(c.imageQuery),
        shortSummary: c.shortSummary,
        overview: c.overview,
        variations: c.variations,
        painPointsSolved: c.painPointsSolved,
        consumerGoal: c.consumerGoal,
        painPoints: c.painPoints,
        opportunityScore: c.opportunityScore,
        pricePackSizeOptions: c.pricePackSizeOptions,
      }));

      await write(sseEvent("final", { concepts }));
      await write(sseEvent("done", { ok: true }));
    } catch (e) {
      console.error("Generate concepts stream error:", e);
      await write(sseEvent("error", { message: "Stream failed" }));
    } finally {
      await writer.close();
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
