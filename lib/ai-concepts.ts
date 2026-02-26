/**
 * AI-generated concept cards from a selected opportunity space.
 * Two-step flow: (1) One ideation agent creates 5 concept seeds (title + short description), increasingly differentiated from safe to out-there. (2) Five detail agents in parallel flesh out each seed using opportunity context.
 */

export interface OpportunityContext {
  title: string;
  snippet: string;
  benefits: string[];
  consumerGoals: string[];
  painPoints: string[];
  markets?: { id: string; market: string; alignment: string; nuances: string[] }[];
}

/** Concept seed from the ideation agent: title and 1–2 line description only. */
export interface ConceptSeed {
  title: string;
  description: string;
}

export interface GeneratedConceptContent {
  title: string;
  shortSummary: string;
  overview: string;
  variations: string[];
  painPointsSolved: string[];
  consumerGoal: string;
  painPoints: string[];
  opportunityScore: number;
  imageQuery: string;
  pricePackSizeOptions: string[];
}

const AGENT_INSTRUCTIONS: Record<
  number,
  { role: string; innovativeness: string }
> = {
  0: {
    role: "Concept 1 — Safe / Conservative",
    innovativeness:
      "Create a SAFE, conservative concept. Stay close to proven category norms and familiar consumer expectations. Prioritize low risk and easy-to-understand value. No speculative or fringe ideas.",
  },
  1: {
    role: "Concept 2 — Slightly innovative",
    innovativeness:
      "Create a SLIGHTLY INNOVATIVE concept. Build on the opportunity with one or two fresh angles, but keep the core proposition recognizable and easy to adopt. Mild differentiation only.",
  },
  2: {
    role: "Concept 3 — Moderately innovative",
    innovativeness:
      "Create a MODERATELY INNOVATIVE concept. Introduce clearer differentiation—new formats, occasions, or benefits—while still feeling credible and executable. Push boundaries a bit.",
  },
  3: {
    role: "Concept 4 — Bold",
    innovativeness:
      "Create a BOLD concept. Challenge category conventions. Consider new occasions, channels, or consumer segments. Ideas should feel ambitious but still grounded in the opportunity.",
  },
  4: {
    role: "Concept 5 — Very out of the box",
    innovativeness:
      "Create a VERY OUT-OF-THE-BOX concept. Think provocatively: unexpected formats, radical positioning, or blue-ocean angles. Surprise and stretch the brief; speculative and visionary is welcome.",
  },
};

const SHARED_JSON_SPEC = `Respond with a single JSON object only (no markdown, no code fence), with these exact keys:
- title: A short, memorable concept name (2-6 words, title case).
- shortSummary: One sentence summarizing the concept for the card (under 25 words).
- overview: 2-4 sentences describing the concept and how it addresses the opportunity (for the detail page).
- variations: An array of exactly 2-3 short variation names or descriptors (e.g. "Morning focus blend", "Evening wind-down").
- painPointsSolved: An array of 2-3 short sentences describing which consumer pain points this concept addresses.
- consumerGoal: One sentence stating the primary consumer goal this concept serves.
- painPoints: An array of 2-3 short sentences describing remaining pain points or barriers to validate.
- opportunityScore: An integer between 50 and 95 indicating fit with the opportunity.
- imageQuery: A short phrase for a stock image (1-4 words, e.g. "wellness fragrance diffuser", "calm scent ritual").
- pricePackSizeOptions: An array of exactly 3 short bullet points for price and pack size options (e.g. "Single 50ml refill — $24", "Starter kit 2x50ml — $44", "Subscription 3x50ml/month — $18/month"). Each should be a concrete option a consumer could choose.`;

const IDEATION_JSON_SPEC = `Respond with a single JSON object only (no markdown, no code fence), with one key:
- concepts: an array of exactly 5 objects. Each object has exactly two keys:
  - title: A short, memorable concept name (2-6 words, title case).
  - description: One or two sentences describing the concept (1-2 lines; under 40 words total).

Concept 1 must be the safest, most conservative idea. Concept 5 must be the most out-there, speculative, or visionary. Concepts 2, 3, 4 should ramp in differentiation. Ensure all 5 are distinct ideas, not variations of the same concept.`;

function buildOpportunityContextBlock(ctx: OpportunityContext): string {
  const benefits = ctx.benefits?.length ? ctx.benefits.map((b, i) => `${i + 1}. ${b}`).join("\n") : "Not specified.";
  const goals = ctx.consumerGoals?.length ? ctx.consumerGoals.map((g, i) => `${i + 1}. ${g}`).join("\n") : "Not specified.";
  const pains = ctx.painPoints?.length ? ctx.painPoints.map((p, i) => `${i + 1}. ${p}`).join("\n") : "Not specified.";
  const markets =
    ctx.markets?.length
      ? ctx.markets.map((m) => `- ${m.market}: ${m.alignment}. ${m.nuances?.join(" ") ?? ""}`).join("\n")
      : "Not specified.";
  return `Opportunity space:
- Title: ${ctx.title}
- Description: ${ctx.snippet}

Benefits of this opportunity:
${benefits}

Consumer goals:
${goals}

Consumer pain points:
${pains}

Markets (alignment and nuances):
${markets}`;
}

