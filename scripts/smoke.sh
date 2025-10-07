#!/usr/bin/env bash
set -euo pipefail
echo "== Fairvia Agent Smoke =="
BASE="${E2E_BASE_URL:-${NEXT_PUBLIC_BASE_URL:-http://localhost:${PORT:-3000}}}"

get_json () {
  local path="$1"
  echo "GET $BASE$path"
  curl -sSf "$BASE$path" | jq .
}

get_json "/api/health" >/dev/null
get_json "/api/compliance/timers?state=CA&moveOutISO=2025-10-01T00:00:00.000Z" >/dev/null
get_json "/api/badge/demo-unit" >/dev/null

echo "Smoke passed."