-- Database Performance Indexes
-- Run this in Supabase SQL Editor for optimal query performance

-- =============================================================================
-- Core Performance Indexes
-- =============================================================================

-- Events table: Unit + Created timestamp (for timeline queries)
CREATE INDEX IF NOT EXISTS events_unit_created_idx
  ON events ("unitId", "createdAt" DESC);

-- Units table: Created timestamp (for recent units queries)
CREATE INDEX IF NOT EXISTS units_created_idx
  ON units ("createdAt" DESC);

-- Events table: Visibility + Type + Created (for filtered queries)
CREATE INDEX IF NOT EXISTS events_visibility_type_created_idx
  ON events (visibility, type, "createdAt" DESC);

-- Units table: Status + Published timestamp (for published units)
CREATE INDEX IF NOT EXISTS units_status_published_idx
  ON units (status, "publishedAt" DESC);

-- =============================================================================
-- Metrics Query Optimization
-- =============================================================================

-- For metrics summary queries
CREATE INDEX IF NOT EXISTS units_status_idx
  ON units (status)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS events_created_idx
  ON events ("createdAt" DESC);

-- For event counting per unit
CREATE INDEX IF NOT EXISTS events_unit_id_idx
  ON events ("unitId");

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
