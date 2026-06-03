# AETERNA giluminis E2E API testas (production)
$ErrorActionPreference = "Stop"
$API = "https://api-three-chi-63.vercel.app"
$WEB = "https://aeterna-web-six.vercel.app"
$results = @()

function Log($name, $ok, $detail = "") {
  $script:results += [pscustomobject]@{ Test = $name; OK = $ok; Detail = $detail }
  $icon = if ($ok) { "PASS" } else { "FAIL" }
  Write-Host "[$icon] $name" -ForegroundColor $(if ($ok) { "Green" } else { "Red" })
  if ($detail) { Write-Host "      $detail" -ForegroundColor DarkGray }
}

function Invoke-Api($method, $path, $body = $null, $headers = @{}) {
  $uri = "$API$path"
  $params = @{ Method = $method; Uri = $uri; Headers = $headers }
  if ($body) {
    $params.Body = ($body | ConvertTo-Json -Compress)
    $params.ContentType = "application/json"
  }
  return Invoke-RestMethod @params
}

Write-Host "`n=== AETERNA E2E API ($API) ===`n" -ForegroundColor Cyan

try {
  $h = Invoke-Api GET "/health"
  Log "Health + KV" ($h.status -eq "ok" -and $h.jsonStore -eq "kv") "jsonStore=$($h.jsonStore)"
} catch { Log "Health + KV" $false $_.Exception.Message }

try {
  $p = Invoke-Api GET "/api/v1/parishes"
  Log "Parishes list" ($p.success -and $p.data.Count -gt 50) "count=$($p.data.Count)"
} catch { Log "Parishes list" $false $_.Exception.Message }

try {
  $m = Invoke-Api GET "/api/v1/memorials/ona-demo"
  Log "Demo memorial public" ($m.success -and $m.data.slug -eq "ona-demo") $m.data.fullName
} catch { Log "Demo memorial public" $false $_.Exception.Message }

try {
  $c = Invoke-Api GET "/api/v1/memorials/ona-demo/candles"
  Log "Demo candles" $c.success "count=$($c.data.Count)"
} catch { Log "Demo candles" $false $_.Exception.Message }

try {
  $g = Invoke-Api GET "/api/v1/memorials/ona-demo/guestbook"
  Log "Demo guestbook GET" $g.success "entries=$($g.data.Count)"
} catch { Log "Demo guestbook GET" $false $_.Exception.Message }

$guestMsg = "E2E test uzojauta $(Get-Date -Format 'HH:mm:ss')"
try {
  $gp = Invoke-Api POST "/api/v1/memorials/ona-demo/guestbook" @{ authorName = "E2E Tester"; message = $guestMsg }
  Log "Guestbook POST" ($gp.success -and $gp.data.id) $gp.data.message
} catch { Log "Guestbook POST" $false $_.Exception.Message }

try {
  $lc = Invoke-Api POST "/api/v1/candles/light" @{
    memorialSlug = "ona-demo"
    donorName = "E2E Tester"
    amountCents = 500
  }
  Log "Candle light + payment split" (
    $lc.success -and $lc.data.serviceFeeCents -eq 50 -and $lc.data.totalChargedCents -eq 550
  ) "fee=$($lc.data.serviceFeeCents) total=$($lc.data.totalChargedCents)"
} catch { Log "Candle light + payment split" $false $_.Exception.Message }

# --- User ---
$userEmail = "e2e-user-$(Get-Random)@aeterna.test"
try {
  $reg = Invoke-Api POST "/api/v1/auth/register" @{
    fullName = "E2E Vartotojas"
    email = $userEmail
    password = "testpass123"
    passwordConfirm = "testpass123"
  }
  $userToken = $reg.data.token
  Log "User register" ($reg.success -and $userToken) $userEmail
} catch { Log "User register" $false $_.Exception.Message; $userToken = $null }

if ($userToken) {
  try {
    $me = Invoke-Api GET "/api/v1/auth/me" $null @{ Authorization = "Bearer $userToken" }
    Log "User /auth/me" ($me.success -and $me.data.email -eq $userEmail) $me.data.fullName
  } catch { Log "User /auth/me" $false $_.Exception.Message }

  try {
    $oauth = Invoke-Api POST "/api/v1/auth/oauth" @{ provider = "google"; email = "e2e-google@test.lt"; fullName = "E2E Google" }
    Log "OAuth Google mock" ($oauth.success -and $oauth.data.token) $oauth.data.provider
  } catch { Log "OAuth Google mock" $false $_.Exception.Message }

$parishId = "parish-vilniaus-sv-stanislovo-ir-sv-vladislovo-arkikatedra-bazilika"
  try {
    $cm = Invoke-Api POST "/api/v1/user/memorials" @{
      parishId = $parishId
      fullName = "E2E Memorial Test"
      birthDate = "1950-01-01"
      deathDate = "2025-01-01"
      biography = "Automatinis testas"
    } @{ Authorization = "Bearer $userToken" }
    $testSlug = $cm.data.slug
    Log "User create memorial" ($cm.success -and $testSlug) "slug=$testSlug moderation=$($cm.data.moderationStatus)"
  } catch { Log "User create memorial" $false $_.Exception.Message; $testSlug = $null }

  if ($testSlug) {
    try {
      $pub = Invoke-Api GET "/api/v1/memorials/$testSlug"
      Log "Pending memorial hidden public" (-not $pub.success) "should 404 until approved"
    } catch {
      Log "Pending memorial hidden public" $true "404 as expected"
    }
  }
}

