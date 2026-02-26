/**
 * File-based store for prototype instances.
 * In production you could swap this for a database.
 */

import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { PrototypeInstance, CreateInstanceInput } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "instances");
const INDEX_FILE = path.join(process.cwd(), "data", "index.json");

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

async function readIndex(): Promise<{ id: string; name: string; slug: string; createdAt: string }[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(INDEX_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeIndex(entries: { id: string; name: string; slug: string; createdAt: string }[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(INDEX_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function createInstance(input: CreateInstanceInput): Promise<PrototypeInstance> {
  await ensureDataDir();
  const id = nanoid(10);
  const slug = slugify(input.name);
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
  };
  const filePath = path.join(DATA_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(instance, null, 2), "utf-8");
  const index = await readIndex();
  index.push({ id, name: input.name, slug, createdAt: now });
  await writeIndex(index);
  return instance;
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

export async function listInstances(): Promise<{ id: string; name: string; slug: string; createdAt: string }[]> {
  const index = await readIndex();
  return index.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export async function searchInstances(query: string): Promise<{ id: string; name: string; slug: string; createdAt: string }[]> {
  const index = await readIndex();
  const q = query.toLowerCase().trim();
  if (!q) return index.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  return index.filter((e) => e.name.toLowerCase().includes(q) || e.slug.includes(q));
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
 * Update an existing instance (partial update). Merges theme colors if provided.
 * Returns the updated instance or null if not found.
 */
export async function updateInstance(
  id: string,
  updates: { theme?: Partial<PrototypeInstance["theme"]> }
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
  instance.updatedAt = now;
  const filePath = path.join(DATA_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(instance, null, 2), "utf-8");
  return instance;
}
