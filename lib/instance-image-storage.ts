/**
 * Upload instance images to Supabase Storage so we store public URLs instead of base64 in JSON.
 * Used by generate route (first recent project + pregen flow) and concept PATCH (replace image).
 */

import { supabase } from "./supabase";

const BUCKET = "instance-images";
const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.75;
const UPLOAD_CONCURRENCY = 3;

let bucketEnsured = false;

function isDataUrl(s: string): boolean {
  return typeof s === "string" && s.startsWith("data:") && s.includes(";base64,");
}

/** Placeholder URL when we avoid storing base64 (e.g. upload failed or pre-upload). Keeps JSONB small to prevent statement timeout. */
const PLACEHOLDER_IMAGE_URL = "https://placehold.co/400x300?text=Image";

/**
 * Replace any data URL (base64) in first recent project detail with a small placeholder URL.
 * Use before writing to DB so we never trigger statement timeout from huge JSONB.
 */
export function replaceDataUrlsInFirstRecentProjectDetail<T extends { opportunities?: Array<{ concepts?: Array<{ image?: string }>; image?: string }>; enrichedForInnovationFlow?: { opportunities?: Array<{ concepts?: Array<{ image?: string }>; image?: string }> } }>(detail: T): T {
  if (!detail) return detail;
  const replace = (s: string | undefined): string => {
    if (typeof s !== "string" || !isDataUrl(s.trim())) return s ?? PLACEHOLDER_IMAGE_URL;
    return PLACEHOLDER_IMAGE_URL;
  };
  const opportunities = detail.opportunities?.map((opp) => ({
    ...opp,
    image: replace(opp.image),
    concepts: opp.concepts?.map((c) => ({ ...c, image: replace(c.image) })),
  }));
  const enriched = detail.enrichedForInnovationFlow?.opportunities?.map((opp) => ({
    ...opp,
    image: replace(opp.image),
    concepts: opp.concepts?.map((c) => ({ ...c, image: replace(c.image) })),
  }));
  return {
    ...detail,
    opportunities: opportunities ?? detail.opportunities,
    enrichedForInnovationFlow: enriched
      ? { opportunities: enriched }
      : detail.enrichedForInnovationFlow,
  } as T;
}

/**
 * Replace any data URL in pre-generated flow data with a small placeholder. Use before writing to DB.
 */
export function replaceDataUrlsInPreGeneratedFlowData<T extends {
  opportunitySpaces?: Array<{ image?: string }>;
  conceptsForFirstOpportunity?: Array<{ image?: string }>;
}>(data: T): T {
  if (!data) return data;
  const replace = (s: string | undefined): string => {
    if (typeof s !== "string" || !isDataUrl(s.trim())) return s ?? PLACEHOLDER_IMAGE_URL;
    return PLACEHOLDER_IMAGE_URL;
  };
  return {
    ...data,
    opportunitySpaces: data.opportunitySpaces?.map((o) => ({ ...o, image: replace(o.image) })) ?? data.opportunitySpaces,
    conceptsForFirstOpportunity: data.conceptsForFirstOpportunity?.map((c) => ({ ...c, image: replace(c.image) })) ?? data.conceptsForFirstOpportunity,
  } as T;
}

/** Ensure the storage bucket exists (public read). Called once per process to avoid hammering Supabase. */
async function ensureBucket(): Promise<void> {
  if (bucketEnsured) return;
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  });
  if (error && error.message?.toLowerCase().includes("already exists")) {
    bucketEnsured = true;
    return;
  }
  if (error) {
    console.warn("Instance image bucket create:", error.message);
    return;
  }
  bucketEnsured = true;
}

/**
 * Compress image buffer with sharp: resize so longest side <= MAX_DIMENSION, encode as JPEG.
 * Returns buffer or null on failure.
 */
