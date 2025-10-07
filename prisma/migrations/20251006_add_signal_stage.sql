-- Allow null values initially
ALTER TABLE "signals" ADD COLUMN IF NOT EXISTS "stage" TEXT;

-- Update existing records
UPDATE "signals" SET "stage" = "type";

-- Add index for stage field
CREATE INDEX IF NOT EXISTS "signals_stage_idx" ON "signals"("stage");

-- Add compound index for unitId + stage + createdAt
CREATE INDEX IF NOT EXISTS "signals_unitId_stage_createdAt_idx" ON "signals"("unitId", "stage", "createdAt");