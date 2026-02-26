/**
 * Analyzes a theme/screenshot image and returns a short prompt describing the color scheme
 * for the UI generator. Uses OpenAI GPT-4o (vision) when OPENAI_API_KEY is set.
 */

const THEME_IMAGE_SYSTEM_PROMPT = `You are a UI color analyst. Given a screenshot or image of a theme, interface, or brand, describe the color scheme in 1–3 short sentences that can be used as instructions for a UI color generator.

Focus on:
- Primary and accent colors (use color names or "dark blue", "bright yellow", etc.)
- Overall mood (e.g. "mainly blues", "warm earth tones", "high contrast")
- Any specific hex-like or palette notes if clearly visible

Output only the description text, no preamble. Keep it concise so it can be pasted into a "UI scheme" field. Example: "Deep blue primary with gold accent, professional and high contrast."`;

/**
 * Analyze an image (data URL or base64 string) and return a color-scheme prompt for the UI generator.
 * Returns null if OPENAI_API_KEY is missing or the request fails.
 */
export async function analyzeThemeImage(imageDataUrlOrBase64: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  let imageUrl = imageDataUrlOrBase64.trim();
  if (!imageUrl.startsWith("data:")) {
    imageUrl = `data:image/png;base64,${imageUrl}`;
  }

  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: THEME_IMAGE_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Describe the color scheme in this image for a UI theme generator." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 150,
    temperature: 0.2,
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
      console.error("OpenAI Vision API error:", res.status, err);
      return null;
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content?.trim();
    return raw || null;
  } catch (e) {
    console.error("Theme image analysis failed:", e);
    return null;
  }
}
