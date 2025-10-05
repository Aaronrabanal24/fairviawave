-- Run this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/olrhqzvnqoymubturijo/sql/new

-- Create units table
CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  "publishedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  "unitId" TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  visibility TEXT NOT NULL DEFAULT 'internal',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT events_unit_fkey FOREIGN KEY ("unitId") REFERENCES units(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS events_unitId_idx ON events("unitId");
CREATE INDEX IF NOT EXISTS events_visibility_idx ON events(visibility);

-- Function to auto-update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updatedAt on units
DROP TRIGGER IF EXISTS update_units_updated_at ON units;
CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
