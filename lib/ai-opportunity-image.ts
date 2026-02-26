/**
 * AI agent that turns opportunity space content (title, description, benefits) into an image prompt
 * and generates a header image via Fal AI.
 */

const IMAGE_PROMPT_SYSTEM = `You are a creative director. Given an opportunity space's title, description, and key benefits, write a single image prompt for a text-to-image model that will become a hero/header image for a dashboard.

Rules:
- Output only the image prompt, nothing else. No quotes, no preamble.
- The prompt should be visual and evocative: describe a scene, mood, or concept that represents the opportunity. Think wide-format hero image (will be displayed at 1792x1024).
- Do not ask for text or words to appear in the image.
- Keep it to 2-4 sentences. Be specific about style: e.g. "professional product photography", "soft lifestyle shot", "abstract gradient", "minimal flat lay".
- Avoid generic stock phrases; tie the visual to the opportunity theme (e.g. fragrance, wellness, scent, home).`;

/**
 * Generate a DALL-E-suitable image prompt from opportunity title, description, and benefits.
 * Returns null if OPENAI_API_KEY is missing or the request fails.
 */
export async function generateOpportunityImagePrompt(
  title: string,
  description: string,
  benefits: string[]
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const benefitsText = benefits.slice(0, 3).join(" ");
  const userContent = `Opportunity title: ${title}\nDescription: ${description}\nKey benefits: ${benefitsText}\n\nWrite the image prompt.`;

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
        { role: "system", content: IMAGE_PROMPT_SYSTEM },
        { role: "user", content: userContent },
      ],
      max_tokens: 200,
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI image prompt API error:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const prompt = data.choices?.[0]?.message?.content?.trim();
  return prompt && prompt.length > 0 ? prompt : null;
}

/**
 * Generate a header image from a prompt using Fal AI (z-image/turbo/lora).
 * Returns the image URL, or null if FAL_KEY is missing or the request fails.
 */
export async function generateOpportunityHeaderImage(prompt: string): Promise<string | null> {
  const { generateFalImage } = await import("@/lib/fal-image");
  return generateFalImage({
    prompt,
    image_size: "landscape_4_3",
    num_images: 1,
  });
}

/**
 * Generate a header image for an opportunity from its title, description, and benefits.
 * First creates an image prompt via chat, then generates the image via Fal AI.
 * Returns the image URL, or null on failure.
 */
export async function generateOpportunityImageFromContent(
  title: string,
  description: string,
  benefits: string[]
): Promise<string | null> {
  const imagePrompt = await generateOpportunityImagePrompt(title, description, benefits);
  if (!imagePrompt) return null;
  return generateOpportunityHeaderImage(imagePrompt);
}