# --- Priest ---
try {
  $pl = Invoke-Api POST "/api/v1/priest/login" @{ parishId = $parishId; password = "" }
  $priestToken = $pl.data.token
  Log "Priest login (test)" ($pl.success -and $priestToken) "parish=$($pl.data.parishId)"
} catch { Log "Priest login (test)" $false $_.Exception.Message; $priestToken = $null }

if ($priestToken) {
  $ph = @{ Authorization = "Bearer $priestToken" }
  try {
    $dash = Invoke-Api GET "/api/v1/priest/dashboard" $null $ph
    Log "Priest dashboard" ($dash.success -and $null -ne $dash.data) "masses=$($dash.data.pendingMasses)"
  } catch { Log "Priest dashboard" $false $_.Exception.Message }

  try {
    $masses = Invoke-Api GET "/api/v1/priest/masses" $null $ph
    Log "Priest masses list" ($masses.success) "count=$($masses.data.Count)"
  } catch { Log "Priest masses list" $false $_.Exception.Message }

  try {
    $prof = Invoke-Api GET "/api/v1/priest/parish-profile" $null $ph
    Log "Priest parish profile" ($prof.success -and $prof.data.profile) $prof.data.title
  } catch { Log "Priest parish profile" $false $_.Exception.Message }

  try {
    $otp = Invoke-Api POST "/api/v1/priest/auth/request-code" @{
      parishId = "parish-vilnius-cathedral"
      email = "klebonas@test.lt"
    }
    Log "Priest OTP request" ($otp.success -and $otp.data.devCode) "devCode present in test mode"
  } catch { Log "Priest OTP request" $false $_.Exception.Message }
}

# --- Admin ---
try {
  $al = Invoke-Api POST "/api/v1/admin/login" @{ password = "" }
  $adminToken = $al.data.token
  Log "Admin login (test)" ($al.success -and $adminToken) ""
} catch { Log "Admin login (test)" $false $_.Exception.Message; $adminToken = $null }

if ($adminToken) {
  $ah = @{ Authorization = "Bearer $adminToken" }
  try {
    $pr = Invoke-Api GET "/api/v1/admin/priest-requests" $null $ah
    Log "Admin priest requests" $pr.success "count=$($pr.data.Count)"
  } catch { Log "Admin priest requests" $false $_.Exception.Message }

  try {
    $pm = Invoke-Api GET "/api/v1/admin/memorials/pending" $null $ah
    Log "Admin pending memorials" $pm.success "pending=$($pm.data.Count)"
    if ($testSlug -and ($pm.data | Where-Object { $_.slug -eq $testSlug })) {
      $ap = Invoke-Api POST "/api/v1/admin/memorials/$testSlug/approve" $null $ah
      Log "Admin approve test memorial" $ap.success "slug=$testSlug"
      $pub2 = Invoke-Api GET "/api/v1/memorials/$testSlug"
      Log "Approved memorial public" ($pub2.success) $pub2.data.fullName
    }
  } catch { Log "Admin pending memorials" $false $_.Exception.Message }
}

# --- Web pages HTTP ---
$pages = @("/", "/m/ona-demo", "/prisijungti", "/priest/login", "/priest/dashboard", "/admin/login", "/parishes", "/wizard")
foreach ($page in $pages) {
  try {
    $r = Invoke-WebRequest -Uri "$WEB$page" -UseBasicParsing -TimeoutSec 30
    Log "Web $page" ($r.StatusCode -eq 200) "status=$($r.StatusCode) len=$($r.Content.Length)"
  } catch { Log "Web $page" $false $_.Exception.Message }
}

Write-Host "`n=== SANTRAUKA ===" -ForegroundColor Cyan
$pass = ($results | Where-Object { $_.OK }).Count
$fail = ($results | Where-Object { -not $_.OK }).Count
Write-Host "PASS: $pass  FAIL: $fail  TOTAL: $($results.Count)" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
if ($fail -gt 0) {
  Write-Host "`nNepavyko:" -ForegroundColor Red
  $results | Where-Object { -not $_.OK } | ForEach-Object { Write-Host "  - $($_.Test): $($_.Detail)" }
}
exit $(if ($fail -gt 0) { 1 } else { 0 })
