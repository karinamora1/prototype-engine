/**
 * AI-generated insights for Insights Studio based on research scope from step 1.
 * Uses OpenAI when OPENAI_API_KEY is set.
 */

export interface GeneratedInsight {
  title: string;
  description: string;
  category: string;
}

export interface GenerateInsightsInput {
  scopeChoice: "narrow" | "broad";
  customFocus?: string;
  focusPills?: string[];
  /** Selected global insight from Define scope (Painpoint, JTBD, or Trend) — title and description are used as context */
  selectedGlobalInsight?: { type: string; title: string; description: string };
  /** Selected cross-category insight from Define scope (index 0 or 1) — title and description are used as context */
  selectedCrossInsight?: { index: number; title: string; description: string };
}

const SYSTEM_PROMPT = `You are an insights analyst for an innovation dashboard. Given a user's research scope (from "Define research scope"), generate exactly 4 distinct insights that would be surfaced from their selected data sources.

Each insight must have:
- title: A short, punchy headline (sentence case, max ~60 chars) that captures the insight
- description: One or two sentences explaining the insight and why it matters for the chosen focus
- category: Either "Cross-Category" or "Behavioral" (assign based on whether the insight is about cross-category patterns or behavioral/social listening)

The insights should feel relevant to the research focus: if the user chose a narrow scope with specific focus areas or a custom focus, tailor the insights to that. If they chose a broad scope, generate more general but still actionable insights. If the user also selected a global insight (Painpoint, JTBD, or Trend) or a cross-category insight, use those selected insights as direct input: incorporate their themes and build on them so the generated Insights Studio insights are clearly informed by both the focus areas and the selected global/cross-category insight content.

Respond with a single JSON object only (no markdown, no code fence), with one key:
- insights: an array of exactly 4 objects, each with keys: title, description, category`;

function buildUserPrompt(input: GenerateInsightsInput): string {
  const parts: string[] = [];
  parts.push(`Research scope: ${input.scopeChoice}`);
  if (input.scopeChoice === "narrow") {
    if (input.customFocus?.trim()) {
      parts.push(`Custom focus: ${input.customFocus.trim()}`);
    }
    if (input.focusPills?.length) {
      parts.push(`Selected focus areas (Popular): ${input.focusPills.join(", ")}`);
    }
  }
  if (input.selectedGlobalInsight?.title) {
    parts.push(
      `Selected global insight (${input.selectedGlobalInsight.type}): "${input.selectedGlobalInsight.title}" — ${input.selectedGlobalInsight.description}`
    );
  }
  if (input.selectedCrossInsight?.title) {
    parts.push(
      `Selected cross-category insight: "${input.selectedCrossInsight.title}" — ${input.selectedCrossInsight.description}`
    );
  }
  parts.push("\nGenerate the JSON object with the 'insights' array.");
  return parts.join("\n");
}

/**
 * Call OpenAI to generate 4 insights from research scope. Returns null if OPENAI_API_KEY is missing or the request fails.
 */
export async function generateInsightsWithAI(
  input: GenerateInsightsInput
): Promise<GeneratedInsight[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    max_tokens: 800,
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
      console.error("OpenAI insights API error:", res.status, err);
      return null;
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    const jsonStr = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr) as { insights?: unknown[] };
    const list = Array.isArray(parsed.insights) ? parsed.insights : [];
    const out: GeneratedInsight[] = [];
    for (let i = 0; i < Math.min(4, list.length); i++) {
      const item = list[i] as Record<string, unknown>;
      out.push({
        title: String(item?.title ?? "").trim() || "Insight",
        description: String(item?.description ?? "").trim() || "",
        category: String(item?.category ?? "Cross-Category").trim() || "Cross-Category",
      });
    }
    return out.length === 4 ? out : null;
  } catch (e) {
    console.error("AI insights generation failed:", e);
    return null;
  }
}
