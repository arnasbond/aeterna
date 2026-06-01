# AETERNA — debug APK surinkimas + publikavimas OTA atnaujinimams (Windows)
# Reikia: Android SDK (Android Studio) ir JDK 17+

param(
    [string]$Notes = ""
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$RepoRoot = Split-Path $Root -Parent
$ReleaseDir = Join-Path $RepoRoot "api\releases\android"
$VersionFile = Join-Path $ReleaseDir "version.properties"
$UpdateJson = Join-Path $ReleaseDir "update.json"

if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $defaultSdk) {
        $env:ANDROID_HOME = $defaultSdk
    }
}

if (-not $env:ANDROID_HOME) {
    Write-Host "ANDROID_HOME nerastas. Įdiekite Android Studio arba nustatykite ANDROID_HOME." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null

$versionCode = 1
$versionName = "0.1.0-dev"
if (Test-Path $VersionFile) {
    Get-Content $VersionFile | ForEach-Object {
        if ($_ -match '^versionCode=(\d+)') { $versionCode = [int]$Matches[1] }
        if ($_ -match '^versionName=(.+)$') { $versionName = $Matches[1].Trim() }
    }
}
$versionCode++

$notes = $Notes
if (-not $notes) {
    $notes = Read-Host "Atnaujinimo aprašymas (Enter = numatytasis)"
}
if (-not $notes) {
    $notes = "AETERNA Android $versionName (build $versionCode)"
}

"versionCode=$versionCode`nversionName=$versionName" | Set-Content -Path $VersionFile -Encoding UTF8

$localProps = Join-Path $Root "local.properties"
if (-not (Test-Path $localProps)) {
    $sdkDir = $env:ANDROID_HOME -replace '\\', '/'
    "sdk.dir=$sdkDir" | Set-Content -Path $localProps -Encoding UTF8
    Write-Host "Sukurtas local.properties → $sdkDir"
}

$gradlew = Join-Path $Root "gradlew.bat"
if (-not (Test-Path $gradlew)) {
    Write-Host ""
    Write-Host "gradlew.bat dar nėra. Android Studio → Open → android/ → Build APK" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Renkamas APK v$versionName ($versionCode)..." -ForegroundColor Cyan
Push-Location $Root
try {
    & $gradlew assembleDebug "-PAPP_VERSION_CODE=$versionCode" "-PAPP_VERSION_NAME=$versionName"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $apk = Get-ChildItem -Path "app\build\outputs\apk\debug" -Filter "*.apk" -Recurse | Select-Object -First 1
    if (-not $apk) {
        Write-Host "APK nerastas po build." -ForegroundColor Red
        exit 1
    }

    $userApk = Join-Path $RepoRoot "AETERNA-install.apk"
    Copy-Item $apk.FullName $userApk -Force

    $destApk = Join-Path $ReleaseDir "aeterna.apk"
    if (Test-Path $destApk) { Remove-Item $destApk -Force }
    try {
        New-Item -ItemType HardLink -Path $destApk -Target $userApk | Out-Null
    } catch {
        Copy-Item $userApk $destApk -Force
    }

    $manifest = @{
        versionCode = $versionCode
        versionName = $versionName
        releaseNotes = $notes
        required = $false
    } | ConvertTo-Json -Depth 3
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($UpdateJson, $manifest, $utf8NoBom)

    Remove-Item $apk.FullName -Force -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host "APK paruoštas ir publikuotas OTA atnaujinimams:" -ForegroundColor Green
    Write-Host "  Telefonui: $userApk"
    Write-Host "  Serveris:  $destApk"
    Write-Host "  Manifest:  $UpdateJson"
    Write-Host ""
    Write-Host "Telefonai su senesne versija gaus atnaujinimą automatiškai (API turi veikti :4000)." -ForegroundColor Cyan
} finally {
    Pop-Location
}
