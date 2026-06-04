# Įkelia pakeitimus į GitHub → Vercel atnaujina aeterna-web-six (naudokite deploy-vercel.ps1)
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host ""
Write-Host "AETERNA → Vercel (aeterna-web-six.vercel.app)" -ForegroundColor Cyan
Write-Host ""

Set-Location $Root
git add -A
$status = git status --porcelain
if (-not $status) {
  Write-Host "Nera pakeitimu commit'inti." -ForegroundColor Yellow
} else {
  git commit -m "deploy: atminties paieska ir pataisymai"
  Write-Host "Commit sukurtas." -ForegroundColor Green
}

git push
if ($LASTEXITCODE -ne 0) {
  Write-Host "Push nepavyko. Patikrinkite git remote." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "OK — palaukite 2-5 min Vercel deploy." -ForegroundColor Green
Write-Host "Telefone: atidarykite https://aeterna-web-six.vercel.app/paieska" -ForegroundColor Cyan
Write-Host "arba meniu -> Ieskoti atminties, arba Perkrauti is serverio programeleje." -ForegroundColor Cyan
Write-Host ""
