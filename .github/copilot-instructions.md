# Copilot Instructions for Fairvia Wave

## Project Overview
- **Type:** Next.js 14 (App Router) app for unit/event management
- **Core Features:** Auth (Supabase), public/private event timelines, QR publishing, RLS security
- **Data:** PostgreSQL via Supabase, Prisma ORM

## Architecture & Key Components
- `app/` — Next.js app directory
  - `api/units/` — CRUD endpoints for units/events
  - `dashboard/` — Protected dashboard UI
  - `login/` — Auth UI
  - `u/[unitId]/` — Public unit pages
- `lib/` — Utilities (Supabase client, logging, rate limiting)
- `prisma/` — DB schema (`schema.prisma`), seeds
- `middleware.ts` — Auth/session middleware

## Developer Workflows
- **Install:** `npm install`
- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Seed DB:** `npm run seed`
- **Test DB connection:** `node test-db.js`
- **Production:** `npm start`

## Testing & Verification
- Health: `curl -s "$PROD_URL/api/health" | jq .`
- Metrics: `curl -s "$PROD_URL/api/metrics/summary" | jq .`
- Public page: `start "$PROD_URL/u/<UNIT_ID>?token=<TOKEN>"` (Windows)
- Chain verify: `curl -s "$PROD_URL/api/units/<UNIT_ID>/verify" | jq .`

## Patterns & Conventions
- **Auth:** Use Supabase magic link; protect routes via `middleware.ts`
- **API:** Internal endpoints require `INTERNAL_API_KEY` (see `.env.example`)
- **Security:** All tables use Row Level Security (RLS); public endpoints filter PII
- **Events:** Timeline events have `visibility` (public/internal); public timeline is PII-safe
- **Publishing:** Publishing a unit generates a QR code
- **Environment:** Never commit `.env`; rotate API keys; use Supabase Vault for secrets

## Integration Points
- **Supabase:** Used for auth, DB, and storage
- **Prisma:** Used for DB migrations/seeding
- **Vercel:** Deployment target; update `PUBLIC_BASE_URL` after deploy

## References
- See `README.md`, `SETUP_COMPLETE.md`, `DEPLOYMENT_READY.md`, `VERCEL_DEPLOYMENT.md` for details
- Example API: `GET /api/units`, `POST /api/units/[id]/publish`, `GET /api/units/[id]/timeline/public`

---
**Update this file if major workflows, conventions, or architecture change.**
# COPILOT.md — Fairvia Workspace Instructions (Optimized for GitHub Copilot)

**Purpose:** Give Copilot the smallest set of rules and examples it needs to ship Wave 2 work fast without breaking CI, types, or compliance.

---

## $1

## Master timeline overview

Release train: weekly cuts on Fridays PT. Semantic versioning pre 1.0 uses v0.minor.patch. Each wave has gates and a definition of done.

### Wave 1 Skeleton  shipped at v0.1.0

What shipped

* Smart Unit Link
* Append only Events
* Public Timeline UI
* Metrics API baseline
* RLS hardening
* CI gates for uptime latency accessibility performance

Gates and metrics

* Timeline page loads under 2 seconds p50
* No critical Axe issues
* API p50 TTFB under 200 ms on core routes
* Error rate under 1 percent per day

### Wave 2 Spine  current

Objectives

* Owner Dashboard first pass FunnelCard and Daily Score sparkline
* Conversion Signals instrumentation end to end
* Redis rate limiting on write routes
* Pilot onboarding checklist and health checks

Exit gates

* Signals visible in dashboard for seeded unit
* Rate limits enforced with 429 and retryAfter
* Pilot checklist green in a fresh environment

### Wave 3 Muscles  next

Objectives

* Compliance Engine v1 timers receipts dispute tools
* Deposit escrow primitives plus Offboard 21 workflows
* Roles and permissions tenant aware
* Notifications webhooks and basic integrations
* Reporting pane insights from signals

Exit gates

* AB 2801 21 day timers verified in E2E with clocks
* Itemized deduction letter PDF with photo receipts exportable
* Webhooks deliver with retry and signature
* Access control passes unit tests for all roles

### Wave 4 Skin and Syndication  scale

Objectives

* Trust Badge SDK install guide and copy snippets
* Listing Tracking Specification integrations
* Public API docs and keys per tenant
* Pricing and plan limits metered
* Analytics and partner syndication

Exit gates

* Badge install under 5 minutes median
* Attribution across at least two listing sources verified
* API usage metering with limits and 429s
* Docs site passes lighthouse 90 plus across the board

