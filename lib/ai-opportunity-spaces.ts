/**
 * AI-generated opportunity spaces from brief subject + Insights Studio insights.
 * Uses OpenAI when OPENAI_API_KEY is set.
 */

export interface InputInsight {
  title: string;
  description: string;
  category?: string;
}

export interface GeneratedMarket {
  id: string;
  market: string;
  alignment: string;
  nuances: string[];
}

export interface GeneratedOpportunitySpace {
  title: string;
  description: string;
  imageQuery: string;
  score?: number;
  benefits: string[];
  consumerGoals: string[];
  painPoints: string[];
  markets: GeneratedMarket[];
}

export interface GenerateOpportunitySpacesInput {
  subject: string;
  insights: InputInsight[];
}

const FIXED_MARKETS: GeneratedMarket[] = [
  { id: "USA", market: "United States", alignment: "Great consumer alignment", nuances: ["Relevant market nuances."] },
  { id: "JPN", market: "Japan", alignment: "Fair consumer alignment", nuances: ["Relevant market nuances."] },
  { id: "DEU", market: "Germany", alignment: "Fair consumer alignment", nuances: ["Relevant market nuances."] },
];

export const OPPORTUNITY_SPACES_SYSTEM_PROMPT = `You are an innovation strategist for a dashboard. Given the project/brief subject and the 4 insights that the user reviewed in Insights Studio, generate exactly 4 distinct opportunity spaces.

For the FIRST TWO opportunity spaces only, include:
- title: A short, memorable name for the opportunity (2-5 words, title case).
- imageQuery: A single word or short phrase (1-3 words) for a stock photo (e.g. "fragrance diffuser", "wellness scent").
- score: An integer relevance score between 25 and 95.
- description: One or two sentences (snippet) describing the opportunity and why it matters.
- benefits: An array of exactly 3 short sentences describing key benefits of this opportunity.
- consumerGoals: An array of exactly 3 short sentences describing what consumers want or seek (consumer goals) for this opportunity.
- painPoints: An array of exactly 3 short sentences describing consumer pain points or barriers relevant to this opportunity.
- markets: An array of exactly 3 market objects, always these 3 and in this order: (1) United States (id "USA"), (2) Japan (id "JPN"), (3) Germany (id "DEU"). Each has: id, market (display name), alignment (exactly one of "Great consumer alignment" or "Fair consumer alignment"), nuances (array of 1-2 short sentences describing country-specific nuances for that market).

For the THIRD and FOURTH opportunity spaces, include ONLY:
- title: A short, memorable name for the opportunity (2-5 words, title case).
- imageQuery: A single word or short phrase (1-3 words) for a stock photo.
- score: An integer relevance score between 25 and 95.

Do not include description, benefits, consumerGoals, painPoints, or markets for the third and fourth spaces.

The 4 opportunity spaces should be informed by the insights but be distinct.

Respond with a single JSON object only (no markdown, no code fence), with one key:
- opportunitySpaces: an array of exactly 4 objects. Items 1-2: full objects with title, description, imageQuery, score, benefits, consumerGoals, painPoints, markets. Items 3-4: only title, imageQuery, score.`;

function buildUserPrompt(input: GenerateOpportunitySpacesInput): string {
  const subject = input.subject?.trim() || "the category";
  const insightsText = input.insights
    .slice(0, 4)
    .map((i, idx) => `${idx + 1}. ${i.title}: ${i.description}`)
    .join("\n");
  return `Subject/category from the brief: ${subject}

Insights from Insights Studio:
${insightsText}

Generate the JSON object with the 'opportunitySpaces' array.`;
}

export function buildOpportunitySpacesUserPrompt(input: GenerateOpportunitySpacesInput): string {
  return buildUserPrompt(input);
}

function parseMarket(m: unknown): GeneratedMarket {
  const o = (m && typeof m === "object" ? m : {}) as Record<string, unknown>;
  const id = String(o.id ?? "USA").trim() || "USA";
  const market = String(o.market ?? id).trim() || id;
  const a = String(o.alignment ?? "").trim();
  const alignment = a === "Fair consumer alignment" ? "Fair consumer alignment" : "Great consumer alignment";
  const rawNuances = Array.isArray(o.nuances) ? o.nuances : [];
  const nuances = rawNuances.slice(0, 2).map((n) => String(n ?? "").trim()).filter(Boolean);
  return { id, market, alignment, nuances: nuances.length ? nuances : ["Relevant market nuances."] };
}

