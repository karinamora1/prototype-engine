/**
 * File-based store for prototype instances.
 * In production you could swap this for a database.
 */

import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { PrototypeInstance, CreateInstanceInput, ContentMap } from "./types";

function getBaseDataDir(): string {
  if (process.env.BOI_DATA_DIR) return process.env.BOI_DATA_DIR;
  // Vercel (and most serverless runtimes) only allow writes to /tmp at runtime.
  if (process.env.VERCEL) return path.join("/tmp", "boi-prototype-engine-data");
  return path.join(process.cwd(), "data");
}

const BASE_DATA_DIR = getBaseDataDir();
const DATA_DIR = path.join(BASE_DATA_DIR, "instances");
const INDEX_FILE = path.join(BASE_DATA_DIR, "index.json");

export type IndexEntry = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  sourceInstanceId?: string;
  publishedSlug?: string;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Simple hash for password storage (use bcrypt in production) */
function simpleHash(password: string): string {
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i);
    h = (h << 5) - h + c;
    h = h & h;
  }
  return "h_" + Math.abs(h).toString(16);
}

export async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(path.dirname(INDEX_FILE));
  } catch {
    await fs.mkdir(path.dirname(INDEX_FILE), { recursive: true });
  }
}

async function readIndex(): Promise<IndexEntry[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(INDEX_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((e: Record<string, unknown>) => ({
      id: String(e.id ?? ""),
      name: String(e.name ?? ""),
      slug: String(e.slug ?? ""),
      createdAt: String(e.createdAt ?? ""),
      sourceInstanceId: e.sourceInstanceId != null ? String(e.sourceInstanceId) : undefined,
      publishedSlug: e.publishedSlug != null ? String(e.publishedSlug) : undefined,
    })) : [];
  } catch {
    return [];
  }
}

async function writeIndex(entries: IndexEntry[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(INDEX_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function createInstance(input: CreateInstanceInput): Promise<PrototypeInstance> {
  await ensureDataDir();
  const id = nanoid(10);
  const slug = input.slug ?? slugify(input.name);
  const now = new Date().toISOString();
  const instance: PrototypeInstance = {
    id,
    name: input.name,
    slug,
    createdAt: now,
    updatedAt: now,
    theme: input.theme,
    brand: input.brand,
    content: input.content,
    features: input.features,
    passwordHash: input.password ? simpleHash(input.password) : null,
    briefSummary: input.briefSummary,
    firstRecentProjectDetail: input.firstRecentProjectDetail ?? undefined,
    sourceInstanceId: input.sourceInstanceId,
  };
  const filePath = path.join(DATA_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(instance, null, 2), "utf-8");
  const index = await readIndex();
  index.push({
    id,
    name: input.name,
    slug,
    createdAt: now,
    sourceInstanceId: input.sourceInstanceId,
  });
  await writeIndex(index);
  return instance;
}

/**
 * Create a copy of an existing instance (e.g. for "Publish"). Uses a unique slug for the new instance.
 */
export async function duplicateInstance(
  sourceId: string,
  options: { name: string; password?: string }
): Promise<PrototypeInstance | null> {
  const source = await getInstance(sourceId);
  if (!source) return null;
  const uniqueSlug = slugify(options.name) + "-" + nanoid(6);
  return createInstance({
    name: options.name,
    slug: uniqueSlug,
    theme: source.theme,
    brand: source.brand,
    content: { ...source.content },
    features: { ...source.features },
    password: options.password,
    briefSummary: source.briefSummary,
    firstRecentProjectDetail: source.firstRecentProjectDetail ?? undefined,
    sourceInstanceId: sourceId,
  });
}

export async function getInstance(id: string): Promise<PrototypeInstance | null> {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as PrototypeInstance;
  } catch {
    return null;
  }
}

export async function getInstanceBySlug(slug: string): Promise<PrototypeInstance | null> {
  const index = await readIndex();
  const entry = index.find((e) => e.slug === slug);
  if (!entry) return null;
  return getInstance(entry.id);
}

export async function listInstances(): Promise<IndexEntry[]> {
  const index = await readIndex();
  const filtered = index.filter((e) => !e.sourceInstanceId);
  return filtered.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export async function searchInstances(query: string): Promise<IndexEntry[]> {
  const index = await readIndex();
  const filtered = index.filter((e) => !e.sourceInstanceId);
  const q = query.toLowerCase().trim();
  if (!q) return filtered.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  return filtered.filter((e) => e.name.toLowerCase().includes(q) || e.slug.includes(q));
}

/** Update an index entry (e.g. set publishedSlug on the source after publishing). */
export async function updateIndexEntry(
  id: string,
  updates: { publishedSlug?: string }
): Promise<boolean> {
  const index = await readIndex();
  const entry = index.find((e) => e.id === id);
  if (!entry) return false;
  if (updates.publishedSlug !== undefined) entry.publishedSlug = updates.publishedSlug;
  await writeIndex(index);
  return true;
}

export function verifyPassword(instance: PrototypeInstance, password: string): boolean {
  if (!instance.passwordHash) return true;
  return instance.passwordHash === simpleHash(password);
}

/**
 * Delete an instance and all its data: remove from index and delete the instance JSON file.
 */
export async function deleteInstance(id: string): Promise<boolean> {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  const index = await readIndex();
  const idx = index.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  index.splice(idx, 1);
  await writeIndex(index);
  try {
    await fs.unlink(filePath);
  } catch {
    // File might already be missing; index is updated
  }
  return true;
}

/**
 * Update an existing instance (partial update). Merges theme colors and/or content if provided.
 * publishedSlug can be set when publishing (so the source instance tracks its published URL).
 */
export async function updateInstance(
  id: string,
  updates: {
    theme?: Partial<PrototypeInstance["theme"]>;
    content?: Partial<ContentMap>;
    publishedSlug?: string;
  }
): Promise<PrototypeInstance | null> {
  const instance = await getInstance(id);
  if (!instance) return null;
  const now = new Date().toISOString();
  if (updates.theme) {
    if (updates.theme.colors) {
      instance.theme = {
        ...instance.theme,
        colors: { ...instance.theme.colors, ...updates.theme.colors },
      };
    }
    if (updates.theme.typography) {
      instance.theme = {
        ...instance.theme,
        typography: { ...instance.theme.typography, ...updates.theme.typography },
      };
    }
  }
  if (updates.content != null && typeof updates.content === "object") {
    const merged: ContentMap = { ...instance.content };
    for (const [k, v] of Object.entries(updates.content)) {
      if (typeof v === "string") merged[k] = v;
    }
    instance.content = merged;
  }
  if (updates.publishedSlug !== undefined) {
    instance.publishedSlug = updates.publishedSlug;
  }
  instance.updatedAt = now;
  const filePath = path.join(DATA_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(instance, null, 2), "utf-8");
  return instance;
}
