/**
 * AI-generated content from a client brief.
 * Uses OpenAI Chat Completions when OPENAI_API_KEY is set.
 * No extra dependency: uses fetch().
 */

export interface AIGeneratedBrief {
  /** Short display name for sidebar (e.g. "Walmart Kids") */
  displayName: string;
  /** Brand name if mentioned (e.g. "Walmart") */
  brandName: string;
  /** Topic/category (e.g. "kids' fashion") */
  subject: string;
  /** Section title for global insights */
  sectionGlobalTitle: string;
  /** Section subtitle */
  sectionGlobalSubtitle: string;
  /** 1. Painpoint insight */
  insightPainpointTitle: string;
  insightPainpointDescription: string;
  /** 2. Job-to-be-done (JTBD) insight */
  insightJtbdTitle: string;
  insightJtbdDescription: string;
  /** 3. Trend insight */
  insightTrendTitle: string;
  insightTrendDescription: string;
  /** Fake realistic source line per insight (e.g. "Pinterest · Home & Lifestyle · Pin #2847") */
  insightPainpointSource: string;
  insightJtbdSource: string;
  insightTrendSource: string;
  crossInsight1Source: string;
  crossInsight2Source: string;
  /** Optional primary color hex (e.g. "#1e40af") */
  primaryColor?: string;
  /** Optional accent color hex (e.g. "#fbbf24") */
  accentColor?: string;
  /** Cross category insights section */
  sectionCrossTitle: string;
  sectionCrossSubtitle: string;
  crossInsight1Title: string;
  crossInsight1Description: string;
  crossInsight2Title: string;
  crossInsight2Description: string;
  /** Dynamic Personas section */
  sectionPersonasTitle: string;
  sectionPersonasSubtitle: string;
  persona1Label: string;
  persona2Label: string;
  persona3Label: string;
  persona4Label: string;
  persona5Label: string;
  /** First two personas: full card content (modal body) */
  persona1WhatChanged: string;
  persona1Description: string;
  persona1DescriptionBullets: string;
  persona1CoreJtbd: string;
  persona1BehavioralJobs: string;
  persona1TriggersRoutines: string;
  persona1HiddenEmergingJobs: string;
  persona2WhatChanged: string;
  persona2Description: string;
  persona2DescriptionBullets: string;
  persona2CoreJtbd: string;
  persona2BehavioralJobs: string;
  persona2TriggersRoutines: string;
  persona2HiddenEmergingJobs: string;
  /** Recently uploaded documents: fake file names and extracted insights */
  document1Name: string;
  document2Name: string;
  document1Insights: string;
  document2Insights: string;
  /** Sidebar recent project names (fake, brief-related) */
  recentProject1: string;
  recentProject2: string;
  recentProject3: string;
  /** Popular focus area pills for Define Research Scope (pipe-separated, e.g. "Focus A|Focus B|Focus C") */
  suggestedFocusPills: string;
}

