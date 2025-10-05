-- Database Performance Indexes
-- Run this in Supabase SQL Editor for optimal query performance

-- =============================================================================
-- Core Performance Indexes
-- =============================================================================

-- Units table: Created timestamp (for recent units queries)
CREATE INDEX IF NOT EXISTS units_created_idx
  ON public.units ("createdAt");

-- Units table: Status and published timestamp for published subset
CREATE INDEX IF NOT EXISTS units_status_idx
  ON public.units (status);

CREATE INDEX IF NOT EXISTS units_published_at_idx
  ON public.units ("publishedAt");

-- Events table: Unit + Created timestamp (for timeline queries)
CREATE INDEX IF NOT EXISTS events_unit_created_idx
  ON public.events ("unitId", "createdAt");

-- Events table: Created timestamp (for global counts)
CREATE INDEX IF NOT EXISTS events_created_idx
  ON public.events ("createdAt");

-- Events table: Event timestamp (for ts-based queries)
CREATE INDEX IF NOT EXISTS events_ts_idx
  ON public.events ("ts");

-- =============================================================================
-- Metrics Query Optimization
-- =============================================================================

-- Metrics summary query benefits directly from the above indexes

-- =============================================================================
-- Verify Indexes Created
-- =============================================================================

-- Run this to see all indexes on your tables:
-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- AND tablename IN ('units', 'events')
-- ORDER BY tablename, indexname;

-- =============================================================================
-- Performance Testing
-- =============================================================================

-- Test query performance with EXPLAIN ANALYZE:

-- Test timeline query
-- EXPLAIN ANALYZE
-- SELECT * FROM events
-- WHERE "unitId" = 'your-unit-id'
-- ORDER BY "createdAt" DESC
-- LIMIT 100;

-- Test metrics query
-- EXPLAIN ANALYZE
-- SELECT count(*) FROM units WHERE status = 'published';

-- Test recent activity
-- EXPLAIN ANALYZE
-- SELECT * FROM units
-- WHERE "createdAt" >= NOW() - INTERVAL '7 days'
-- ORDER BY "createdAt" DESC;
