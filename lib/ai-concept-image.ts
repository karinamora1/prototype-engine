/**
 * Visual agent: ingests a concept's title and description and creates a header image
 * via an image prompt (GPT) + Fal AI. Used for the concept detail page hero.
 */

const CONCEPT_IMAGE_PROMPT_SYSTEM = `You are a creative director. Given a product or innovation concept's title and description, write a single image prompt for a text-to-image model that will become a hero/header image for a concept detail page.

Rules:
- Output only the image prompt, nothing else. No quotes, no preamble.
- The prompt should be visual and evocative: describe a scene, mood, or product that represents the concept. Think wide-format hero image (will be displayed at 1792x1024).
- Do not ask for text or words to appear in the image.
- Keep it to 2-4 sentences. Be specific about style: e.g. "professional product photography", "soft lifestyle shot", "minimal flat lay", "atmospheric mood".
- Tie the visual to the concept theme (e.g. fragrance, wellness, scent, ritual, experience).`;

/**
 * Generate a DALL-E-suitable image prompt from concept title and description.
 */
export async function generateConceptImagePrompt(
  title: string,
  description: string
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const userContent = `Concept title: ${title}\nDescription: ${description}\n\nWrite the image prompt.`;

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

/**
 * Generate a header image from a prompt using Fal AI (z-image/turbo/lora).
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
 * Generate a header image for a concept from its title and description.
 * Uses a visual agent: prompt from GPT then image from Fal AI.
 * Returns the image URL, or null on failure.
 */
export async function generateConceptImageFromContent(
  title: string,
  description: string
): Promise<string | null> {
  const imagePrompt = await generateConceptImagePrompt(title, description);
  if (!imagePrompt) return null;
  return generateConceptHeaderImage(imagePrompt);
}

/**
 * Run the concept image agent for multiple concepts in parallel.
 * Each item gets: GPT prompt from title + description, then Fal AI image.
 * Returns an array of image URLs (or null for failed items), in the same order as input.
 */
export async function generateConceptImagesInParallel(
  concepts: { title: string; description: string }[]
): Promise<(string | null)[]> {
  if (concepts.length === 0) return [];
  const results = await Promise.all(
    concepts.map((c) => generateConceptImageFromContent(c.title, c.description || c.title))
  );
  return results;
}
