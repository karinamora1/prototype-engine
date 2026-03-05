/**
 * AI-generated project detail for recent projects: ingests project title + client brief
 * and returns 2 opportunity spaces with 3–4 concept cards each.
 */

export interface ProjectDetailConcept {
  id: string;
  title: string;
  overview: string;
  imageQuery: string;
}

export interface ProjectDetailOpportunity {
  id: string;
  title: string;
  snippet: string;
  concepts: ProjectDetailConcept[];
}

export interface GenerateProjectDetailInput {
  projectTitle: string;
  brief: string;
  /** Child brands with descriptions; each concept will be assigned to a different brand and informed by its description */
  childBrands?: { name: string; description: string }[];
}

const SYSTEM_PROMPT_BASE = `You are an innovation strategist focused on breakthrough ideas. Given a recent project's title and its client brief, you generate a concise project summary view suitable for a dashboard: exactly 2 opportunity spaces, each with 3–4 concept ideas.

CRITICAL: Every concept must be HIGHLY INNOVATIVE—push to extreme levels. Think bold, provocative, category-challenging, and visionary. Avoid safe or incremental ideas. Concepts should surprise the client and feel like they could redefine the space. Favor speculative, blue-ocean, and convention-breaking angles.

Every concept must be a PRODUCT (something that can be manufactured, packaged, and sold)—not a marketing or engagement concept. Do not propose challenges, support groups, communities, campaigns, or other non-product solutions.

Output a single JSON object only (no markdown, no code fence), with one key:
- opportunities: an array of exactly 2 objects. Each object has:
  - id: string, e.g. "opp-1", "opp-2"
  - title: A short, memorable name for the opportunity (2–6 words, title case)
  - snippet: One or two sentences describing the opportunity and why it matters (for the client/brief context)
  - concepts: an array of 3 or 4 objects. Each concept has:
    - id: string, e.g. "c1a", "c1b", "c2a"
    - title: A short concept name (2–6 words, title case)—make it punchy and memorable
    - overview: One sentence describing the concept (under 25 words)—emphasize what makes it radically innovative
    - imageQuery: A short phrase for a stock/hero image (1–4 words), e.g. "sustainable packaging", "refill station", "plant-based wrap"
`;

const SYSTEM_PROMPT_WITH_BRANDS = `
Additionally: You are given a list of child brands with descriptions. Assign a DIFFERENT child brand to each concept across the whole response (cycle through the brands if you have more concepts than brands). For each concept, add a key "brandName" with the exact brand name assigned. The concept's title MUST include the brand name—e.g. "Bazooka Bubble Blast", "Glade Calm Moment", or "Bazooka: Crazy Candy Pods". The overview MUST be specific to that brand and informed by its description.`;

const SYSTEM_PROMPT_RULES = `
Rules:
- Align opportunities and concepts with the client brief (category, goals, constraints) but push far beyond obvious solutions.
- Every concept must be a PRODUCT (manufactured, packaged, sold)—not challenges, support groups, communities, or campaigns.
- Every concept must feel genuinely innovative—no safe or "me too" ideas. Aim for extreme, memorable, and conversation-starting.
- Use the project title to keep tone and scope consistent. Within that, prioritize boldness and vision over caution.`;

const SYSTEM_PROMPT = SYSTEM_PROMPT_BASE + SYSTEM_PROMPT_RULES;

function buildUserPrompt(input: GenerateProjectDetailInput): string {
  const title = input.projectTitle?.trim() || "Recent project";
  const brief = input.brief?.trim() || "No brief provided.";
  let out = `Project title: ${title}

Client brief:
${brief}
`;
  if (input.childBrands?.length) {
    out += `
Child brands (assign a different brand to each concept; use the description to make each concept specific to that brand):
${input.childBrands.map((b) => `- ${b.name}: ${b.description || "No description"}`).join("\n")}
`;
  }
  out += `
Generate the JSON object with the "opportunities" array (2 opportunities, each with 3–4 concepts).`;
  return out;
}

function parseModelOutput(raw: string): ProjectDetailOpportunity[] | null {
  try {
    const jsonStr = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(jsonStr) as { opportunities?: unknown[] };
    const list = Array.isArray(parsed.opportunities) ? parsed.opportunities : [];
    const out: ProjectDetailOpportunity[] = [];

    for (let i = 0; i < Math.min(2, list.length); i++) {
      const item = list[i] as Record<string, unknown>;
      const id = String(item?.id ?? `opp-${i + 1}`).trim() || `opp-${i + 1}`;
      const title = String(item?.title ?? "Opportunity").trim() || "Opportunity";
      const snippet = String(item?.snippet ?? "").trim() || "Opportunity space from the brief.";
      const rawConcepts = Array.isArray(item?.concepts) ? item.concepts : [];
      const concepts: ProjectDetailConcept[] = rawConcepts.slice(0, 4).map((c, j) => {
        const cc = c && typeof c === "object" ? (c as Record<string, unknown>) : {};
        const brandName = cc.brandName ? String(cc.brandName).trim() : "";
        let title = String(cc.title ?? "Concept").trim() || "Concept";
        if (brandName && !title.toLowerCase().includes(brandName.toLowerCase())) {
          title = `${brandName}: ${title}`;
        }
        return {
          id: String(cc.id ?? `c-${i}-${j}`).trim() || `c-${i}-${j}`,
          title,
          overview: String(cc.overview ?? "").trim() || "Concept aligned with this opportunity.",
          imageQuery: String(cc.imageQuery ?? "innovation").trim().replace(/\s+/g, ",").slice(0, 50) || "innovation",
        };
      });
      if (concepts.length < 3) {
        while (concepts.length < 3) {
          concepts.push({
            id: `c-${i}-${concepts.length}`,
            title: "Concept",
            overview: "Concept aligned with this opportunity.",
            imageQuery: "innovation",
          });
        }
      }
      out.push({ id, title, snippet, concepts });
    }

    return out.length === 2 ? out : null;
  } catch {
    return null;
  }
}

/**
 * Generate 2 opportunity spaces with 3–4 concepts each from project title and client brief.
 * Returns null if OPENAI_API_KEY is missing or the request fails.
 */
export async function generateProjectDetailWithAI(
  input: GenerateProjectDetailInput
): Promise<ProjectDetailOpportunity[] | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const systemPrompt = input.childBrands?.length
    ? SYSTEM_PROMPT_BASE + SYSTEM_PROMPT_WITH_BRANDS + SYSTEM_PROMPT_RULES
    : SYSTEM_PROMPT;

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: buildUserPrompt(input) },
    ],
    max_tokens: 2200,
    temperature: 0.7,
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
      console.error("OpenAI project detail API error:", res.status, err);
      return null;
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;
    return parseModelOutput(raw);
  } catch (e) {
    console.error("AI project detail generation failed:", e);
    return null;
  }
}

/** Build an image URL from an image query (e.g. Unsplash). */
export function projectDetailImageFromQuery(query: string, width = 400, height = 300): string {
  const q = query.trim().replace(/\s+/g, ",").slice(0, 50) || "innovation";
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(q)}`;
}