KPIs across waves

* Verified units per city
* On time compliance rate
* PM retention
* MRR growth
* LTV CAC

---

---

## 1) Repo mental map for Copilot

* **API:** `app/api/**/route.ts`
* **Server utils:** `lib/**` (e.g., `lib/prisma.ts`, `lib/log.ts`, `lib/rateLimit.ts`)
* **UI:** `src/components/**` and `app/**`
* **Tests:** `tests/**` (Vitest unit); `e2e/**` (Playwright Axe)
* **Scripts:** `scripts/**` (delegate checks etc.)

**Context to read first:** `lib/prisma.ts`, `lib/log.ts`, `prisma/schema.prisma`, `app/(owner)/dashboard/*` if present.

---

## 2) Golden rules

* Use strict TypeScript. Never use `(prisma as any)`.
* Do not modify `.prisma/client` output. Run `prisma generate` after schema changes.
* API routes must use `NextResponse.json` with typed payloads and correct status codes.
* Only GET is production safe by default; writes get a dev guard and rate limiting.
* Respect RLS. No service role on user‑facing paths.
* Use `lib/log.ts`. Log shapes, not bodies. No PII.
* Accessibility: Axe must report zero critical issues for changed pages.

---

## 3) Commands Copilot can run

```bash
npm ci
npm run clean:prisma         # rimraf caches + prisma generate
npm run dev
npx tsc --noEmit             # type check
npm run check:delegates      # expect ["unit","event","signal"]
```

---

## 4) Data model delegates (must exist)

* `unit`: `id`, `slug`, `status`, `publishedAt`, `createdAt`
* `event`: `id`, `unitId`, `type` or `name`, `payload` JSON, `visibility`, `createdAt`, optional `ts`
* `signal`: `id`, `type`, `meta` JSON, `createdAt`

**Indexes:** Unit on `status`, `publishedAt`, `createdAt`; Event on `createdAt`, `ts`, `unitId + visibility`.

---

## 5) Snippets Copilot should reuse

### 5.1 API route pattern (dev‑safe writes)

```ts
// app/api/signals/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const isProd = process.env.NODE_ENV === 'production';

export async function GET() {
  const latest = await prisma.signal.findFirst({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ ok: true, latest });
}

export async function POST(req: Request) {
  if (isProd) return NextResponse.json({ error: 'Disabled in production' }, { status: 403 });
  const body = await req.json();
  const created = await prisma.signal.create({
    data: { type: String(body?.type ?? 'debug'), meta: body?.meta ?? {} }
  });
  return NextResponse.json({ ok: true, created }, { status: 201 });
}
```

### 5.2 Delegate health check (dev only)

```ts
// app/api/dev/prisma-models/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not available' }, { status: 404 });
  const delegates = Object.keys(prisma).filter(k => prisma[k]?.findFirst instanceof Function);
  return NextResponse.json({ delegates });
}
```

### 5.3 FunnelCard contract (Owner Dashboard)

```ts
// src/components/FunnelCard.tsx
export type FunnelCounts = {
  view_trust: number; precheck_start: number; precheck_submit: number;
  tour_request: number; application_open: number; application_submit: number;
  lease_open: number; lease_signed: number;
};
export type ActivityLevel = 'low'|'medium'|'high';
export function FunnelCard({ counts, level, lastUpdatedISO }: { counts: FunnelCounts; level: ActivityLevel; lastUpdatedISO: string }) {
  // render with Tailwind and shadcn Card
  return null;
}
```

---

## 6) Wave 2 signals to instrument

`view_trust`, `precheck_start`, `precheck_submit`, `tour_request`, `application_open`, `application_submit`, `lease_open`, `lease_signed`.

Emit as append‑only `event` rows. Also upsert summary `signal` rows to power the dashboard counts.

---

## 7) Acceptance criteria per change

* Type check passes
* `check:delegates` shows unit, event, signal
* Axe has zero critical issues on affected pages
* CI preview is green
* No casts or generated client edits
* Logs are clean and redacted

---

## 8) Tests Copilot should add

**Unit (Vitest):**

```ts
import { expect, test } from 'vitest';
import { prisma } from '@/lib/prisma';
test('prisma.signal delegate exists', () => {
  expect(typeof prisma.signal.findFirst).toBe('function');
});
```

**E2E (Playwright + Axe):** ensure Owner Dashboard and Public Timeline have zero critical issues and render in under two seconds on broadband.

---

## 9) Rate limiting guidance