const SYSTEM_PROMPT = `You are a copywriter for an innovation dashboard. Given a client brief, extract and generate concise, on-brand content for the dashboard.

Respond with a single JSON object only (no markdown, no code fence), with these exact keys:
- displayName: short name for the project/brand (max 40 chars, e.g. "Walmart Kids")
- brandName: brand name if clearly mentioned, else empty string
- subject: the main category/topic (e.g. "kids' fashion", "beverages")
- sectionGlobalTitle: always use exactly "Global social insights" (do not customize)
- sectionGlobalSubtitle: 1–2 sentences describing insights focused on the brief's topic and brand if relevant
- insightPainpointTitle: one social insight HEADLINE that is a PAIN POINT relevant to the brief's subject (e.g. a frustration or problem consumers have)
- insightPainpointDescription: one short sentence describing that pain point insight
- insightJtbdTitle: one social insight HEADLINE that is a JOB TO BE DONE relevant to the brief's subject (e.g. what consumers are trying to accomplish)
- insightJtbdDescription: one short sentence describing that JTBD insight
- insightTrendTitle: one social insight HEADLINE that is a TREND relevant to the brief's subject (e.g. a growing behavior or preference)
- insightTrendDescription: one short sentence describing that trend insight
- insightPainpointSource: a short made-up but realistic-sounding source for the pain point insight (e.g. "Pinterest · Home & Lifestyle board · 2.4k saves" or "Reddit · r/ConsumerInsights · 340 upvotes"). Relevant to the insight topic. No real URLs.
- insightJtbdSource: same style of fake realistic source for the JTBD insight
- insightTrendSource: same style of fake realistic source for the trend insight
- crossInsight1Source: same style of fake realistic source for the first cross-category insight
- crossInsight2Source: same style of fake realistic source for the second cross-category insight
- primaryColor: if the brief specifies colors, a hex for the primary (e.g. "#1e40af" for blue), else null. The primary color should be the DARKER, BOLDER color from the reference. Prefer reasonably accessible colors: when used as a background with white text, aim for readable contrast but some wiggle room is fine. Prefer medium-to-dark shades; very light or neon colors may be hard to read.
- accentColor: if the brief specifies colors, a hex for the accent, else null. The accent color should be the LIGHTER color from the reference. Same idea—reasonably readable with white text, but strict compliance is not required. Medium or lighter accents work well.
- sectionCrossTitle: always use exactly "Cross category insights" (do not customize)
- sectionCrossSubtitle: 1 sentence describing cross-category insights for this subject
- crossInsight1Title: one CROSS-CATEGORY insight headline (pain point) relevant to the brief
- crossInsight1Description: one short sentence for that insight
- crossInsight2Title: one CROSS-CATEGORY insight headline (trend) relevant to the brief
- crossInsight2Description: one short sentence for that insight
- sectionPersonasTitle: title for the "Dynamic Personas" section, relevant to the brief (e.g. "Dynamic Personas" or "Kids' fashion personas")
- sectionPersonasSubtitle: 1 short sentence describing personas for this subject
- persona1Label through persona5Label: exactly 5 short persona names (2-4 words each), relevant to the brief's subject and audience (e.g. "Value-Conscious Parent", "Trend-Focused Teen"). Diverse, distinct names.
- For the FIRST persona (persona1Label), generate full profile content:
  persona1WhatChanged: 1–2 sentences on what has recently changed for this segment (trends, market shifts).
  persona1Description: 2–3 sentences describing who this persona is, their mindset and context.
  persona1DescriptionBullets: 3–4 short bullets (newline-separated, use \\n) with who they are, key jobs, context.
  persona1CoreJtbd: 2–3 sentences on their core job-to-be-done.
  persona1BehavioralJobs: 2–3 short bullets (newline-separated, use \\n) for behavioral jobs.
  persona1TriggersRoutines: 2–3 short bullets (newline-separated, use \\n) for triggers and routines.
  persona1HiddenEmergingJobs: 1–2 sentences on hidden or emerging jobs.
- For the SECOND persona (persona2Label), generate the same structure with persona2 prefix:
  persona2WhatChanged, persona2Description, persona2DescriptionBullets, persona2CoreJtbd, persona2BehavioralJobs, persona2TriggersRoutines, persona2HiddenEmergingJobs.
- document1Name: a plausible fake document file name for the first (completed) upload, related to the brief's subject (e.g. "Kids Fashion Consumer Insights Q4 2024.pdf" or "Beverage Category Trends 2024.pdf"). Include a realistic filename with .pdf.
- document2Name: a plausible fake document file name for the second (in progress) upload, related to the brief's subject (e.g. "Category Trends & Competitor Landscape.pdf"). Distinct from document1Name.
- document1Insights: 2-3 short insight bullets that would be "extracted from" the first document, newline-separated (use \\n). Each bullet one line. Relevant to the document title and the brief's subject.
- document2Insights: 2-3 short insight bullets that would be "extracted from" the second document, newline-separated (use \\n). Each bullet one line. Relevant to the document title and the brief's subject.
- recentProject1, recentProject2, recentProject3: REQUIRED. Three short fake project names (2-5 words each) that sound like real innovation/research project names related to the brief's subject (e.g. "Kids Fashion Trend Scan", "Sustainable Packaging Pilot"). You MUST include these three keys with distinct, brief-relevant names.
- suggestedFocusPills: REQUIRED. A single string containing exactly 10 focus areas separated by the pipe character (|). Each focus is 2–5 words. Derive these directly from the brief: use specific themes, goals, categories, problems, opportunities, and priorities mentioned in the brief. Do not use generic labels; every focus must be clearly tied to something stated or implied in the brief (e.g. if the brief mentions fragrance and wellness, include focuses like "Emotional Wellness|Scent Personalization|Mindful Rituals"). Example format: "Focus One|Focus Two|Focus Three|...|Focus Ten" with no spaces around the pipes (9 pipes total for 10 areas).

Generate exactly three distinct global insights (one pain point, one job-to-be-done, one trend), two cross-category insights (pain point, trend), five persona labels, full profile content for the first two personas, two document names with their extracted insights, three recent project names (recentProject1, recentProject2, recentProject3), and suggestedFocusPills (exactly 10 focus areas directly derived from the brief), all relevant to the brief's subject.`;

