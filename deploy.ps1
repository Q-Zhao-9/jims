#Requires -Version 5.1
<#
  One-step local production deployment:
    1. Start PostgreSQL (docker compose service db_prod on port 5433)
    2. Wait until Postgres accepts connections
    3. Install backend Python dependencies
    4. npm ci + npm run build (frontend)
    5. Unless -PrepareOnly: open two windows — API (uvicorn) + static preview (vite)

  Usage:
    .\deploy.ps1
    .\deploy.cmd
    .\deploy.ps1 -PrepareOnly

  For logon autostart of prod (ports 8001 + 4173, separate from dev): .\scripts\install-prod-autostart.ps1

  Requires: Docker Desktop (or docker compose), Python on PATH, Node/npm.
  Backend uses DATABASE_URL below for the API process; ensure backend/.env has SECRET_KEY and CORS_ORIGINS for prod preview (port 4173).
#>
param(
    [switch]$PrepareOnly
)

$ErrorActionPreference = 'Stop'

$Root = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
Set-Location $Root

$ProdDatabaseUrl = 'postgresql://jims:jims_prod@localhost:5433/jims'

function Write-Step {
    param([string]$Message)
    Write-Host "==> $Message" -ForegroundColor Cyan
}

Write-Step 'Starting PostgreSQL (db_prod)...'
docker compose up -d db_prod
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Step 'Waiting for Postgres...'
$deadline = (Get-Date).AddMinutes(2)
$ready = $false
while ((Get-Date) -lt $deadline) {
    docker compose exec -T db_prod pg_isready -U jims -d jims 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
        break
    }
    Start-Sleep -Seconds 2
}
if (-not $ready) {
    throw 'Postgres (db_prod) did not become ready in time. Is Docker running?'
}

Write-Step 'Python dependencies (backend)...'
Push-Location (Join-Path $Root 'backend')
try {
    python -m pip install -q -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw "pip install failed with exit code $LASTEXITCODE" }
}
finally {
    Pop-Location
}

Write-Step 'Frontend install + production build...'
npm ci
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host 'Deployment artifacts ready.' -ForegroundColor Green
Write-Host "  Prod DATABASE_URL: $ProdDatabaseUrl"
Write-Host ''

if ($PrepareOnly) {
    Write-Host 'PrepareOnly: start the API and preview yourself, or run deploy without -PrepareOnly.' -ForegroundColor Yellow
    exit 0
}

function Test-PortListen {
    param([int]$Port)
    try {
        $null = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

$backendPort = 8000
if (Test-PortListen -Port 8000) {
    $backendPort = 8001
    if (Test-PortListen -Port 8001) {
        throw 'Ports 8000 and 8001 are in use. Stop the other API or free a port, then run deploy again.'
    }
    Write-Host 'Port 8000 is in use — prod API will use 8001; vite preview proxies via VITE_PREVIEW_API_PROXY.' -ForegroundColor Yellow
}

Write-Host "  Prod API:           http://127.0.0.1:$backendPort"
Write-Host '  Frontend preview:  http://127.0.0.1:4173 (proxies /api to the API)'
Write-Host ''

Write-Step 'Starting API and frontend preview in new windows...'
$backendDir = Join-Path $Root 'backend'
# Inner PowerShell must set DATABASE_URL so it overrides backend/.env when pointing at dev DB.
$backendCmd = "`$env:DATABASE_URL='$ProdDatabaseUrl'; python -m uvicorn app.main:app --host 127.0.0.1 --port $backendPort"
# Always point preview proxy at the same port as the API (8000 or 8001).
$previewCmd = "`$env:VITE_PREVIEW_API_PROXY='http://127.0.0.1:$backendPort'; npm run preview"
Start-Process powershell -WorkingDirectory $backendDir -ArgumentList '-NoExit', '-Command', $backendCmd

$previewSkipped = Test-PortListen -Port 4173
if ($previewSkipped) {
    Write-Host 'Port 4173 already in use — skipped starting vite preview.' -ForegroundColor Yellow
} else {
    Start-Process powershell -WorkingDirectory $Root -ArgumentList '-NoExit', '-Command', $previewCmd
}

Write-Host 'Opened a PowerShell window for the prod API.' -ForegroundColor Green
if (-not $previewSkipped) {
    Write-Host 'Opened a PowerShell window for Vite preview at http://127.0.0.1:4173' -ForegroundColor Green
}
