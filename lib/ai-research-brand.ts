/**
 * AI agent that researches a brand by name and website URL, then returns
 * structured data: 5 child brands with rich descriptions (space, voice, audience, products per sub-brand),
 * and innovation focus for the prototype.
 */

export interface ResearchBrandResult {
  clientName: string;
  childBrands: { name: string; description: string }[];
  innovationFocus: string;
}

const SYSTEM_PROMPT = `You are a brand and innovation strategist. Given a brand name and its website URL, you research and summarize the brand, then produce structured output for an innovation prototype.

Your output must be valid JSON only (no markdown, no code fence), with these exact keys:
- clientName: string — The parent brand or company name (e.g. "SC Johnson")
- childBrands: array of exactly 5 objects. Each must be a REAL, EXISTING consumer-facing sub-brand or product brand under the parent company—a name that appears on products and that consumers would recognize (e.g. for Glanbia: Optimum Nutrition, BSN, Isopure, SlimFast, think!). Do NOT use business units, divisions, or category labels (e.g. not "Glanbia Performance Nutrition", "X Consumer Health", or "X Division"). Each object has:
  - name: string — the real sub-brand name only
  - description: string — a rich paragraph (4-6 sentences) for THIS sub-brand that covers: (1) the space/category this sub-brand plays in, (2) its brand voice and personality, (3) its target audience, and (4) the products it sells. Write so a user can read the full description in one place; do not split these into separate fields.
- innovationFocus: string — A paragraph (3-5 sentences) based on all the children brands together, what the innovation engine should focus on: key opportunity areas, strategic priorities, and where to look for new concepts. This will drive the prototype's brief.`;

function buildUserPrompt(brandName: string, brandWebsiteUrl: string): string {
  return `Brand name: ${brandName}
Brand website URL: ${brandWebsiteUrl}

Research this brand and produce the JSON object. For childBrands, list exactly 5 real, existing consumer-facing sub-brands under this company (actual brand names that appear on products), NOT business units or category names. For each sub-brand, write a single description paragraph (4-6 sentences) that includes: the space that brand plays in, its voice, its audience, and the products it sells. Include clientName, childBrands (name + description for each), and innovationFocus. Be specific and actionable.`;
}

/**
 * Research a brand and return structured data for the Create Prototype form.
 * Returns null if OPENAI_API_KEY is missing or the request fails.
 */
export async function researchBrandWithAI(
  brandName: string,
  brandWebsiteUrl: string
): Promise<ResearchBrandResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set; cannot research brand");
    return null;
  }

  const url = "https://api.openai.com/v1/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(brandName.trim(), brandWebsiteUrl.trim()) },
      ],
      max_tokens: 2000,
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI research-brand API error:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const rawContent = data.choices?.[0]?.message?.content?.trim();
  if (!rawContent) return null;

  try {
    const jsonStr = rawContent.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    const clientName = String(parsed.clientName ?? brandName).trim() || brandName.trim();
    const rawBrands = Array.isArray(parsed.childBrands) ? parsed.childBrands : [];
    const childBrands = rawBrands.slice(0, 5).map((b: unknown, i: number) => {
      const o = b && typeof b === "object" ? (b as Record<string, unknown>) : {};
      return {
        name: String(o.name ?? `Brand ${i + 1}`).trim() || `Brand ${i + 1}`,
        description: String(o.description ?? "").trim() || "No description.",
      };
    });
    while (childBrands.length < 5) {
      childBrands.push({ name: `Brand ${childBrands.length + 1}`, description: "To be defined." });
    }

    const innovationFocus =
      String(parsed.innovationFocus ?? "").trim() ||
      "Focus on innovations and potential opportunities aligned with the brand's strategy.";

    return {
      clientName,
      childBrands,
      innovationFocus,
    };
  } catch (e) {
    console.error("Failed to parse research-brand JSON:", e);
    return null;
  }
}
