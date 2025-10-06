-- Wave 2 Enhancement: Add signals table for conversion tracking
-- Run this in Supabase SQL Editor

-- Create signals table
CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  "unitId" TEXT NOT NULL,
  type TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT,
  "ipHash" TEXT NOT NULL,
  "userAgent" TEXT,
  score INT NOT NULL DEFAULT 0,
  metadata JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT signals_unit_fkey FOREIGN KEY ("unitId") REFERENCES units(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS signals_unitid_idx ON signals("unitId");
CREATE INDEX IF NOT EXISTS signals_unitid_createdat_idx ON signals("unitId", "createdAt");
CREATE INDEX IF NOT EXISTS signals_sessionid_idx ON signals("sessionId");
CREATE INDEX IF NOT EXISTS signals_type_idx ON signals(type);
CREATE INDEX IF NOT EXISTS signals_createdat_idx ON signals("createdAt");
CREATE INDEX IF NOT EXISTS signals_iphash_idx ON signals("ipHash");

-- Create trigger for updatedAt
CREATE OR REPLACE FUNCTION public.update_signals_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

DROP TRIGGER IF EXISTS update_signals_updated_at ON signals;
CREATE TRIGGER update_signals_updated_at 
    BEFORE UPDATE ON signals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_signals_updated_at_column();

-- Add RLS policies for signals
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read signals
CREATE POLICY "Allow authenticated users to read signals"
  ON signals FOR SELECT
  TO authenticated
  USING (true);

-- Allow all users to insert signals (for public tracking)
CREATE POLICY "Allow all users to insert signals"
  ON signals FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public read access for analytics (careful with PII)
CREATE POLICY "Allow public to read signal analytics"
  ON signals FOR SELECT
  TO anon
  USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON signals TO anon;
GRANT ALL ON signals TO authenticated;