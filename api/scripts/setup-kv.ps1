# Sukuria Upstash KV (aeterna-kv) ir prijungia prie API projekto Vercel'e.
# Reikia: npx vercel login
# Pirmą kartą gali reikėti naršyklėje priimti Upstash sąlygas.

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Kuriama KV: aeterna-kv (Frankfurt, nemokamas planas)..."
npx vercel@54 install upstash/upstash-kv `
  --name aeterna-kv `
  -m primaryRegion=fra1 `
  --plan free `
  -e production

Write-Host "Perdeploy'inama API..."
npx vercel@54 deploy --prod

Write-Host "Patikrinimas:"
(Invoke-RestMethod "https://api-three-chi-63.vercel.app/health") | Format-List
