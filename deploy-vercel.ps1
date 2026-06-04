# BŪTINA: įkelti pakeitimus į Vercel — telefonas krauna TIK iš debesies, ne iš PC disko
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host ""
Write-Host "=== AETERNA deploy i Vercel ===" -ForegroundColor Cyan
Write-Host "Telefonas: https://aeterna-web-six.vercel.app" -ForegroundColor Yellow
Write-Host "PC localhost:3000 NERA matomas telefone!" -ForegroundColor Yellow
Write-Host ""

Set-Location $Root

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Reikia git." -ForegroundColor Red
  exit 1
}

git add -A
$porcelain = git status --porcelain
if ($porcelain) {
  git commit -m "deploy: svetaines pataisymai (paieska, talpykla, badge)"
  Write-Host "Commit OK" -ForegroundColor Green
} else {
  Write-Host "Nera nauju failu commit'inti — bandome push bet kokiu atveju." -ForegroundColor Yellow
}

git push
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "git push nepavyko. Patikrinkite:" -ForegroundColor Red
  Write-Host "  git remote -v"
  Write-Host "  gh auth login"
  exit 1
}

Write-Host ""
Write-Host "Push OK. Palaukite 3-8 min." -ForegroundColor Green
Write-Host ""
Write-Host "Patikra naršyklėje (ne programėlėje):" -ForegroundColor Cyan
Write-Host "  https://aeterna-web-six.vercel.app/paieska"
Write-Host "  Turi atsidaryti 'Ieškoti atminties' — jei 404, deploy dar nebaigtas." -ForegroundColor Cyan
Write-Host ""
Write-Host "Tada telefone: Perkrauti iš serverio (⋮ meniu)" -ForegroundColor Cyan
Write-Host "Apačioje puslapio turi būti: Svetainės versija: xxxxx (ne 'local')" -ForegroundColor Cyan
Write-Host ""

if (Get-Command gh -ErrorAction SilentlyContinue) {
  Write-Host "Vercel deploy status (jei prijungta GitHub):" -ForegroundColor DarkGray
  gh api repos/:owner/:repo/deployments -q ".[0].status" 2>$null
}
