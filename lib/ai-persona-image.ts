/**
 * Persona image flow:
 * 1. Prompt agent: ingests all 5 persona cards' content and produces 5 headshot visual prompts,
 *    each specifying gender, age, and race appropriate to the persona; ensures all 5 are visually different.
 * 2. Visual agent: runs the Fal image API for each prompt in parallel.
 */

import type { ContentMap } from "./types";

/** Full content for one persona card (label + optional modal content). */
export interface PersonaCardContent {
  label: string;
  description?: string;
  descriptionBullets?: string;
  coreJtbd?: string;
  behavioralJobs?: string;
  triggersRoutines?: string;
  hiddenEmergingJobs?: string;
  whatChanged?: string;
}

const PROMPT_AGENT_SYSTEM = `You are a visual prompt writer for photorealistic headshot portraits. You will receive 5 persona cards (consumer segments) with labels and optional description, job-to-be-done, and other profile text.

Your task: output exactly 5 visual prompts, one per persona. Each prompt will be used to generate a single headshot image.

Rules:
- Every prompt must describe a HEADSHOT: one person only, head and shoulders, face centered and fully visible, photorealistic portrait. Neutral or soft gradient background. Professional, appropriate for business or research context. No text or logos.
- Each prompt MUST explicitly specify: gender, age, and race/ethnicity (or "diverse" appearance description) that fits the persona's profile and makes sense for that consumer segment. Use clear, respectful descriptors (e.g. "woman in her early 30s, South Asian", "man in his 50s, Black", "woman in her late 20s, Latina", "man in his 40s, East Asian", "non-binary person in their mid-20s, white").
- CRITICAL: All 5 prompts must be VISUALLY DIFFERENT from each other. Use different gender, age range, and race/ethnicity for each of the 5. Vary them so the set shows inclusive, diverse representation and no two prompts describe the same type of person.
- Base the specific gender, age, and race on what fits each persona's card content (e.g. a "Value-Conscious Parent" might be any age/gender; a "Wellness Seeker" might skew younger; use the description and JTBD to inform your choice). When the card does not specify, choose a distinct combination so the five portraits are clearly different people.
- Keep each prompt to 1-3 sentences, under 200 words. Output only the prompt text—no meta-commentary.

Respond with a single JSON object with exactly one key: "prompts", an array of exactly 5 strings. Example format:
{"prompts": ["Photorealistic headshot of a woman in her late 20s, Black, warm expression...", "Photorealistic headshot of a man in his 50s, South Asian, calm professional expression...", ...]}`;

/**
 * Build persona card content for persona at index i (1-based) from the content map.
 * Personas 1 and 2 have dedicated keys; 3–5 use shared fallbacks where needed.
 */
export function getPersonaCardFromContent(content: ContentMap, index: 1 | 2 | 3 | 4 | 5): PersonaCardContent {
  const n = index;
  const label = (content[`persona${n}Label`] as string | undefined) ?? "";
  const description = (content[`persona${n}Description`] as string | undefined) ?? (content.personaDescription as string | undefined);
  const descriptionBullets = (content[`persona${n}DescriptionBullets`] as string | undefined) ?? (content.personaDescriptionBullets as string | undefined);
  const coreJtbd = (content[`persona${n}CoreJtbd`] as string | undefined) ?? (content.personaCoreJtbd as string | undefined);
  const behavioralJobs = (content[`persona${n}BehavioralJobs`] as string | undefined) ?? (content.personaBehavioralJobs as string | undefined);
  const triggersRoutines = (content[`persona${n}TriggersRoutines`] as string | undefined) ?? (content.personaTriggersRoutines as string | undefined);
  const hiddenEmergingJobs = (content[`persona${n}HiddenEmergingJobs`] as string | undefined) ?? (content.personaHiddenEmergingJobs as string | undefined);
  const whatChanged = (content[`persona${n}WhatChanged`] as string | undefined) ?? (content.personaWhatChanged as string | undefined);
  return {
    label,
    description,
    descriptionBullets,
    coreJtbd,
    behavioralJobs,
    triggersRoutines,
    hiddenEmergingJobs,
    whatChanged,
  };
}

