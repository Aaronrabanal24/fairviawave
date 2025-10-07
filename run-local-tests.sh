#!/bin/bash
set -e

# Free port 3000 if stuck
fuser -k 3000/tcp || true

# Start Postgres
docker run --rm --name fairvia-pg -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=fairvia_test \
  -d postgres:16-alpine

# Env
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fairvia_test
export E2E_BASE_URL=http://localhost:3000

# Install + generate + migrate
corepack enable && corepack prepare pnpm@9.12.0 --activate
pnpm install
npx prisma generate
npx prisma validate
npx prisma migrate deploy

# Build + start (bg)
pnpm start &>/tmp/next.log &
npx wait-on http://localhost:3000/api/health

# Tests
echo "Node version: $(node -v)"
echo "pnpm version: $(pnpm -v)"
pnpm test:api
pnpm test:unit

# Cleanup
docker stop fairvia-pg