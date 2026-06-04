# AETERNA - paleisti API + Web
$ErrorActionPreference = "Continue"
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) { $env:Path = "$nodeDir;$env:Path" }

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js nerastas: https://nodejs.org" -ForegroundColor Red
    pause
    exit 1
}

$ip = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.*' } |
    Select-Object -First 1).IPAddress

$root = $PSScriptRoot

$envLocal = Join-Path $root "web\.env.local"
@"
API_INTERNAL_URL=http://127.0.0.1:4000
"@ | Set-Content -Path $envLocal -Encoding UTF8

foreach ($port in 3000, 4000) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Seconds 1

$nextDir = Join-Path $root "web\.next"
$manifest = Join-Path $nextDir "prerender-manifest.json"
if ((Test-Path $nextDir) -and -not (Test-Path $manifest)) {
  Write-Host "Valomas sugadintas web\.next ..." -ForegroundColor Yellow
  Remove-Item -LiteralPath $nextDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "AETERNA dev serveriai" -ForegroundColor Cyan
Write-Host "  http://localhost:3000"
Write-Host "  Telefonas: http://${ip}:3000"
Write-Host "  Runtime klaida? -> SUTVARKYTI-500.bat"
Write-Host ""

if (-not (Test-Path "$root\api\node_modules")) {
    Push-Location "$root\api"; npm install; Pop-Location
}
if (-not (Test-Path "$root\web\node_modules")) {
    Push-Location "$root\web"; npm install; Pop-Location
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = '$nodeDir;' + `$env:Path; cd '$root\api'; Write-Host 'API 4000' -ForegroundColor Green; npm run dev"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = '$nodeDir;' + `$env:Path; cd '$root\web'; Write-Host 'Web 3000' -ForegroundColor Green; npm run dev:lan"

Write-Host "Paleista." -ForegroundColor Green