function buildUserPrompt(briefText: string, uiScheme?: string): string {
  let prompt = `Brief:\n${briefText.slice(0, 3000)}`;
  if (uiScheme?.trim()) {
    prompt += `\n\nUI scheme (use as direct instructions for colors and styling; output primaryColor and accentColor as hex). Prefer reasonably accessible colors with white text—some wiggle room is fine; avoid only the most extreme cases (e.g. very pale yellow or lime as primary).\n${uiScheme.trim()}`;
  }
  prompt += "\n\nGenerate the JSON object.";
  return prompt;
}

/**
 * Call OpenAI to generate brief-based content. Returns null if OPENAI_API_KEY is missing or the request fails.
 */
export async function generateBriefContentWithAI(briefText: string, options?: { uiScheme?: string }): Promise<AIGeneratedBrief | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(briefText, options?.uiScheme) },
    ],
    max_tokens: 2400,
    temperature: 0.3,
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
      console.error("OpenAI API error:", res.status, err);
      return null;
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    // Strip optional markdown code block
    const jsonStr = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    const rp1 = parsed.recentProject1 ?? parsed.recent_project_1;
    const rp2 = parsed.recentProject2 ?? parsed.recent_project_2;
    const rp3 = parsed.recentProject3 ?? parsed.recent_project_3;

    return {
      displayName: String(parsed.displayName ?? "").slice(0, 40) || "Unnamed Client",
      brandName: String(parsed.brandName ?? ""),
      subject: String(parsed.subject ?? "your category"),
      sectionGlobalTitle: String(parsed.sectionGlobalTitle ?? "Global social insights"),
      sectionGlobalSubtitle: String(parsed.sectionGlobalSubtitle ?? ""),
      insightPainpointTitle: String(parsed.insightPainpointTitle ?? ""),
      insightPainpointDescription: String(parsed.insightPainpointDescription ?? ""),
      insightJtbdTitle: String(parsed.insightJtbdTitle ?? ""),
      insightJtbdDescription: String(parsed.insightJtbdDescription ?? ""),
      insightTrendTitle: String(parsed.insightTrendTitle ?? ""),
      insightTrendDescription: String(parsed.insightTrendDescription ?? ""),
      insightPainpointSource: String(parsed.insightPainpointSource ?? "Social listening · Global"),
      insightJtbdSource: String(parsed.insightJtbdSource ?? "Social listening · Global"),
      insightTrendSource: String(parsed.insightTrendSource ?? "Social listening · Global"),
      crossInsight1Source: String(parsed.crossInsight1Source ?? "Cross-category analysis"),
      crossInsight2Source: String(parsed.crossInsight2Source ?? "Cross-category analysis"),
      primaryColor: parsed.primaryColor != null ? String(parsed.primaryColor) : undefined,
      accentColor: parsed.accentColor != null ? String(parsed.accentColor) : undefined,
      sectionCrossTitle: String(parsed.sectionCrossTitle ?? "Cross category insights"),
      sectionCrossSubtitle: String(parsed.sectionCrossSubtitle ?? "These insights are based on five relevant cross-category sources."),
      crossInsight1Title: String(parsed.crossInsight1Title ?? ""),
      crossInsight1Description: String(parsed.crossInsight1Description ?? ""),
      crossInsight2Title: String(parsed.crossInsight2Title ?? ""),
      crossInsight2Description: String(parsed.crossInsight2Description ?? ""),
      sectionPersonasTitle: String(parsed.sectionPersonasTitle ?? "Dynamic Personas"),
      sectionPersonasSubtitle: String(parsed.sectionPersonasSubtitle ?? "Top insights for personas in the US."),
      persona1Label: String(parsed.persona1Label ?? "Allergy Optimist"),
      persona2Label: String(parsed.persona2Label ?? "Preventative Care Planner"),
      persona3Label: String(parsed.persona3Label ?? "Quality of Life Improver"),
      persona4Label: String(parsed.persona4Label ?? "Wellness Seeker"),
      persona5Label: String(parsed.persona5Label ?? "Clean Air Advocate"),
      persona1WhatChanged: String(parsed.persona1WhatChanged ?? ""),
      persona1Description: String(parsed.persona1Description ?? ""),
      persona1DescriptionBullets: String(parsed.persona1DescriptionBullets ?? "").replace(/\\n/g, "\n"),
      persona1CoreJtbd: String(parsed.persona1CoreJtbd ?? ""),
      persona1BehavioralJobs: String(parsed.persona1BehavioralJobs ?? "").replace(/\\n/g, "\n"),
      persona1TriggersRoutines: String(parsed.persona1TriggersRoutines ?? "").replace(/\\n/g, "\n"),
      persona1HiddenEmergingJobs: String(parsed.persona1HiddenEmergingJobs ?? ""),
      persona2WhatChanged: String(parsed.persona2WhatChanged ?? ""),
      persona2Description: String(parsed.persona2Description ?? ""),
      persona2DescriptionBullets: String(parsed.persona2DescriptionBullets ?? "").replace(/\\n/g, "\n"),
      persona2CoreJtbd: String(parsed.persona2CoreJtbd ?? ""),
      persona2BehavioralJobs: String(parsed.persona2BehavioralJobs ?? "").replace(/\\n/g, "\n"),
      persona2TriggersRoutines: String(parsed.persona2TriggersRoutines ?? "").replace(/\\n/g, "\n"),
      persona2HiddenEmergingJobs: String(parsed.persona2HiddenEmergingJobs ?? ""),
      document1Name: String(parsed.document1Name ?? "Consumer Insights Report.pdf"),
      document2Name: String(parsed.document2Name ?? "Category Trends & Landscape.pdf"),
      document1Insights: String(parsed.document1Insights ?? "").replace(/\\n/g, "\n") || "Key themes from the document.\nRelevant findings for the category.\nOpportunities identified.",
      document2Insights: String(parsed.document2Insights ?? "").replace(/\\n/g, "\n") || "Preliminary insights from the document.\nTrends and competitive context.",
      recentProject1: String(rp1 ?? "").trim() || "Project Alpha",
      recentProject2: String(rp2 ?? "").trim() || "Project Beta",
      recentProject3: String(rp3 ?? "").trim() || "Project Gamma",
      suggestedFocusPills:
        (() => {
          const raw = String(parsed.suggestedFocusPills ?? parsed.suggested_focus_pills ?? "").trim().replace(/\s*\|\s*/g, "|");
          const pills = raw ? raw.split("|").map((s) => s.trim()).filter(Boolean) : [];
          const fallbacks = ["Sustainability", "Innovation", "Consumer Experience", "Value", "Digital", "Quality", "Convenience", "Engagement", "Growth", "Insights"];
          const combined = pills.length >= 10 ? pills.slice(0, 10) : [...pills, ...fallbacks].slice(0, 10);
          return combined.join("|") || fallbacks.slice(0, 10).join("|");
        })(),
    };
  } catch (e) {
    console.error("AI brief generation failed:", e);
    return null;
  }
}
