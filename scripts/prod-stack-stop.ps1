#Requires -Version 5.1
<#
  Stop processes listening on prod ports (default 8001 API, 4173 vite preview).
  Does not stop Docker db_prod or dev servers on 8000/5173.

  After this, prod UI/API are down until you run: .\scripts\prod-stack.ps1
  To start *development* instead: .\scripts\start-dev.ps1

  Usage:
    .\scripts\prod-stack-stop.ps1
#>
param(
    [int]$ApiPort = 8001,
    [int]$PreviewPort = 4173
)

$ErrorActionPreference = 'Stop'

function Stop-ListenerOnPort {
    param([int]$Port)
    try {
        $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            $procId = $c.OwningProcess
            if ($procId -and $procId -ne 0) {
                Write-Host "Stopping PID $procId on port $Port"
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        Write-Host "Port ${Port}: $($_.Exception.Message)"
    }
}

Stop-ListenerOnPort -Port $ApiPort
Stop-ListenerOnPort -Port $PreviewPort
Write-Host 'Done.'