async function compressImageBuffer(input: Buffer, mime: string): Promise<Buffer | null> {
  try {
    const sharp = (await import("sharp")).default;
    const pipeline = sharp(input);
    const meta = await pipeline.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const resized =
      w > MAX_DIMENSION || h > MAX_DIMENSION
        ? pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside" })
        : pipeline;
    return resized
      .jpeg({ quality: Math.round(JPEG_QUALITY * 100) })
      .toBuffer();
  } catch (e) {
    console.warn("Image compress failed:", e);
    return null;
  }
}

/**
 * Upload an image to Supabase Storage and return its public URL.
 * - If imageValue is already an http(s) URL, returns it unchanged.
 * - If imageValue is a data URL (data:image/...;base64,...), decodes, compresses (sharp), uploads to
 *   {BUCKET}/{instanceId}/{pathKey}.jpg, and returns the public URL.
 */
export async function uploadInstanceImage(
  instanceId: string,
  pathKey: string,
  imageValue: string
): Promise<string> {
  if (!imageValue || typeof imageValue !== "string") return imageValue;
  const trimmed = imageValue.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  if (!isDataUrl(trimmed)) return trimmed;

  const base64Match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (!base64Match) return trimmed;
  const mime = base64Match[1];
  const base64 = base64Match[2];
  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    return trimmed;
  }
  if (buffer.length === 0) return trimmed;

  await ensureBucket();

  const compressed = await compressImageBuffer(buffer, mime);
  const body = compressed ?? buffer;
  const path = `${instanceId}/${pathKey.replace(/[^a-z0-9_-]/gi, "-")}.jpg`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) {
    console.error("Instance image upload failed:", path, error.message);
    return trimmed;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Run up to `concurrency` promises at a time. Reduces load on Supabase Storage/DB.
 */
async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const i = index++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export type UploadTask = { instanceId: string; pathKey: string; imageValue: string };

/**
 * Upload multiple images with limited concurrency to avoid overwhelming Supabase.
 * Ensures bucket once, then runs at most UPLOAD_CONCURRENCY uploads at a time.
 */
export async function uploadInstanceImagesBatched(
  tasks: UploadTask[],
  concurrency: number = UPLOAD_CONCURRENCY
): Promise<string[]> {
  if (tasks.length === 0) return [];
  await ensureBucket();
  return runWithConcurrency(tasks, concurrency, (t) =>
    uploadInstanceImage(t.instanceId, t.pathKey, t.imageValue)
  );
}

const REMOVE_BATCH_SIZE = 1000;

/**
 * List all file paths under a prefix (recursive). Supabase list() returns one level per call.
 */
async function listAllFilePathsUnderPrefix(prefix: string): Promise<string[]> {
  const paths: string[] = [];
  const segment = prefix.replace(/\/$/, "");
  const { data, error } = await supabase.storage.from(BUCKET).list(segment, { limit: 1000 });
  if (error) {
    console.warn("Storage list error:", segment, error.message);
    return [];
  }
  if (!data?.length) return [];
  for (const item of data) {
    const fullPath = segment ? `${segment}/${item.name}` : item.name;
    // If the item has no extension and we can list it, treat as folder (nested paths)
    const hasExtension = item.name.includes(".");
    if (!hasExtension) {
      const nested = await listAllFilePathsUnderPrefix(fullPath);
          paths.push(...nested);
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

/**
 * Delete all images in the instance-images bucket for the given instance (paths like {instanceId}/...).
 * Call when deleting an instance so Storage doesn't keep orphaned files.
 */
export async function deleteInstanceStorageImages(instanceId: string): Promise<void> {
  if (!instanceId?.trim()) return;
  const paths = await listAllFilePathsUnderPrefix(instanceId);
  if (paths.length === 0) return;
  for (let i = 0; i < paths.length; i += REMOVE_BATCH_SIZE) {
    const batch = paths.slice(i, i + REMOVE_BATCH_SIZE);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) console.error("Storage delete batch failed:", instanceId, error.message);
  }
}
