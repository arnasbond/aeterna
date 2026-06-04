# Patikrina ar Vercel jau turi naujausia svetaine
$ErrorActionPreference = "Continue"
# Pakeiskite į savo Vercel URL po deploy (Settings → Domains)
$base = if ($env:AETERNA_WEB_URL) { $env:AETERNA_WEB_URL.TrimEnd('/') } else { "https://aeterna-mauve.vercel.app" }

Write-Host ""
Write-Host "Tikrinama: $base" -ForegroundColor Cyan

function Test-Url($path) {
  $url = "$base$path"
  try {
    $r = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -TimeoutSec 25
    Write-Host "  OK $($r.StatusCode)  $url" -ForegroundColor Green
    return $true
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if (-not $code) { $code = "?" }
    Write-Host "  $code  $url" -ForegroundColor Red
    return $false
  }
}

$homeOk = Test-Url "/"
$paieskaOk = Test-Url "/paieska"

Write-Host ""
if (-not $paieskaOk) {
  Write-Host "404 = Vercel dar senas build. Paleiskite:" -ForegroundColor Yellow
  Write-Host "  1. Vercel -> Settings -> Root Directory = web" -ForegroundColor Yellow
  Write-Host "  2. .\deploy-vercel.ps1" -ForegroundColor Yellow
  Write-Host "  3. Palaukite ir vėl .\patikrinti-vercel.ps1" -ForegroundColor Yellow
} else {
  Write-Host "Deploy OK — telefone Perkrauti is serverio." -ForegroundColor Green
}
Write-Host ""
