/**
 * Supabase-based store for prototype instances.
 */

import { nanoid } from "nanoid";
import { supabase } from "./supabase";
import { replaceDataUrlsInFirstRecentProjectDetail, deleteInstanceStorageImages } from "./instance-image-storage";
import type { PrototypeInstance, CreateInstanceInput, ContentMap, PreGeneratedFlowData, FirstRecentProjectDetail } from "./types";

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
  const baseSlug = (input.slug ?? slugify(input.name)) || "instance";
  // Ensure unique slug: when slug is not explicitly provided (e.g. from generate route), append nanoid to avoid duplicate key
  const slug = input.slug != null ? baseSlug : `${baseSlug}-${nanoid(6)}`;
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
    preGeneratedFlowData: input.preGeneratedFlowData ?? undefined,
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
    theme_data: input.theme,
    first_recent_project_data:
      input.firstRecentProjectDetail != null
        ? replaceDataUrlsInFirstRecentProjectDetail(input.firstRecentProjectDetail)
        : null,
    pre_generated_flow_data: input.preGeneratedFlowData ?? null,
    data: {
      theme: input.theme,
      brand: input.brand,
      content: input.content,
      features: input.features,
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
    preGeneratedFlowData: source.preGeneratedFlowData ?? undefined,
    sourceInstanceId: sourceId,
  });
}

export async function getInstance(id: string): Promise<PrototypeInstance | null> {
  // Try full select first; if it fails (e.g. timeout from huge first_recent_project_data), retry without that column
  const { data, error } = await supabase
    .from("instances")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getInstance error:", id, error.message, error.code, error.details);
    // Brief pause before retry to avoid hammering an overloaded DB
    // Retry without first_recent_project_data in case the row is too large and caused timeout/failure
    const fallback = await supabase
      .from("instances")
      .select("id, name, slug, created_at, updated_at, password_hash, brief_summary, source_instance_id, published_slug, theme_data, data, pre_generated_flow_data")
      .eq("id", id)
      .single();
    if (fallback.error || !fallback.data) return null;
    const row = fallback.data as Record<string, unknown> & { data?: Record<string, unknown> | null; pre_generated_flow_data?: unknown; theme_data?: unknown };
    const dataPayload = row.data ?? {};
    return {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      passwordHash: row.password_hash as string | null,
      briefSummary: row.brief_summary as string,
      sourceInstanceId: row.source_instance_id as string | undefined,
      publishedSlug: row.published_slug as string | undefined,
      theme: (row.theme_data ?? dataPayload.theme ?? {}) as PrototypeInstance["theme"],
      brand: (dataPayload.brand ?? {}) as PrototypeInstance["brand"],
      content: (dataPayload.content ?? {}) as PrototypeInstance["content"],
      features: (dataPayload.features ?? {}) as PrototypeInstance["features"],
      firstRecentProjectDetail: dataPayload.firstRecentProjectDetail as PrototypeInstance["firstRecentProjectDetail"],
      preGeneratedFlowData: (row.pre_generated_flow_data ?? dataPayload.preGeneratedFlowData) as PrototypeInstance["preGeneratedFlowData"],
    };
  }
  if (!data) return null;

  const row = data as Record<string, unknown> & {
    data?: Record<string, unknown> | null;
    pre_generated_flow_data?: unknown;
    first_recent_project_data?: unknown;
    theme_data?: unknown;
  };
  const dataPayload = row.data ?? {};
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    passwordHash: row.password_hash as string | null,
    briefSummary: row.brief_summary as string,
    sourceInstanceId: row.source_instance_id as string | undefined,
    publishedSlug: row.published_slug as string | undefined,
    theme: (row.theme_data ?? dataPayload.theme ?? {}) as PrototypeInstance["theme"],
    brand: (dataPayload.brand ?? {}) as PrototypeInstance["brand"],
    content: (dataPayload.content ?? {}) as PrototypeInstance["content"],
    features: (dataPayload.features ?? {}) as PrototypeInstance["features"],
    firstRecentProjectDetail: (row.first_recent_project_data ?? dataPayload.firstRecentProjectDetail) as PrototypeInstance["firstRecentProjectDetail"],
    preGeneratedFlowData: (row.pre_generated_flow_data ?? dataPayload.preGeneratedFlowData) as PrototypeInstance["preGeneratedFlowData"],
  };
}

