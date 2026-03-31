#Requires -Version 5.1
param(
    [string]$TaskName = 'JIMS-ProdStack'
)

$ErrorActionPreference = 'Stop'

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($task) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed scheduled task '$TaskName'." -ForegroundColor Green
} else {
    Write-Host "Task '$TaskName' was not registered (nothing to remove)." -ForegroundColor Yellow
}
