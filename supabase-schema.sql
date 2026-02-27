-- Create instances table
-- This stores all prototype instances (both draft and published)
CREATE TABLE IF NOT EXISTS instances (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  password_hash TEXT,
  brief_summary TEXT NOT NULL,
  source_instance_id TEXT,
  published_slug TEXT,
  data JSONB NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_instances_slug ON instances(slug);
CREATE INDEX IF NOT EXISTS idx_instances_created_at ON instances(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_instances_source ON instances(source_instance_id) WHERE source_instance_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_instances_name ON instances USING gin(to_tsvector('english', name));

-- Create index entry table (for fast library listing)
CREATE TABLE IF NOT EXISTS instance_index (
  id TEXT PRIMARY KEY REFERENCES instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  source_instance_id TEXT,
  published_slug TEXT,
  has_password BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create trigger to keep index in sync
CREATE OR REPLACE FUNCTION update_instance_index()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO instance_index (id, name, slug, created_at, source_instance_id, published_slug, has_password)
  VALUES (NEW.id, NEW.name, NEW.slug, NEW.created_at, NEW.source_instance_id, NEW.published_slug, NEW.password_hash IS NOT NULL)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    source_instance_id = EXCLUDED.source_instance_id,
    published_slug = EXCLUDED.published_slug,
    has_password = EXCLUDED.has_password;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER instances_index_sync
  AFTER INSERT OR UPDATE ON instances
  FOR EACH ROW
  EXECUTE FUNCTION update_instance_index();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER instances_updated_at
  BEFORE UPDATE ON instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