export async function getInstanceBySlug(slug: string): Promise<PrototypeInstance | null> {
  const { data, error } = await supabase
    .from("instances")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("getInstanceBySlug error:", slug, error.message, error.code, error.details);
    return null;
  }
  if (!data) return null;

  const row = data as Record<string, unknown> & {
    data?: Record<string, unknown> | null;
    pre_generated_flow_data?: unknown;
    first_recent_project_data?: unknown;
    theme_data?: unknown;
  };
  const dataPayload = row.data ?? {};
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    passwordHash: row.password_hash as string | null,
    briefSummary: row.brief_summary as string,
    sourceInstanceId: row.source_instance_id as string | undefined,
    publishedSlug: row.published_slug as string | undefined,
    theme: (row.theme_data ?? dataPayload.theme ?? {}) as PrototypeInstance["theme"],
    brand: (dataPayload.brand ?? {}) as PrototypeInstance["brand"],
    content: (dataPayload.content ?? {}) as PrototypeInstance["content"],
    features: (dataPayload.features ?? {}) as PrototypeInstance["features"],
    firstRecentProjectDetail: (row.first_recent_project_data ?? dataPayload.firstRecentProjectDetail) as PrototypeInstance["firstRecentProjectDetail"],
    preGeneratedFlowData: (row.pre_generated_flow_data ?? dataPayload.preGeneratedFlowData) as PrototypeInstance["preGeneratedFlowData"],
  };
}