* Add Redis on write routes only. Key = `ip:unitId`. Limit = 30 per hour per key. Exceed → `429` with `{ retryAfter }`.
* Keep reads open.

---

## 10) Compliance and privacy

* Respect RLS on every query. No user PII in logs. No room scans or sensitive media.
* Hash IPs for rate limits if stored, with short retention.

---

## 11) Troubleshooting fast path

1. Stop dev server
2. `npm run clean:prisma`
3. Restart editor TypeScript server
4. `npm run check:delegates` → expect `["unit","event","signal"]`
5. Hit `/api/dev/prisma-models` in dev

---

## 12) Prompt recipes for Copilot

**Feature ticket prompt**

```
You are working in Fairvia. Stack: Next.js 14 App Router, Tailwind, shadcn, Prisma on Supabase with RLS. No casts. Do not edit generated Prisma. Use NextResponse. Use lib/log.ts and do not log PII.
Task: Build app/api/signals/route.ts with GET and dev‑only POST, typed payloads, and error handling. Add vitest spec asserting prisma.signal exists. Add Playwright Axe check for Owner Dashboard id="owner-funnel". Return full files with paths.
Acceptance: type check passes, check:delegates ok, Axe zero critical, CI preview green.
```

**Component prompt**

```
Implement src/components/FunnelCard.tsx per contract. Render eight counts, low/medium/high badge, loading and empty states. Use Tailwind + shadcn Card. Add basic unit tests.
```

**Rate limit prompt**

```
Add Redis rate limiting to POST /api/signals. Key ip+unitId, 30 per hour. On exceed return 429 with retryAfter. Provide pure key function and a unit test.
```

---

## 13) Do not do

* No `(prisma as any)`
* No edits to `.prisma/client`
* No skipping `postinstall` in CI
* No logging request bodies or PII
* No new globals without review

---

## 14) Helpful scripts

```json
{
  "scripts": {
    "clean:prisma": "rimraf .prisma node_modules/.prisma .next && prisma generate",
    "check:delegates": "node scripts/check-delegates.mjs",
    "postinstall": "prisma generate"
  }
}
```

**scripts/check-delegates.mjs**

```js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const keys = Object.keys(prisma).filter(k => prisma[k]?.findFirst instanceof Function);
console.log('Delegates:', JSON.stringify(keys));
await prisma.$disconnect();
```

---

**Use this file as context when invoking Copilot Chat. Ask for full file outputs and tests. Keep responses tight and typed.**

---

## Wave specific prompt recipes (copy and paste into Copilot Chat)

### Wave 1 — Skeleton (backports and hardening)

**Implementation prompt**

```
You are working in Fairvia Wave 1 hardening. Stack: Next.js 14 App Router, Tailwind, shadcn, Prisma on Supabase with RLS. No casts. Do not edit generated Prisma. Use NextResponse. Use lib/log.ts and do not log PII.
Task: Reduce p50 TTFB on / and /timeline below 200 ms, eliminate any critical Axe issues on public pages, and ensure error rate under 1 percent per day by tightening error handling. Produce patches with file paths, and a Playwright Axe spec for /timeline. Keep diffs minimal.
Acceptance: page load p50 under 2 seconds, TTFB p50 under 200 ms on core routes, zero critical Axe issues, type check passes.
```

**Test prompt**

```
Add Playwright Axe tests for / and /timeline that fail on critical issues. Add a Vitest spec for lib/log.ts to ensure safe shapes and no PII.
```

### Wave 2 — Spine (current)

**Implementation prompt**

```
You are working in Fairvia Wave 2 Spine. Stack: Next.js 14 App Router, Tailwind, shadcn, Prisma on Supabase with RLS. No casts. Do not edit generated Prisma. Use NextResponse.
Task: Instrument signals end to end and ship Owner Dashboard first pass.
Deliverables:
1) app/api/signals/route.ts with GET and dev only POST. Typed payloads, error handling, and no PII logging.
2) src/components/FunnelCard.tsx and DailyScoreSparkline.tsx per contracts with loading and empty states.
3) lib/rateLimit.ts for write routes. Key ip+unitId. 30 per hour. Return 429 with retryAfter on exceed.
4) app/api/dev/prisma-models/route.ts health check in dev.
Acceptance: signals appear in dashboard for a seeded unit, rate limits enforced with 429 and retryAfter, pilot checklist green in a fresh environment, type check passes, Axe zero critical on dashboard.
```

**Test prompt**

