/**
 * Supabase-based store for prototype instances.
 */

import { nanoid } from "nanoid";
import { supabase } from "./supabase";
import type { PrototypeInstance, CreateInstanceInput, ContentMap } from "./types";

export type IndexEntry = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  sourceInstanceId?: string;
  publishedSlug?: string;
  hasPassword?: boolean;
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


export async function createInstance(input: CreateInstanceInput): Promise<PrototypeInstance> {
  const id = nanoid(10);
  const slug = input.slug ?? slugify(input.name);
  const now = new Date().toISOString();
  const trimmedPassword = input.password?.trim();
  
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
    passwordHash: trimmedPassword ? simpleHash(trimmedPassword) : null,
    briefSummary: input.briefSummary,
    firstRecentProjectDetail: input.firstRecentProjectDetail ?? undefined,
    sourceInstanceId: input.sourceInstanceId,
  };

  const { error } = await supabase.from("instances").insert({
    id,
    name: input.name,
    slug,
    password_hash: instance.passwordHash,
    brief_summary: input.briefSummary,
    source_instance_id: input.sourceInstanceId,
    published_slug: null,
    data: {
      theme: input.theme,
      brand: input.brand,
      content: input.content,
      features: input.features,
      firstRecentProjectDetail: input.firstRecentProjectDetail,
    },
  });

  if (error) {
    throw new Error(`Failed to create instance: ${error.message}`);
  }

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
  const { data, error } = await supabase
    .from("instances")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    passwordHash: data.password_hash,
    briefSummary: data.brief_summary,
    sourceInstanceId: data.source_instance_id,
    publishedSlug: data.published_slug,
    theme: data.data.theme,
    brand: data.data.brand,
    content: data.data.content,
    features: data.data.features,
    firstRecentProjectDetail: data.data.firstRecentProjectDetail,
  };
}

export async function getInstanceBySlug(slug: string): Promise<PrototypeInstance | null> {
  const { data, error } = await supabase
    .from("instances")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    passwordHash: data.password_hash,
    briefSummary: data.brief_summary,
    sourceInstanceId: data.source_instance_id,
    publishedSlug: data.published_slug,
    theme: data.data.theme,
    brand: data.data.brand,
    content: data.data.content,
    features: data.data.features,
    firstRecentProjectDetail: data.data.firstRecentProjectDetail,
  };
}

export async function listInstances(): Promise<IndexEntry[]> {
  const { data, error } = await supabase
    .from("instances")
    .select("id, name, slug, created_at, source_instance_id, published_slug, password_hash")
    .is("source_instance_id", null)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    sourceInstanceId: row.source_instance_id,
    publishedSlug: row.published_slug,
    hasPassword: !!row.password_hash,
  }));
}

export async function searchInstances(query: string): Promise<IndexEntry[]> {
  const q = query.toLowerCase().trim();

  if (!q) {
    return listInstances();
  }

  const { data, error } = await supabase
    .from("instances")
    .select("id, name, slug, created_at, source_instance_id, published_slug, password_hash")
    .is("source_instance_id", null)
    .or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    sourceInstanceId: row.source_instance_id,
    publishedSlug: row.published_slug,
    hasPassword: !!row.password_hash,
  }));
}

/** Update an index entry (e.g. set publishedSlug on the source after publishing). */
export async function updateIndexEntry(
  id: string,
  updates: { publishedSlug?: string }
): Promise<boolean> {
  const updateData: Record<string, unknown> = {};
  if (updates.publishedSlug !== undefined) {
    updateData.published_slug = updates.publishedSlug;
  }

  const { error } = await supabase
    .from("instances")
    .update(updateData)
    .eq("id", id);

  return !error;
}

export function verifyPassword(instance: PrototypeInstance, password: string): boolean {
  if (!instance.passwordHash) return true;
  const trimmedPassword = password?.trim() ?? "";
  return instance.passwordHash === simpleHash(trimmedPassword);
}

/**
 * Remove password protection from an instance.
 */
export async function removePassword(id: string): Promise<PrototypeInstance | null> {
  const { error } = await supabase
    .from("instances")
    .update({ password_hash: null })
    .eq("id", id);

  if (error) return null;
  return getInstance(id);
}

/**
 * Delete an instance and all its data.
 */
export async function deleteInstance(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("instances")
    .delete()
    .eq("id", id);

  return !error;
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

  // Merge theme updates
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

  // Merge content updates
  if (updates.content != null && typeof updates.content === "object") {
    const merged: ContentMap = { ...instance.content };
    for (const [k, v] of Object.entries(updates.content)) {
      if (typeof v === "string") merged[k] = v;
    }
    instance.content = merged;
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {
    data: {
      theme: instance.theme,
      brand: instance.brand,
      content: instance.content,
      features: instance.features,
      firstRecentProjectDetail: instance.firstRecentProjectDetail,
    },
  };

  if (updates.publishedSlug !== undefined) {
    updateData.published_slug = updates.publishedSlug;
  }

  const { error } = await supabase
    .from("instances")
    .update(updateData)
    .eq("id", id);

  if (error) return null;
  return getInstance(id);
}
