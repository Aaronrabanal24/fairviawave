-- Fairvia Wave 1 - Metrics & Analytics SQL
-- Run these in Supabase SQL Editor to create analytics views

-- =============================================================================
-- Daily Activity Rollup
-- Tracks units created and events appended per day
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_activity AS
SELECT
  date_trunc('day', "createdAt")::date as day,
  count(*) FILTER (WHERE t='unit') as units_created,
  count(*) FILTER (WHERE t='event') as events_appended
FROM (
  SELECT 'unit'::text as t, "createdAt" FROM units
  UNION ALL
  SELECT 'event'::text as t, "createdAt" FROM events
) s
GROUP BY 1
ORDER BY 1 DESC;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mv_daily_activity_day
  ON mv_daily_activity(day DESC);

-- =============================================================================
-- Events by Type Distribution
-- Shows event type distribution per day
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_events_by_type AS
SELECT
  date_trunc('day', "createdAt")::date as day,
  type,
  visibility,
  count(*) as cnt
FROM events
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC;

-- =============================================================================
-- Unit Performance Metrics
-- Tracks unit publishing rate and event activity
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_unit_metrics AS
SELECT
  u.id,
  u.name,
  u.status,
  u."publishedAt",
  u."createdAt",
  count(e.id) as total_events,
  count(e.id) FILTER (WHERE e.visibility = 'public') as public_events,
  count(e.id) FILTER (WHERE e.visibility = 'internal') as internal_events,
  count(DISTINCT e.type) as unique_event_types,
  max(e."createdAt") as last_event_at,
  CASE
    WHEN u.status = 'published' AND u."publishedAt" IS NOT NULL
    THEN EXTRACT(EPOCH FROM (max(e."createdAt") - u."publishedAt"))/3600
    ELSE NULL
  END as hours_to_first_event
FROM units u
LEFT JOIN events e ON e."unitId" = u.id
GROUP BY u.id, u.name, u.status, u."publishedAt", u."createdAt"
ORDER BY u."createdAt" DESC;

-- =============================================================================
-- Public Timeline Access Metrics
-- Track which units are being accessed publicly
-- Note: This requires adding a views tracking table (optional)
-- =============================================================================

-- Optional: Create views tracking table
CREATE TABLE IF NOT EXISTS timeline_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "unitId" TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  CONSTRAINT fk_unit FOREIGN KEY ("unitId") REFERENCES units(id)
);

CREATE INDEX IF NOT EXISTS idx_timeline_views_unit
  ON timeline_views("unitId", viewed_at DESC);

-- Views aggregation (if tracking is implemented)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_timeline_views AS
SELECT
  "unitId",
  count(*) as total_views,
  count(DISTINCT date_trunc('day', viewed_at)) as unique_days,
  max(viewed_at) as last_viewed
FROM timeline_views
GROUP BY "unitId"
ORDER BY total_views DESC;

-- =============================================================================
-- KPI Dashboard Query
-- All key metrics in one view
-- =============================================================================

CREATE OR REPLACE VIEW v_kpi_dashboard AS
SELECT
  -- Units metrics
  (SELECT count(*) FROM units) as total_units,
  (SELECT count(*) FROM units WHERE status = 'published') as published_units,
  (SELECT count(*) FROM units WHERE "createdAt" >= NOW() - INTERVAL '7 days') as units_last_7d,
  (SELECT count(*) FROM units WHERE "createdAt" >= NOW() - INTERVAL '1 day') as units_last_24h,

  -- Events metrics
  (SELECT count(*) FROM events) as total_events,
  (SELECT count(*) FROM events WHERE visibility = 'public') as public_events,
  (SELECT count(*) FROM events WHERE "createdAt" >= NOW() - INTERVAL '7 days') as events_last_7d,
  (SELECT count(*) FROM events WHERE "createdAt" >= NOW() - INTERVAL '1 day') as events_last_24h,

  -- Averages
  (SELECT avg(event_count)::numeric(10,2) FROM (
    SELECT count(*) as event_count FROM events GROUP BY "unitId"
  ) sub) as avg_events_per_unit,

  -- Most active unit
  (SELECT u.name FROM units u
   JOIN events e ON e."unitId" = u.id
   GROUP BY u.id, u.name
   ORDER BY count(e.id) DESC
   LIMIT 1) as most_active_unit;

-- =============================================================================
-- Refresh Materialized Views
-- Run this daily via cron job or manual
-- =============================================================================

-- Manual refresh (run daily)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_activity;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_events_by_type;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_unit_metrics;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_timeline_views; -- if tracking enabled

-- =============================================================================
-- Useful Queries
-- =============================================================================

-- Get today's activity
-- SELECT * FROM mv_daily_activity WHERE day = CURRENT_DATE;

-- Get event type distribution for last 7 days
-- SELECT day, type, sum(cnt) as total
-- FROM mv_events_by_type
-- WHERE day >= CURRENT_DATE - INTERVAL '7 days'
-- GROUP BY day, type
-- ORDER BY day DESC, total DESC;

-- Get top performing units by event count
-- SELECT * FROM mv_unit_metrics ORDER BY total_events DESC LIMIT 10;

-- Get units with no events (need attention)
-- SELECT * FROM mv_unit_metrics WHERE total_events = 0 AND status = 'published';

-- Get KPI summary
-- SELECT * FROM v_kpi_dashboard;

-- =============================================================================
-- Performance Optimization
-- =============================================================================

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_units_status_created
  ON units(status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_events_unit_created
  ON events("unitId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_events_visibility_type
  ON events(visibility, type, "createdAt" DESC);

-- =============================================================================
-- Cleanup Old Data (Optional)
-- Run periodically to manage database size
-- =============================================================================

-- Archive events older than 90 days (adjust as needed)
-- CREATE TABLE IF NOT EXISTS events_archive (LIKE events INCLUDING ALL);
--
-- INSERT INTO events_archive
-- SELECT * FROM events WHERE "createdAt" < NOW() - INTERVAL '90 days';
--
-- DELETE FROM events WHERE "createdAt" < NOW() - INTERVAL '90 days';

-- =============================================================================
-- Setup Complete!
-- =============================================================================

-- Next steps:
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Set up daily cron to refresh materialized views
-- 3. Query v_kpi_dashboard for quick metrics
-- 4. Build dashboard UI using these views
