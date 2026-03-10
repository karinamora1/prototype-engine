-- Add flag to distinguish Demo Library vs Project Library instances.
-- Demo Library: source_instance_id IS NULL AND is_project_file = false.
-- Project Library: is_project_file = true (fully detached copies for client work).
ALTER TABLE instances ADD COLUMN IF NOT EXISTS is_project_file BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_instances_is_project_file ON instances(is_project_file) WHERE is_project_file = true;
