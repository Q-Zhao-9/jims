#Requires -Version 5.1
<#
  Start local *development* stack in two new PowerShell windows:
    - FastAPI with --reload on http://127.0.0.1:8000
    - Vite dev server on http://localhost:5173 (proxies /api -> 8000)

  Use this after stopping servers or when nothing is listening on 5173/8000.

  Prod preview (4173) and prod API (8001) are separate — use scripts/prod-stack.ps1 for those.
#>
$ErrorActionPreference = 'Stop'

$ScriptDir = $PSScriptRoot
$RepoRoot = Split-Path $ScriptDir -Parent
$backendDir = Join-Path $RepoRoot 'backend'

Write-Host 'Starting dev API (8000) and Vite (5173) in new windows...' -ForegroundColor Cyan
Write-Host 'Open: http://localhost:5173' -ForegroundColor Green

$apiCmd = 'python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000'
Start-Process powershell -WorkingDirectory $backendDir -ArgumentList '-NoExit', '-Command', $apiCmd

Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList '-NoExit', '-Command', 'npm run dev'
