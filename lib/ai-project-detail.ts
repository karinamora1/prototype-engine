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
}

const SYSTEM_PROMPT = `You are an innovation strategist. Given a recent project's title and its client brief, you generate a concise project summary view suitable for a dashboard: exactly 2 opportunity spaces, each with 3–4 concept ideas.

Output a single JSON object only (no markdown, no code fence), with one key:
- opportunities: an array of exactly 2 objects. Each object has:
  - id: string, e.g. "opp-1", "opp-2"
  - title: A short, memorable name for the opportunity (2–6 words, title case)
  - snippet: One or two sentences describing the opportunity and why it matters (for the client/brief context)
  - concepts: an array of 3 or 4 objects. Each concept has:
    - id: string, e.g. "c1a", "c1b", "c2a"
    - title: A short concept name (2–6 words, title case)
    - overview: One sentence describing the concept (under 25 words)
    - imageQuery: A short phrase for a stock/hero image (1–4 words), e.g. "sustainable packaging", "refill station", "plant-based wrap"

Rules:
- Align opportunities and concepts with the client brief (category, goals, constraints).
- Keep concepts distinct within each opportunity; vary from safer to more innovative if appropriate.
- Use the project title to keep tone and scope consistent with what the project is about.`;

function buildUserPrompt(input: GenerateProjectDetailInput): string {
  const title = input.projectTitle?.trim() || "Recent project";
  const brief = input.brief?.trim() || "No brief provided.";
  return `Project title: ${title}

Client brief:
${brief}

Generate the JSON object with the "opportunities" array (2 opportunities, each with 3–4 concepts).`;
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
        return {
          id: String(cc.id ?? `c-${i}-${j}`).trim() || `c-${i}-${j}`,
          title: String(cc.title ?? "Concept").trim() || "Concept",
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

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    max_tokens: 2200,
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