/**
 * Prompt agent: from 5 persona cards, produce 5 headshot visual prompts.
 * Each prompt specifies gender, age, and race; all 5 are visually different.
 * Returns array of 5 prompt strings, or null if OPENAI_API_KEY is missing or the request fails.
 */
export async function generatePersonaVisualPrompts(cards: PersonaCardContent[]): Promise<string[] | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const payload = cards.slice(0, 5).map((c, i) => ({
    personaIndex: i + 1,
    label: c.label,
    description: c.description ?? "",
    descriptionBullets: c.descriptionBullets ?? "",
    coreJtbd: c.coreJtbd ?? "",
    behavioralJobs: c.behavioralJobs ?? "",
    triggersRoutines: c.triggersRoutines ?? "",
    hiddenEmergingJobs: c.hiddenEmergingJobs ?? "",
    whatChanged: c.whatChanged ?? "",
  }));

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: PROMPT_AGENT_SYSTEM },
      { role: "user", content: `Generate 5 headshot visual prompts for these persona cards. Ensure each prompt specifies gender, age, and race/ethnicity and that all 5 are visually different.\n\n${JSON.stringify(payload, null, 2)}` },
    ],
    max_tokens: 1200,
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
      console.error("Persona prompt agent API error:", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;
    const jsonStr = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(jsonStr) as { prompts?: string[] };
    const prompts = Array.isArray(parsed.prompts) ? parsed.prompts.slice(0, 5) : null;
    if (!prompts || prompts.length !== 5) return null;
    return prompts;
  } catch (e) {
    console.error("Persona visual prompt generation failed:", e);
    return null;
  }
}

/**
 * Visual agent: run the Fal image API for one headshot prompt.
 * Returns the image URL or null.
 */
export async function runPersonaImageFromPrompt(prompt: string): Promise<string | null> {
  const { generateFalImage } = await import("@/lib/fal-image");
  const fullPrompt = `Photorealistic bright headshot portrait photograph. Face clearly in frame: one person only, head and shoulders, face centered and fully visible, well-lit and bright. ${prompt.slice(0, 800)}. Neutral or soft gradient background. Professional, appropriate for a business or research context. No text or logos.`;
  return generateFalImage({
    prompt: fullPrompt,
    image_size: "square",
    num_images: 1,
  });
}

/** Placeholder URLs for when generation is skipped or fails (same order as persona cards). */
export const PERSONA_PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop",
];

/**
 * Generate profile images for 5 personas using a two-step flow:
 * 1. Prompt agent ingests all 5 persona cards and produces 5 headshot prompts (gender, age, race specified; all different).
 * 2. Visual agent runs the Fal image API for each prompt in parallel.
 * Accepts either full persona cards or a content map (from which cards are built).
 * Returns an array of 5 image URLs or null per slot (null = use placeholder).
 */
export async function generatePersonaProfileImages(
  input: PersonaCardContent[] | ContentMap | string[]
): Promise<(string | null)[]> {
  let cards: PersonaCardContent[];
  if (Array.isArray(input) && input.length > 0) {
    if (typeof input[0] === "string") {
      cards = (input as string[]).slice(0, 5).map((label) => ({ label }));
    } else {
      cards = (input as PersonaCardContent[]).slice(0, 5);
    }
  } else if (input && typeof input === "object" && "persona1Label" in input) {
    cards = [1, 2, 3, 4, 5].map((n) => getPersonaCardFromContent(input as ContentMap, n as 1 | 2 | 3 | 4 | 5));
  } else {
    return [null, null, null, null, null];
  }

  cards = cards.filter((c) => c.label?.trim());
  if (cards.length === 0) return [null, null, null, null, null];

  // 1. Prompt agent: produce 5 visual prompts from full card content
  const prompts = await generatePersonaVisualPrompts(cards);
  if (!prompts || prompts.length === 0) {
    return [null, null, null, null, null];
  }

  // 2. Visual agent: run Fal in parallel for each prompt
  const results = await Promise.all(prompts.map((p) => runPersonaImageFromPrompt(p)));

  // Pad to length 5
  while (results.length < 5) results.push(null);
  return results.slice(0, 5);
}
