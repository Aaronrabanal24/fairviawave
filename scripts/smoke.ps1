Write-Host "== Fairvia Agent Smoke =="
$base = $env:E2E_BASE_URL
if ([string]::IsNullOrEmpty($base)) {
  $base = $env:NEXT_PUBLIC_BASE_URL
}
if ([string]::IsNullOrEmpty($base)) {
  $port = if ($env:PORT) { $env:PORT } else { 3000 }
  $base = "http://localhost:$port"
}

function Get-Json($path) {
  $u = "$base$path"
  Write-Host "GET $u"
  try {
    $res = Invoke-WebRequest -UseBasicParsing -Uri $u
    $json = $res.Content | ConvertFrom-Json
    return $json
  } catch {
    Write-Error "Request failed: $path"
    exit 1
  }
}

$health = Get-Json "/api/health"
if (-not $health.ok) { Write-Error "/api/health not ok"; exit 1 }

$timers = Get-Json "/api/compliance/timers?state=CA&moveOutISO=2025-10-01T00:00:00.000Z"
if (-not $timers.windows.deadlineISO) { Write-Error "/api/compliance/timers missing deadline"; exit 1 }

$badge = Get-Json "/api/badge/demo-unit"
if (-not $badge.badge) { Write-Error "/api/badge missing badge"; exit 1 }

Write-Host "Smoke passed."