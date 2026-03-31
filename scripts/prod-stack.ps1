#Requires -Version 5.1
<#
  Start the local prod stack in the background (no console windows):
    - Docker: db_prod (PostgreSQL on host port 5433)
    - FastAPI: 127.0.0.1:8001 + prod DATABASE_URL (does not use dev port 8000)
    - Vite preview: 127.0.0.1:4173 with proxy to the prod API

  Development (npm run dev on 5173, uvicorn on 8000) is unchanged.

  Requires dist/ - run: npm run build (or deploy.ps1 -PrepareOnly) once after changes.

  Usage (manual):
    .\scripts\prod-stack.ps1
    .\scripts\prod-stack.ps1 -StartupDelaySeconds 0
#>
param(
    [int]$StartupDelaySeconds = 30
)

$ErrorActionPreference = 'Stop'

# Resolve repo root (this file lives in scripts/)
$ScriptDir = $PSScriptRoot
$RepoRoot = Split-Path $ScriptDir -Parent

$ProdDatabaseUrl = 'postgresql://jims:jims_prod@localhost:5433/jims'
$ProdApiPort = 8001
$ProdPreviewPort = 4173

$LogDir = Join-Path $RepoRoot 'logs'
$LogFile = Join-Path $LogDir 'prod-stack.log'
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Write-ProdLog {
    param([string]$Message)
    $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $line = "[$ts] $Message"
    Add-Content -Path $LogFile -Value $line
    Write-Host $line
}

# Scheduled tasks and some shells have a minimal PATH - refresh from Machine + User
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

if ($StartupDelaySeconds -gt 0) {
    Write-ProdLog "Waiting ${StartupDelaySeconds}s for Docker Desktop / network..."
    Start-Sleep -Seconds $StartupDelaySeconds
}

Set-Location $RepoRoot

function Test-PortListen {
    param([int]$Port)
    try {
        $null = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

Write-ProdLog 'Starting JIMS prod stack...'

try {
    docker compose up -d db_prod
    if ($LASTEXITCODE -ne 0) { throw "docker compose exit $LASTEXITCODE" }
} catch {
    Write-ProdLog "ERROR: docker compose failed: $_"
    exit 1
}

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
    Write-ProdLog 'ERROR: Postgres (db_prod) did not become ready in time.'
    exit 1
}

$distIndex = Join-Path $RepoRoot 'dist\index.html'
if (-not (Test-Path $distIndex)) {
    Write-ProdLog 'ERROR: dist/index.html missing. Run: npm run build   (or deploy.ps1 -PrepareOnly)'
    exit 1
}

$backendDir = Join-Path $RepoRoot 'backend'
$uvicornLog = Join-Path $LogDir 'uvicorn-prod.log'

function Resolve-PythonLauncher {
    if ($env:JIMS_PYTHON -and (Test-Path -LiteralPath $env:JIMS_PYTHON)) {
        return @{ Exe = $env:JIMS_PYTHON; ArgsPrefix = @() }
    }
    $pyCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pyCmd -and $pyCmd.Source) {
        return @{ Exe = $pyCmd.Source; ArgsPrefix = @() }
    }
    $pyLauncher = Get-Command py -ErrorAction SilentlyContinue
    if ($pyLauncher -and $pyLauncher.Source) {
        return @{ Exe = $pyLauncher.Source; ArgsPrefix = @('-3') }
    }
    return $null
}

function Install-BackendDeps {
    param($Launcher, [string]$BackendDir)
    $reqPath = Join-Path $BackendDir 'requirements.txt'
    if (-not (Test-Path -LiteralPath $reqPath)) {
        throw "Missing $reqPath"
    }
    $pipArgs = @() + $Launcher.ArgsPrefix + @('-m', 'pip', 'install', '-q', '-r', $reqPath)
    & $Launcher.Exe @pipArgs
    if ($LASTEXITCODE -ne 0) {
        throw "pip install failed (exit $LASTEXITCODE). Try: cd backend; python -m pip install -r requirements.txt"
    }
}

if (Test-PortListen -Port $ProdApiPort) {
    Write-ProdLog "Prod API already listening on port $ProdApiPort - skipping uvicorn."
} else {
    $launcher = Resolve-PythonLauncher
    if (-not $launcher) {
        Write-ProdLog 'ERROR: Python not found (python / py). Add Python to PATH or set JIMS_PYTHON to python.exe.'
        exit 1
    }
    try {
        Write-ProdLog "Installing backend deps via pip for $($launcher.Exe) (same as deploy.ps1)..."
        Install-BackendDeps -Launcher $launcher -BackendDir $backendDir
    } catch {
        Write-ProdLog "ERROR: $_"
        exit 1
    }
    $env:DATABASE_URL = $ProdDatabaseUrl
    $uvArgs = $launcher.ArgsPrefix + @(
        '-m', 'uvicorn', 'app.main:app',
        '--host', '127.0.0.1', '--port', "$ProdApiPort"
    )
    try {
        # Redirect stderr only; same path for stdout+stderr can break Start-Process on Windows.
        $p = Start-Process -FilePath $launcher.Exe -ArgumentList $uvArgs `
            -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru `
            -RedirectStandardError $uvicornLog
        Write-ProdLog "Started uvicorn PID $($p.Id) on 127.0.0.1:$ProdApiPort (log: logs/uvicorn-prod.log)."
    } catch {
        Write-ProdLog "ERROR: failed to start uvicorn: $_"
        exit 1
    }
    Start-Sleep -Seconds 4
    if (-not (Test-PortListen -Port $ProdApiPort)) {
        $tail = ''
        if (Test-Path $uvicornLog) {
            $tail = (Get-Content -Path $uvicornLog -Tail 30 -ErrorAction SilentlyContinue) -join "`n"
        }
        Write-ProdLog "ERROR: API did not open port $ProdApiPort. Uvicorn log tail:`n$tail"
        exit 1
    }
}

if (Test-PortListen -Port $ProdPreviewPort) {
    Write-ProdLog "Vite preview already listening on port $ProdPreviewPort - skipping npm run preview."
} else {
    $proxy = "http://127.0.0.1:$ProdApiPort"
    $npmLine = "set VITE_PREVIEW_API_PROXY=$proxy&& npm run preview -- --host 127.0.0.1 --port $ProdPreviewPort"
    try {
        Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $npmLine -WorkingDirectory $RepoRoot -WindowStyle Hidden
        Write-ProdLog "Started vite preview on 127.0.0.1:$ProdPreviewPort (proxy -> prod API)."
    } catch {
        Write-ProdLog "ERROR: failed to start vite preview: $_"
        exit 1
    }
}

Write-ProdLog 'Prod stack start sequence finished.'
exit 0
