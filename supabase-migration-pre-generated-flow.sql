-- Add a dedicated column for pre-generated flow data (insights, opportunity spaces, concepts for first pill).
-- Updating only this column avoids statement timeout when the main data JSONB is large.
-- Run this in Supabase SQL Editor if you already have the instances table.
ALTER TABLE instances ADD COLUMN IF NOT EXISTS pre_generated_flow_data JSONB;

-- Dedicated column for first recent project detail (concept titles, overviews, images).
-- Saves from the project page update only this column to avoid timeouts when payload is large (e.g. base64 images).
ALTER TABLE instances ADD COLUMN IF NOT EXISTS first_recent_project_data JSONB;

-- Theme (colors, typography) in its own column so design token updates don't read/write the whole data JSONB.
ALTER TABLE instances ADD COLUMN IF NOT EXISTS theme_data JSONB;
