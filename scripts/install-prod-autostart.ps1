#Requires -Version 5.1
<#
  Register a Scheduled Task so the prod stack starts at user logon (after a short delay
  so Docker Desktop can start). Uses scripts/prod-stack.ps1.

  Does not touch dev: dev stays on 8000 + 5173; prod uses 8001 + 4173.

  If the task cannot start the API (Python missing in the task environment), set user env JIMS_PYTHON to the full path of python.exe, or add Python to PATH.

  Run from an elevated PowerShell if registration fails (right-click -> Run as administrator).

  Usage:
    .\scripts\install-prod-autostart.ps1
    .\scripts\install-prod-autostart.ps1 -StartupDelaySeconds 45
    .\scripts\uninstall-prod-autostart.ps1   # remove
#>
param(
    [int]$StartupDelaySeconds = 35,
    [string]$TaskName = 'JIMS-ProdStack'
)

$ErrorActionPreference = 'Stop'

$ScriptDir = $PSScriptRoot
$RepoRoot = Split-Path $ScriptDir -Parent
$StackScript = Join-Path $ScriptDir 'prod-stack.ps1'

if (-not (Test-Path $StackScript)) {
    throw "Not found: $StackScript"
}

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# -File keeps $PSScriptRoot correct; prod-stack.ps1 Set-Location's to repo root for docker/npm.
$arg = "-NoProfile -ExecutionPolicy Bypass -File `"$StackScript`" -StartupDelaySeconds $StartupDelaySeconds"
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument $arg

$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings `
    -Description 'JIMS prod: Docker db_prod + API :8001 + Vite preview :4173 (isolated from dev)' | Out-Null

Write-Host "Registered scheduled task '$TaskName' (logon -> prod-stack.ps1)." -ForegroundColor Green
Write-Host "First build the frontend once: cd `"$RepoRoot`"; npm run build" -ForegroundColor Yellow
Write-Host "Test now: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Cyan