export async function listInstances(): Promise<IndexEntry[]> {
  const { data, error } = await supabase
    .from("instances")
    .select("id, name, slug, created_at, source_instance_id, published_slug, password_hash")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  // Only show main instances in the library (no published copies).
  return data
    .filter((row) => row.source_instance_id == null || String(row.source_instance_id).trim() === "")
    .map((row) => ({
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
    .or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .filter((row) => row.source_instance_id == null || String(row.source_instance_id).trim() === "")
    .map((row) => ({
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
 * Delete an instance and all its data (DB row + images in Storage bucket).
 */
export async function deleteInstance(id: string): Promise<boolean> {
  await deleteInstanceStorageImages(id);
  const { error } = await supabase
    .from("instances")
    .delete()
    .eq("id", id);

  return !error;
}

/** Theme type for instance (colors + typography) */
type InstanceTheme = PrototypeInstance["theme"];

/**
 * Update only the theme column. No read — client sends full theme (e.g. after merging one token change).
 * Avoids full getInstance/timeouts. Returns the theme that was written, or null on error.
 */
export async function updateInstanceTheme(id: string, theme: InstanceTheme): Promise<InstanceTheme | null> {
  const { error } = await supabase
    .from("instances")
    .update({ theme_data: theme })
    .eq("id", id);

  if (error) {
    console.error("updateInstanceTheme failed:", id, error.message, error.details);
    return null;
  }
  return theme;
}

/**
 * Update an existing instance (partial update). Merges theme colors and/or content if provided.
 * publishedSlug can be set when publishing (so the source instance tracks its published URL).
 */
export async function updateInstance(
  id: string,
  updates: {
    name?: string;
    theme?: Partial<PrototypeInstance["theme"]>;
    content?: Partial<ContentMap>;
    firstRecentProjectDetail?: FirstRecentProjectDetail | null;
    publishedSlug?: string;
    preGeneratedFlowData?: PreGeneratedFlowData | null;
  }
): Promise<PrototypeInstance | null> {
  const instance = await getInstance(id);
  if (!instance) return null;

  // Name-only update: single column, no full data read/write
  const onlyName =
    updates.name !== undefined &&
    updates.theme === undefined &&
    updates.content === undefined &&
    updates.firstRecentProjectDetail === undefined &&
    updates.publishedSlug === undefined &&
    updates.preGeneratedFlowData === undefined;
  if (onlyName) {
    const newName = String(updates.name ?? "").trim() || instance.name;
    const { error: nameError } = await supabase
      .from("instances")
      .update({ name: newName })
      .eq("id", id);
    if (nameError) {
      console.error("updateInstance (name) failed:", id, nameError.message);
      return null;
    }
    return getInstance(id);
  }

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

  if (updates.preGeneratedFlowData !== undefined) {
    instance.preGeneratedFlowData = updates.preGeneratedFlowData;
  }

  if (updates.firstRecentProjectDetail !== undefined) {
    instance.firstRecentProjectDetail = updates.firstRecentProjectDetail;
  }

  // When ONLY updating firstRecentProjectDetail, use the dedicated column to avoid huge JSONB update (prevents timeout)
  const onlyFirstRecentProjectDetail =
    updates.firstRecentProjectDetail !== undefined &&
    updates.theme === undefined &&
    updates.content === undefined &&
    updates.publishedSlug === undefined &&
    updates.preGeneratedFlowData === undefined;

  if (onlyFirstRecentProjectDetail) {
    const { error: updateError } = await supabase
      .from("instances")
      .update({ first_recent_project_data: updates.firstRecentProjectDetail })
      .eq("id", id);
    if (updateError) {
      console.error("updateInstance (first_recent_project_data) failed:", id, updateError.message, updateError.details);
      throw new Error(
        `First recent project save failed: ${updateError.message}. Run the migration to add column: ALTER TABLE instances ADD COLUMN IF NOT EXISTS first_recent_project_data JSONB;`
      );
    }
    return getInstance(id);
  }

  // When ONLY updating preGeneratedFlowData, use the dedicated column to avoid a huge JSONB update (prevents statement timeout)
  const onlyPreGeneratedFlowData =
    updates.preGeneratedFlowData !== undefined &&
    updates.theme === undefined &&
    updates.content === undefined &&
    updates.publishedSlug === undefined;

  if (onlyPreGeneratedFlowData) {
    const { error: updateError } = await supabase
      .from("instances")
      .update({ pre_generated_flow_data: updates.preGeneratedFlowData })
      .eq("id", id);
    if (updateError) {
      console.error("updateInstance (pre_generated_flow_data) failed:", id, updateError.message, updateError.details);
      return null;
    }
    return getInstance(id);
  }

  // Prepare update data (theme, content, publishedSlug, name, or full data sync).
  // Keep data column small: only theme, brand, content, features. firstRecentProjectDetail and preGeneratedFlowData live in dedicated columns.
  const updateData: Record<string, unknown> = {
    data: {
      theme: instance.theme,
      brand: instance.brand,
      content: instance.content,
      features: instance.features,
    },
  };

  if (updates.publishedSlug !== undefined) {
    updateData.published_slug = updates.publishedSlug;
  }
  if (updates.name !== undefined) {
    const newName = String(updates.name).trim() || instance.name;
    updateData.name = newName;
  }

  const { error } = await supabase
    .from("instances")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("updateInstance failed:", id, error.message, error.details);
    return null;
  }
  return getInstance(id);
}

/**
 * Update a single concept within the first recent project detail.
 * Reads only the first_recent_project_data column (avoids full getInstance timeout), patches the concept, writes back.
 * Returns the updated FirstRecentProjectDetail so the client can merge; does not return full instance (avoids second timeout).
 */
export async function updateInstanceConcept(
  id: string,
  opportunityId: string,
  conceptId: string,
  patch: { title?: string; overview?: string; image?: string }
): Promise<FirstRecentProjectDetail | null> {
  const { data: row, error: selectError } = await supabase
    .from("instances")
    .select("first_recent_project_data")
    .eq("id", id)
    .single();

  if (selectError || !row) {
    console.error("updateInstanceConcept select error:", id, selectError?.message);
    return null;
  }

  const detail = row.first_recent_project_data as FirstRecentProjectDetail | null;
  if (!detail?.opportunities?.length) return null;

  const nextOpportunities = detail.opportunities.map((opp) => {
    if (opp.id !== opportunityId) return opp;
    return {
      ...opp,
      concepts: opp.concepts.map((c) => {
        if (c.id !== conceptId) return c;
        return { ...c, ...patch };
      }),
    };
  });
  const updatedDetail: FirstRecentProjectDetail = { ...detail, opportunities: nextOpportunities };

  const { error: updateError } = await supabase
    .from("instances")
    .update({ first_recent_project_data: updatedDetail })
    .eq("id", id);

  if (updateError) {
    console.error("updateInstanceConcept update failed:", id, updateError.message, updateError.details);
    return null;
  }
  return updatedDetail;
}
