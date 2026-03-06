/**
 * Visual agent: ingests a concept's title and description and creates a header image
 * via an image prompt (gpt-4o-mini) + OpenAI gpt-image-1-mini for image generation, with Fal (Flux) as fallback.
 */

const CONCEPT_IMAGE_PROMPT_SYSTEM = `You are a creative director. Your task is to write a single image prompt for a text-to-image model.

Based on the concept title, description, and brand information (the brand information for the corresponding sub-brand created in the briefing step), generate a concept image that shows the packaging and product as the main subjects of the image, with a lifestyle background. Do not show any humans in the image.

Rules:
- Output only the image prompt, nothing else. No quotes, no preamble.
- The prompt must describe: (1) the product and its packaging as the main focus, (2) a lifestyle background (e.g. home setting, shelf, table, environment that fits the brand), (3) no people or humans.
- Keep it to 2-4 sentences. Be specific about style: e.g. "professional product photography", "soft lifestyle shot", "minimal flat lay".
- Do not ask for text or words to appear in the image.
- Tie the visual to the concept and brand (e.g. fragrance, wellness, scent, category).`;

/**
 * Generate an image prompt from concept title, description, and optional brand info (sub-brand from briefing).
 */
export async function generateConceptImagePrompt(
  title: string,
  description: string,
  brandInfo?: { name: string; description: string }
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const brandBlock =
    brandInfo?.name && brandInfo?.description
      ? `\nBrand (sub-brand from briefing): ${brandInfo.name}\nBrand description: ${brandInfo.description}`
      : "";
  const userContent = `Concept title: ${title}\nDescription: ${description}${brandBlock}\n\nWrite the image prompt (packaging and product as main subjects, lifestyle background, no humans).`;

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
        { role: "system", content: CONCEPT_IMAGE_PROMPT_SYSTEM },
        { role: "user", content: userContent },
      ],
      max_tokens: 200,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI concept image prompt API error:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const prompt = data.choices?.[0]?.message?.content?.trim();
  return prompt && prompt.length > 0 ? prompt : null;
}

/** Generate header image from a prompt using OpenAI gpt-image-1-mini; falls back to Fal (Flux) on failure. */
export async function generateConceptHeaderImageWithOpenAI(
  prompt: string,
  size: "1024x1024" | "1536x1024" = "1024x1024"
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return generateConceptHeaderImage(prompt);
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1-mini",
        prompt: prompt.slice(0, 4000),
        n: 1,
        size,
      }),
    });
    if (!res.ok) {
      console.error("OpenAI gpt-image-1-mini concept image API error:", res.status, await res.text());
      return generateConceptHeaderImage(prompt);
    }
    const data = (await res.json()) as { data?: { b64_json?: string; url?: string; result?: string }[] };
    const first = data.data?.[0];
    if (!first) return generateConceptHeaderImage(prompt);
    if (first.url && first.url.startsWith("http")) return first.url;
    const b64 = first.b64_json ?? (first as { result?: string }).result;
    if (!b64) return generateConceptHeaderImage(prompt);
    return `data:image/png;base64,${b64}`;
  } catch (e) {
    console.error("OpenAI concept image generation failed:", e);
    return generateConceptHeaderImage(prompt);
  }
}

/**
 * Generate a header image from a prompt using Fal AI (Flux).
 */
export async function generateConceptHeaderImage(prompt: string): Promise<string | null> {
  const { generateFalImage } = await import("@/lib/fal-image");
  return generateFalImage({
    prompt,
    image_size: "landscape_4_3",
    num_images: 1,
  });
}

/**
 * Generate a header image for a concept from its title, description, and optional brand info.
 * Uses gpt-4o-mini for the prompt, gpt-image-1-mini for the image (Fal as fallback).
 */
export async function generateConceptImageFromContent(
  title: string,
  description: string,
  brandInfo?: { name: string; description: string }
): Promise<string | null> {
  const imagePrompt = await generateConceptImagePrompt(title, description, brandInfo);
  if (!imagePrompt) return null;
  const openAiUrl = await generateConceptHeaderImageWithOpenAI(imagePrompt);
  if (openAiUrl) return openAiUrl;
  return generateConceptHeaderImage(imagePrompt);
}

/**
 * Run the concept image agent for multiple concepts in parallel.
 * When brandInfo is provided per concept, it should match the sub-brand from the briefing step.
 * Returns an array of image URLs (or null for failed items), in the same order as input.
 */
export async function generateConceptImagesInParallel(
  concepts: { title: string; description: string; brandName?: string; brandDescription?: string }[]
): Promise<(string | null)[]> {
  if (concepts.length === 0) return [];
  const results = await Promise.all(
    concepts.map((c) =>
      generateConceptImageFromContent(c.title, c.description || c.title, 
        c.brandName != null && c.brandDescription != null
          ? { name: c.brandName, description: c.brandDescription }
          : undefined)
    )
  );
  return results;
}
