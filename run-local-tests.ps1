# Kill anything stuck on 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { taskkill /PID $_ /F }

# Start Postgres (Docker)
docker run --rm --name fairvia-pg -p 5432:5432 `
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=fairvia_test `
  -d postgres:16-alpine

# Env for this session
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fairvia_test"
$env:E2E_BASE_URL="http://localhost:3000"

# Install + generate + migrate
corepack enable; corepack prepare pnpm@9.12.0 --activate
pnpm install
npx prisma generate
npx prisma validate
npx prisma migrate deploy

# Build + start app in background
Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "start" -RedirectStandardOutput out.log -RedirectStandardError err.log
npx wait-on http://localhost:3000/api/health

# Run the test suites
Write-Host "Node version: $(node -v)"
Write-Host "pnpm version: $(pnpm -v)"
pnpm test:api
pnpm test:unit

# Cleanup
docker stop fairvia-pg