```
Add Vitest spec that asserts typeof prisma.signal.findFirst === 'function'. Add a pure test for the rate limiter window and key builder. Add a Playwright spec that loads the Owner Dashboard and checks for id="owner-funnel" and zero critical Axe issues.
```

### Wave 3 — Muscles (compliance and workflows)

**Implementation prompt**

```
You are working in Fairvia Wave 3 Muscles. Stack: Next.js 14 App Router, Tailwind, shadcn, Prisma on Supabase with RLS. No casts. Do not edit generated Prisma. Use NextResponse.
Task: Build Compliance Engine v1 and deposit workflows.
Deliverables:
1) Timers for AB 2801 21 day window with clock safe tests.
2) Itemized deduction PDF generator with photo receipts and export endpoint.
3) Roles and permissions checks across owner, PM, viewer. Add unit tests.
4) Webhooks with signature, retry and dead letter fallback. Minimal docs page with examples.
Acceptance: AB 2801 timers verified in E2E with mocked clocks, PDF exports pass snapshot tests, role matrix unit tests all green, webhooks deliver with signed headers and retry.
```

**Test prompt**

```
Add Vitest suite for access control across roles. Add E2E that runs a full move out flow and asserts the 21 day timer gate and exported letter contents.
```

### Wave 4 — Skin and Syndication (SDK, API, pricing)

**Implementation prompt**

```
You are working in Fairvia Wave 4 Skin and Syndication. Stack: Next.js 14 App Router, Tailwind, shadcn, Prisma on Supabase with RLS. No casts. Do not edit generated Prisma. Use NextResponse.
Task: Ship Trust Badge SDK, listing attribution, public API and plan limits.
Deliverables:
1) Trust Badge SDK with install guide and copy snippets. Pasteable code blocks and a verification endpoint.
2) Listing Tracking integrations per spec with at least two sources and attribution recorded.
3) Public API docs and tenant keys with quotas per plan. 429 on exceed.
4) Pricing limits enforced at middleware or service layer.
Acceptance: badge install median under five minutes in test, attribution verified from two sources, API metering with limits and 429s, docs site Lighthouse 90 plus on all scored categories.
```

**Test prompt**

```
Add integration tests for API quotas and 429 responses. Add a small synthetic test that simulates installing the badge and verifies callback firing.
```

---

## PR description templates mapped to wave gates

### Generic PR template

```
## Summary
Short description

## Wave
- [ ] Wave 1 Skeleton
- [ ] Wave 2 Spine
- [ ] Wave 3 Muscles
- [ ] Wave 4 Skin and Syndication

## Area
component or API area

## Acceptance mapped to gates
- [ ] Type check passes (npx tsc --noEmit)
- [ ] Playwright Axe shows zero critical issues on affected pages
- [ ] Delegates ok (npm run check:delegates shows ["unit","event","signal"]) if data model touched
- [ ] CI preview green
- [ ] No casts or generated client edits
- [ ] Logs scrubbed and no PII

## Wave specific gates
- **Wave 1**
  - [ ] p50 TTFB on core routes < 200 ms
  - [ ] Public Timeline p50 load < 2 s
- **Wave 2**
  - [ ] Signals visible for seeded unit on dashboard
  - [ ] Rate limits return 429 with retryAfter
  - [ ] Pilot checklist green in a fresh environment
- **Wave 3**
  - [ ] AB 2801 timers verified with mocked clocks
  - [ ] Itemized deduction PDF export matches snapshot
  - [ ] Roles and permissions unit tests green
  - [ ] Webhooks deliver with signature and retry
- **Wave 4**
  - [ ] Trust Badge install median < 5 min
  - [ ] Attribution verified from 2 sources
  - [ ] API metering enforces plan limits with 429s
  - [ ] Docs site Lighthouse scores 90 plus

## Tests
List of unit and E2E added or updated

## Screenshots or recordings
optional
```

### Labels to apply

* `wave:1-skeleton`, `wave:2-spine`, `wave:3-muscles`, `wave:4-skin`
* `area:api`, `area:signals`, `area:dashboard`, `area:compliance`, `area:sdk`, `area:docs`
* `type:feature`, `type:fix`, `type:chore`

---

## CI hooks to enforce the checklist

* Add a job that hits `/api/dev/prisma-models` in preview when not production and fails if `signal` is missing.
* Run `npm run check:delegates` and `npx tsc --noEmit` in CI.
* Run Playwright Axe on affected pages. Fail on any critical issues.
* Optional: Lighthouse CI on docs site in Wave 4 tasks.
