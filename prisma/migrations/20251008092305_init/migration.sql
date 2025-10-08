-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "metadata" JSONB,
    "visibility" TEXT NOT NULL DEFAULT 'internal',
    "actor" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentHash" TEXT NOT NULL,
    "chainHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "units_status_idx" ON "units"("status");

-- CreateIndex
CREATE INDEX "units_publishedAt_idx" ON "units"("publishedAt");

-- CreateIndex
CREATE INDEX "units_createdAt_idx" ON "units"("createdAt");

-- CreateIndex
CREATE INDEX "events_unitId_idx" ON "events"("unitId");

-- CreateIndex
CREATE INDEX "events_unitId_ts_idx" ON "events"("unitId", "ts");

-- CreateIndex
CREATE INDEX "events_visibility_idx" ON "events"("visibility");

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt");

-- CreateIndex
CREATE INDEX "events_ts_idx" ON "events"("ts");

-- CreateIndex
CREATE INDEX "events_unitId_visibility_idx" ON "events"("unitId", "visibility");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
