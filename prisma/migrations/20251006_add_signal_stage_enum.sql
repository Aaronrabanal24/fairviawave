-- CreateEnum
BEGIN;
CREATE TYPE "SignalStage" AS ENUM (
  'view_trust','precheck_start','precheck_submit','tour_request',
  'application_open','application_submit','lease_open','lease_signed'
);

-- AlterTable
ALTER TABLE "signals"
  ADD COLUMN IF NOT EXISTS "stage" "SignalStage",
  ALTER COLUMN "type" SET NOT NULL,
  ALTER COLUMN "sessionId" SET NOT NULL,
  ALTER COLUMN "ipHash" SET NOT NULL;

-- Set initial stage values from type
UPDATE "signals"
SET "stage" = "type"::"SignalStage"
WHERE "stage" IS NULL AND "type" IN (
  'view_trust','precheck_start','precheck_submit','tour_request',
  'application_open','application_submit','lease_open','lease_signed'
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "signal_unit_created_idx" ON "signals" ("unitId","createdAt");
CREATE INDEX IF NOT EXISTS "signal_unit_stage_created_idx" ON "signals" ("unitId","stage","createdAt");
COMMIT;