/**
 * Ideation agent: one call that creates 5 concept seeds (title + 1–2 line description) from the opportunity space.
 * Concept 1 = safe, Concept 5 = pretty out there; each more differentiated than the last.
 */
export async function generateConceptSeedsWithAI(
  context: OpportunityContext
): Promise<ConceptSeed[] | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const systemPrompt = `You are an innovation concept ideation lead. Given an opportunity space, you produce exactly 5 concept ideas. For each idea you output only:
- A short title (2-6 words)
- A 1-2 line description (under 40 words)

The five concepts must increase in differentiation:
- Concept 1: Safe, conservative, close to category norms.
- Concept 2: Slightly innovative, one or two fresh angles.
- Concept 3: Moderately innovative, clearer differentiation.
- Concept 4: Bold, challenges conventions.
- Concept 5: Very out-of-the-box, provocative or visionary.

All 5 must be distinct concepts (different ideas), not minor variations of the same one.

${IDEATION_JSON_SPEC}`;

  const userPrompt = `${buildOpportunityContextBlock(context)}

Generate 5 concept seeds (title + short description) as specified. Return only the JSON object.`;

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 600,
    temperature: 0.6,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("Concept ideation API error:", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;
    const jsonStr = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(jsonStr) as { concepts?: { title?: string; description?: string }[] };
    const concepts = Array.isArray(parsed.concepts) ? parsed.concepts : null;
    if (!concepts || concepts.length < 5) return null;
    return concepts.slice(0, 5).map((c) => ({
      title: String(c.title ?? "Concept").trim() || "Concept",
      description: String(c.description ?? "").trim() || "A concept aligned with this opportunity.",
    }));
  } catch (e) {
    console.error("Concept ideation failed:", e);
    return null;
  }
}

function buildSystemPrompt(agentIndex: number): string {
  const { role, innovativeness } = AGENT_INSTRUCTIONS[agentIndex] ?? AGENT_INSTRUCTIONS[0];
  return `You are an innovation concept generator for a dashboard. You are ${role}.

${innovativeness}

Use the provided opportunity space as the sole source of context. Generate one concept that fits this opportunity and follows your innovativeness level.

${SHARED_JSON_SPEC}`;
}

function buildUserPrompt(ctx: OpportunityContext): string {
  return `${buildOpportunityContextBlock(ctx)}

Generate one concept that fits this opportunity, following your assigned innovativeness level. Return only the JSON object.`;
}

const FLESH_OUT_SYSTEM = `You are an innovation concept detailer. You are given:
1. An opportunity space (title, description, benefits, consumer goals, pain points, markets).
2. A single concept that has only a title and a short 1-2 line description.

Your job: expand this concept into a full concept specification. Use the opportunity space as context. Stay true to the given concept title and description—do not change the core idea. Fill in the rest so the concept is ready for a dashboard.

${SHARED_JSON_SPEC}

Important: Use the given title and description as the concept's title and shortSummary/overview. Expand overview to 2-4 sentences if the description is brief. Generate variations, painPointsSolved, consumerGoal, painPoints, opportunityScore, imageQuery, and pricePackSizeOptions that fit both the opportunity and this specific concept.`;

function buildFleshOutUserPrompt(ctx: OpportunityContext, seed: ConceptSeed): string {
  return `${buildOpportunityContextBlock(ctx)}

Concept to flesh out:
- Title: ${seed.title}
- Description: ${seed.description}

Expand this concept into a full JSON object with all required keys. Return only the JSON object.`;
}

