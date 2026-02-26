/**
 * Central Fal AI image generation using fal-ai/z-image/turbo/lora.
 * Uses FAL_KEY from environment. Returns the first generated image URL or null.
 */

import { fal } from "@fal-ai/client";

const FAL_MODEL = "fal-ai/z-image/turbo/lora";

export type FalImageSize =
  | "landscape_4_3"
  | "portrait_4_3"
  | "square"
  | "square_hd"
  | (string & {});

export interface GenerateFalImageInput {
  prompt: string;
  image_size?: FalImageSize;
  num_images?: number;
}

/**
 * Generate an image with Fal AI z-image/turbo/lora.
 * Returns the URL of the first image, or null if FAL_KEY is missing or the request fails.
 */
export async function generateFalImage(input: GenerateFalImageInput): Promise<string | null> {
  const key = process.env.FAL_KEY?.trim();
  if (!key) return null;

  try {
    const result = await fal.subscribe(FAL_MODEL, {
      input: {
        prompt: input.prompt.slice(0, 1000),
        image_size: input.image_size ?? "landscape_4_3",
        num_images: input.num_images ?? 1,
      },
    });

    const images = (result.data as { images?: { url?: string }[] })?.images;
    const url = images?.[0]?.url;
    return url && url.length > 0 ? url : null;
  } catch (e) {
    console.error("Fal image generation failed:", e);
    return null;
  }
}
