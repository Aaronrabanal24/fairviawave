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
