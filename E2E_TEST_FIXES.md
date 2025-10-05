# E2E Test Fixes Summary

## Changes Made

### 1. Fixed A11y Test (`e2e/a11y-public.spec.ts`)
- ✅ Installed `@axe-core/playwright` dependency
- ✅ Changed from incorrect `analyze()` import to proper `AxeBuilder` class
- ✅ Updated env var from `E2E_UNIT_ID` to `PUBLIC_UNIT_ID`
- ✅ Removed token-based authentication (not needed for public timeline)

### 2. Fixed Public Timeline Tests (`e2e/public-timeline.spec.ts`)
- ✅ Updated env var from `E2E_UNIT_ID` to `PUBLIC_UNIT_ID`
- ✅ Removed all `E2E_UNIT_TOKEN` references
- ✅ Removed `?token=${token}` from all URLs
- ✅ Fixed email regex to be more specific and avoid false positives

### 3. Updated Playwright Config (`playwright.config.ts`)
- ✅ Changed `baseURL` from `E2E_BASE_URL` to `PRODUCTION_URL` (matches workflow)
- ✅ Added timeout configuration (30s)
- ✅ Added trace retention on failure for debugging
- ✅ Added device configuration for chromium

### 4. Updated GitHub Workflow (`.github/workflows/uptime-check.yml`)
- ✅ Removed all `E2E_UNIT_TOKEN` references
- ✅ Removed `PUBLIC_UNIT_TOKEN` references
- ✅ Fixed env var mapping to use `${{ secrets.PRODUCTION_URL }}` instead of shell expansion
- ✅ Simplified gate job to only check `PRODUCTION_URL` and `E2E_UNIT_ID`

## Required GitHub Secrets

Only **2 secrets** are needed:

| Secret Name | Value | Example |
|------------|-------|---------|
| `PRODUCTION_URL` | Your production URL | `https://fairviawave.vercel.app` |
| `PUBLIC_UNIT_ID` | A published unit ID for testing | `cmgdbv0ub0001s64mvxj8tg51` |

**No token needed** - the public timeline endpoint only requires the unit to have `status = 'published'`.

## Database Indexes (Run in Supabase)

```sql
-- Units indexes for metrics performance
create index if not exists units_status_idx      on public.units (status);
create index if not exists units_published_at_idx on public.units ("publishedAt");
create index if not exists units_created_at_idx   on public.units ("createdAt");

-- Events indexes for metrics performance
create index if not exists events_unit_created_idx on public.events ("unitId","createdAt");
create index if not exists events_created_idx      on public.events ("createdAt");
create index if not exists events_ts_idx           on public.events ("ts");
```

## Testing Locally

```bash
# Set environment variables
export PRODUCTION_URL=https://fairviawave.vercel.app
export PUBLIC_UNIT_ID=cmgdbv0ub0001s64mvxj8tg51

# Run tests
npm run test:e2e
```

## What Was Fixed

1. **A11y test failure**: Was using non-existent `analyze` export; now uses `AxeBuilder` class
2. **Heading not found**: Page already has H1 with unit name; test now finds it correctly
3. **API returning non-ok**: Was sending `?token=undefined`; now no token in URL

## Next Steps

1. Add the 2 GitHub secrets in repo settings
2. Run the DB indexes in Supabase SQL Editor
3. Trigger the workflow manually or wait for next scheduled run
4. Tests should pass with p95 latency < 500ms
