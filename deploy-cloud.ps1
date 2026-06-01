# AETERNA — deploy i debesi (Render + GitHub)
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host ""
Write-Host "AETERNA — debesies deploy" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Reikia GitHub CLI: https://cli.github.com" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "$Root\.git")) {
  git -C $Root init | Out-Null
  Write-Host "Git init OK"
}

git -C $Root add -A
$status = git -C $Root status --porcelain
if ($status) {
  git -C $Root commit -m "AETERNA: cloud deploy (Render + seeds)" | Out-Null
  Write-Host "Commit sukurtas."
}

$remote = git -C $Root remote get-url origin 2>$null
if (-not $remote) {
  Write-Host "Kuriamas GitHub repozitorija 'aeterna'..." -ForegroundColor Yellow
  gh repo create aeterna --public --source=$Root --remote=origin --push --description "AETERNA — skaitmeninis atminimas"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Jei repozitorija jau egzistuoja, paleiskite:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/JUSU-VARTOTOJAS/aeterna.git"
    Write-Host "  git push -u origin main"
  }
} else {
  git -C $Root branch -M main 2>$null
  git -C $Root push -u origin main 2>&1
  Write-Host "Push i GitHub OK"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  KITAS ZINGSNIS — Render.com (nemokama)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Atidarykite: https://dashboard.render.com/blueprints"
Write-Host "2. New Blueprint Instance -> pasirinkite GitHub repo 'aeterna'"
Write-Host "3. Patvirtinkite render.yaml (API + Web)"
Write-Host "4. Nustatykite AETERNA_ADMIN_PASSWORD (admin prisijungimui)"
Write-Host "5. Apply — palaukite ~10 min"
Write-Host ""
Write-Host "Po deploy:" -ForegroundColor Cyan
Write-Host "  Svetaine:  https://aeterna-web.onrender.com"
Write-Host "  Demo:      https://aeterna-web.onrender.com/m/ona-demo"
Write-Host "  API:       https://aeterna-api.onrender.com/health"
Write-Host ""
Write-Host "Android: cd android; .\build-apk.ps1" -ForegroundColor Yellow
Write-Host "Dokumentacija: docs\DEPLOY-CLOUD.md"
Write-Host ""