function normalizeFixedMarkets(rawMarkets: unknown): GeneratedMarket[] {
  const parsed = Array.isArray(rawMarkets) ? rawMarkets.map(parseMarket) : [];
  const findMatch = (id: string) =>
    parsed.find((m) => m.id.toLowerCase() === id.toLowerCase()) ??
    parsed.find((m) => m.market.toLowerCase() === id.toLowerCase());

  return FIXED_MARKETS.map((fm) => {
    const match =
      parsed.find((m) => m.id.toLowerCase() === fm.id.toLowerCase()) ||
      parsed.find((m) => m.market.toLowerCase() === fm.market.toLowerCase()) ||
      // light alias support (common variants)
      (fm.id === "USA"
        ? parsed.find((m) => ["us", "usa", "united states", "united states of america"].includes(m.id.toLowerCase()) || ["us", "usa", "united states", "united states of america"].includes(m.market.toLowerCase()))
        : fm.id === "JPN"
          ? parsed.find((m) => ["jp", "jpn", "japan"].includes(m.id.toLowerCase()) || ["jp", "jpn", "japan"].includes(m.market.toLowerCase()))
          : parsed.find((m) => ["de", "deu", "germany"].includes(m.id.toLowerCase()) || ["de", "deu", "germany"].includes(m.market.toLowerCase())));

    return {
      ...fm,
      alignment: match?.alignment ?? fm.alignment,
      nuances: match?.nuances?.length ? match.nuances.slice(0, 2) : fm.nuances,
    };
  });
}

/**
 * Call OpenAI to generate 4 opportunity spaces. Returns null if OPENAI_API_KEY is missing or the request fails.
 */
export function parseOpportunitySpacesFromModelText(raw: string): GeneratedOpportunitySpace[] | null {
  try {
    const jsonStr = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr) as { opportunitySpaces?: unknown[] };
    const list = Array.isArray(parsed.opportunitySpaces) ? parsed.opportunitySpaces : [];
    const out: GeneratedOpportunitySpace[] = [];
    const defaultScores = [70, 60, 50, 40];
    const defaultBenefits = ["Key benefit for this opportunity.", "Another benefit.", "Third benefit."];
    const defaultConsumerGoals = ["Consumer goal one.", "Consumer goal two.", "Consumer goal three."];
    const defaultPainPoints = ["Pain point one.", "Pain point two.", "Pain point three."];

    for (let i = 0; i < Math.min(4, list.length); i++) {
      const item = list[i] as Record<string, unknown>;
      const score = typeof item?.score === "number" ? Math.max(25, Math.min(95, item.score)) : defaultScores[i];
      const imageQuery = String(item?.imageQuery ?? "innovation").trim().replace(/\s+/g, ",") || "innovation";
      const description = i < 2 ? String(item?.description ?? "").trim() : "";
      const title = String(item?.title ?? "").trim() || "Opportunity Space";

      if (i < 2) {
        const rawBenefits = Array.isArray(item?.benefits) ? item.benefits : [];
        const benefits = rawBenefits.slice(0, 3).map((b) => String(b ?? "").trim()).filter(Boolean) || defaultBenefits;
        const rawGoals = Array.isArray(item?.consumerGoals) ? item.consumerGoals : [];
        const consumerGoals = rawGoals.slice(0, 3).map((g) => String(g ?? "").trim()).filter(Boolean) || defaultConsumerGoals;
        const rawPains = Array.isArray(item?.painPoints) ? item.painPoints : [];
        const painPoints = rawPains.slice(0, 3).map((p) => String(p ?? "").trim()).filter(Boolean) || defaultPainPoints;
        const markets = normalizeFixedMarkets(item?.markets);
        out.push({
          title,
          description,
          imageQuery,
          score,
          benefits,
          consumerGoals,
          painPoints,
          markets,
        });
      } else {
        out.push({
          title,
          description: "",
          imageQuery,
          score,
          benefits: [],
          consumerGoals: [],
          painPoints: [],
          markets: normalizeFixedMarkets([]),
        });
      }
    }

    return out.length === 4 ? out : null;
  } catch {
    return null;
  }
}

export async function generateOpportunitySpacesWithAI(
  input: GenerateOpportunitySpacesInput
): Promise<GeneratedOpportunitySpace[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: OPPORTUNITY_SPACES_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    max_tokens: 2400,
    temperature: 0.4,
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
      console.error("OpenAI opportunity spaces API error:", res.status, err);
      return null;
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;
    return parseOpportunitySpacesFromModelText(raw);
  } catch (e) {
    console.error("AI opportunity spaces generation failed:", e);
    return null;
  }
}

/** Build an image URL from an image query (e.g. for Unsplash Source). */
export function imageUrlFromQuery(query: string, width = 800, height = 400): string {
  const q = query.trim().replace(/\s+/g, ",").slice(0, 50) || "innovation";
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(q)}`;
}
