# AETERNA - sutvarkyti Runtime Error (raudonas langelis)
$ErrorActionPreference = "SilentlyContinue"
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) { $env:Path = "$nodeDir;$env:Path" }

$root = $PSScriptRoot

Write-Host ""
Write-Host "AETERNA - valymas ir paleidimas" -ForegroundColor Cyan
Write-Host ""

foreach ($port in 3000, 4000) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Seconds 2

. "$root\scripts\ensure-next-cache.ps1"
Clear-NextCache -WebRoot "$root\web"

Write-Host "Cache isvalytas. Paleidziama..." -ForegroundColor Green
& "$root\start-dev.ps1"