function parseGeneratedConcept(raw: string): GeneratedConceptContent | null {
  try {
    const jsonStr = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    const o = JSON.parse(jsonStr) as Record<string, unknown>;
    const title = String(o.title ?? "New Concept").trim() || "New Concept";
    const shortSummary = String(o.shortSummary ?? "").trim() || "A concept aligned with this opportunity.";
    const overview = String(o.overview ?? "").trim() || shortSummary;
    const rawVariations = Array.isArray(o.variations) ? o.variations : [];
    const variations = rawVariations.slice(0, 3).map((v) => String(v ?? "").trim()).filter(Boolean);
    if (variations.length === 0) variations.push("Variation A", "Variation B");
    const rawSolved = Array.isArray(o.painPointsSolved) ? o.painPointsSolved : [];
    const painPointsSolved = rawSolved.slice(0, 3).map((p) => String(p ?? "").trim()).filter(Boolean) || ["TBD"];
    const consumerGoal = String(o.consumerGoal ?? "").trim() || "To be defined through validation.";
    const rawPains = Array.isArray(o.painPoints) ? o.painPoints : [];
    const painPoints = rawPains.slice(0, 3).map((p) => String(p ?? "").trim()).filter(Boolean) || ["To be validated."];
    const score = typeof o.opportunityScore === "number" ? Math.max(50, Math.min(95, o.opportunityScore)) : 65;
    const imageQuery = String(o.imageQuery ?? "fragrance concept").trim().replace(/\s+/g, ",").slice(0, 50) || "fragrance concept";
    const rawPricePack = Array.isArray(o.pricePackSizeOptions) ? o.pricePackSizeOptions : [];
    const pricePackSizeOptions = rawPricePack.slice(0, 3).map((p) => String(p ?? "").trim()).filter(Boolean);
    while (pricePackSizeOptions.length < 3) pricePackSizeOptions.push(`Price & pack option ${pricePackSizeOptions.length + 1}`);
    return {
      title,
      shortSummary,
      overview,
      variations,
      painPointsSolved,
      consumerGoal,
      painPoints,
      opportunityScore: score,
      imageQuery,
      pricePackSizeOptions,
    };
  } catch {
    return null;
  }
}

/**
 * Detail agent: flesh out one concept seed (title + description) into full concept content using opportunity context.
 * Used after the ideation agent; one call per concept, run in parallel for 5 concepts.
 */
export async function fleshOutConceptWithAI(
  context: OpportunityContext,
  seed: ConceptSeed
): Promise<GeneratedConceptContent | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: FLESH_OUT_SYSTEM },
      { role: "user", content: buildFleshOutUserPrompt(context, seed) },
    ],
    max_tokens: 800,
    temperature: 0.5,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("OpenAI flesh-out concept agent error:", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;
    const parsed = parseGeneratedConcept(raw);
    if (parsed) {
      parsed.title = seed.title;
      parsed.shortSummary = seed.description.slice(0, 200);
      if (!parsed.overview || parsed.overview.length < 20) parsed.overview = seed.description;
    }
    return parsed;
  } catch (e) {
    console.error("Flesh-out concept agent failed:", e);
    return null;
  }
}

/**
 * Generate a single concept using one of five agents (index 0–4). Agent 0 = safest, Agent 4 = most out-of-the-box.
 * Kept for backward compatibility; prefer fleshOutConceptWithAI when you have seeds from generateConceptSeedsWithAI.
 */
export async function generateOneConceptWithAI(
  context: OpportunityContext,
  agentIndex: number
): Promise<GeneratedConceptContent | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const url = "https://api.openai.com/v1/chat/completions";
  const systemPrompt = buildSystemPrompt(agentIndex);
  const userPrompt = buildUserPrompt(context);

  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 800,
    temperature: agentIndex <= 1 ? 0.5 : agentIndex <= 3 ? 0.7 : 0.85,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`OpenAI concept agent ${agentIndex} error:`, res.status, err);
      return null;
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    return parseGeneratedConcept(raw);
  } catch (e) {
    console.error(`Concept agent ${agentIndex} failed:`, e);
    return null;
  }
}

/**
 * Two-step flow: (1) One ideation agent creates 5 concept seeds (title + short description) from the opportunity space, increasingly differentiated from safe to out-there. (2) Five detail agents in parallel flesh out each seed using opportunity context and only the title/description they were given.
 * Returns array of 5 full concepts; failed slots yield a fallback concept.
 */
export async function generateConceptsWithAI(
  context: OpportunityContext
): Promise<GeneratedConceptContent[]> {
  const fallback: GeneratedConceptContent = {
    title: "Concept (generation pending)",
    shortSummary: "A concept aligned with this opportunity, ready for validation.",
    overview: "Concept content is being generated. Please try again if this persists.",
    variations: ["Variation A", "Variation B"],
    painPointsSolved: ["TBD"],
    consumerGoal: "To be defined through validation.",
    painPoints: ["To be validated."],
    opportunityScore: 65,
    imageQuery: "fragrance concept",
    pricePackSizeOptions: ["Single refill option", "Starter kit option", "Subscription option"],
  };

  const seeds = await generateConceptSeedsWithAI(context);
  if (!seeds || seeds.length === 0) {
    return [fallback, fallback, fallback, fallback, fallback];
  }

  const results = await Promise.all(
    seeds.slice(0, 5).map((seed) => fleshOutConceptWithAI(context, seed))
  );

  return results.map((r) => r ?? fallback);
}

/** Build a concept image URL from an image query (e.g. Unsplash). */
export function conceptImageFromQuery(query: string, width = 800, height = 400): string {
  const q = query.trim().replace(/\s+/g, ",").slice(0, 50) || "fragrance concept";
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(q)}`;
}
