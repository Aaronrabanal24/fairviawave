# Local test & server quickstart (any port)

## Choose a port
If 3000 is busy, set 3001 (or any free port):
- PowerShell:

```powershell
$env:PORT="3001"
$env:E2E_BASE_URL="http://localhost:$env:PORT"
```

- bash/zsh:

```bash
export PORT=3001
export E2E_BASE_URL="http://localhost:$PORT"
```

## Run the stack

```bash
corepack enable && corepack prepare pnpm@9.12.0 --activate
pnpm install
npx prisma generate
npx prisma migrate deploy
pnpm start &
npx wait-on "$E2E_BASE_URL/api/health"
```

## Test

```bash
pnpm test:api
pnpm test:unit
bash ./scripts/smoke.sh # or: pwsh ./scripts/smoke.ps1
```

Notes:
- Tests prefer E2E_BASE_URL, then NEXT_PUBLIC_BASE_URL, then http://localhost:${PORT:-3000}.
- CI pins PORT=3000; locally you can pick any port.

## Operational tips (no code change)

For this session on 3001, set:

PowerShell:
setx E2E_BASE_URL "http://localhost:3001" (new shells) or $env:E2E_BASE_URL="http://localhost:3001" (current shell)

bash/zsh:
export E2E_BASE_URL=http://localhost:3001

Keep .nvmrc at 20 and run nvm use to match CI exactly.

## Next high-leverage moves (Wave 2 Spine)

### Compliance Timer Sentinel e2e

Add /api/compliance/timers integration test with known inputs → exact deadlines and statuses.

Add a regression test that badge state equals timers for the same unit.

### Trust Badge Verifier

Add /api/badge/[unitId] contract test asserting badge ∈ {green,warning,red} and equality with timers.

### Signals rate limiting (write routes)

Lightweight Redis guard with 429 on burst writes; header Retry-After + test.