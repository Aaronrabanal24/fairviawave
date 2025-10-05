# Fairvia Wave 1 Starter

Next.js 14 + Tailwind + Prisma + Postgres starter for the Focus MVP.
Includes API routes for units, publish, events, and public/internal timelines,
a small hashing utility, and a simple dashboard stub.

## Quick start
1) Create a new Supabase project (or Postgres DB).
2) Copy your Postgres connection string to `DATABASE_URL` in `.env`.
3) `npm i`
4) `npx prisma migrate dev --name init`
5) `npx prisma db seed` (optional sample data)
6) `npm run dev`

## Env
Copy `.env.example` to `.env` and fill values.
- DATABASE_URL=postgresql://... (from Supabase, use the `pooler` URL for Next.js)
- PUBLIC_BASE_URL=http://localhost:3000
- INTERNAL_API_KEY=dev-internal-key

## Routes
- POST /api/units
- POST /api/units/:id/publish
- POST /api/units/:id/events
- GET  /api/units/:id/timeline/public
- GET  /api/units/:id/timeline/internal (requires INTERNAL_API_KEY header)

## Notes
- This starter uses a simple header key for internal reads to keep setup light.
- Swap to Supabase Auth when ready (see comments in code where to plug it).
