# AETERNA — APK surinkimas (Windows)
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

function Resolve-SdkDir([string]$Raw) {
    if (-not $Raw) { return $null }
    $p = $Raw.Trim().Replace("/", "\")
    $p = $p -replace '\\+', '\'
    if (Test-Path $p) { return (Resolve-Path $p).Path }
    return $null
}

function Find-AndroidSdk {
    if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
        return (Resolve-Path $env:ANDROID_HOME).Path
    }
    if ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
        return (Resolve-Path $env:ANDROID_SDK_ROOT).Path
    }

    $localProps = Join-Path $Root "local.properties"
    if (Test-Path $localProps) {
        foreach ($line in Get-Content $localProps) {
            if ($line -match '^\s*sdk\.dir\s*=\s*(.+)\s*$') {
                $sdk = Resolve-SdkDir $Matches[1]
                if ($sdk) { return $sdk }
            }
        }
    }

    $candidates = @(
        "H:\OneDrive\Desktop\unmute\android-sdk",
        (Join-Path $env:LOCALAPPDATA "Android\Sdk"),
        (Join-Path $env:USERPROFILE "AppData\Local\Android\Sdk"),
        "C:\Android\Sdk"
    )
    foreach ($c in $candidates) {
        if ($c -and (Test-Path $c)) { return (Resolve-Path $c).Path }
    }
    return $null
}

$sdk = Find-AndroidSdk
if (-not $sdk) {
    Write-Host ""
    Write-Host "ANDROID_HOME nerastas." -ForegroundColor Red
    Write-Host ""
    Write-Host "1) Įdiekite Android Studio: https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host "2) Arba nukopijuokite SDK į:" -ForegroundColor Yellow
    Write-Host "   H:\OneDrive\Desktop\unmute\android-sdk" -ForegroundColor Yellow
    Write-Host "3) Arba redaguokite android\local.properties:" -ForegroundColor Yellow
    Write-Host "   sdk.dir=C\:\\Users\\JUSU\\AppData\\Local\\Android\\Sdk" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
Write-Host "Android SDK: $sdk" -ForegroundColor DarkGray

New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null

$gradleProps = Join-Path $Root "gradle.properties"
$versionCode = 1
$versionName = "0.2.5"
if (Test-Path $gradleProps) {
    Get-Content $gradleProps | ForEach-Object {
        if ($_ -match '^APP_VERSION_CODE=(\d+)') { $versionCode = [int]$Matches[1] }
        if ($_ -match '^APP_VERSION_NAME=(.+)') { $versionName = $Matches[1].Trim() }
    }
} elseif (Test-Path $VersionFile) {
    Get-Content $VersionFile | ForEach-Object {
        if ($_ -match '^versionCode=(\d+)') { $versionCode = [int]$Matches[1] }
        if ($_ -match '^versionName=(.+)$') { $versionName = $Matches[1].Trim() }
    }
    $versionCode++
}

$notes = $Notes
if (-not $notes) {
    $notes = "AETERNA Android $versionName (build $versionCode)"
}

"versionCode=$versionCode`nversionName=$versionName" | Set-Content -Path $VersionFile -Encoding UTF8

$localProps = Join-Path $Root "local.properties"
$sdkDirGradle = $sdk -replace '\\', '/'
"sdk.dir=$sdkDirGradle" | Set-Content -Path $localProps -Encoding ASCII

$gradlew = Join-Path $Root "gradlew.bat"
if (-not (Test-Path $gradlew)) {
    Write-Host "gradlew.bat nerastas. Atidarykite android/ Android Studio." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Renkamas APK v$versionName ($versionCode)..." -ForegroundColor Cyan
Push-Location $Root
try {
    & $gradlew assembleRelease "-PAPP_VERSION_CODE=$versionCode" "-PAPP_VERSION_NAME=$versionName"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $apk = Get-ChildItem -Path "app\build\outputs\apk\release" -Filter "*.apk" -Recurse | Select-Object -First 1
    if (-not $apk) {
        & $gradlew assembleDebug "-PAPP_VERSION_CODE=$versionCode" "-PAPP_VERSION_NAME=$versionName"
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        $apk = Get-ChildItem -Path "app\build\outputs\apk\debug" -Filter "*.apk" -Recurse | Select-Object -First 1
    }
    if (-not $apk) {
        Write-Host "APK nerastas po build." -ForegroundColor Red
        exit 1
    }

    $userApk = Join-Path $RepoRoot "AETERNA-install.apk"
    Copy-Item $apk.FullName $userApk -Force

    $destApk = Join-Path $ReleaseDir "aeterna.apk"
    Copy-Item $userApk $destApk -Force

    $webReleaseDir = Join-Path $RepoRoot "web\public\releases"
    New-Item -ItemType Directory -Force -Path $webReleaseDir | Out-Null
    Copy-Item $userApk (Join-Path $webReleaseDir "aeterna.apk") -Force

    $desktopApk = Join-Path $env:USERPROFILE "Desktop\AETERNA-$versionName.apk"
    Copy-Item $apk.FullName $desktopApk -Force

    $manifest = @{
        versionCode = $versionCode
        versionName = $versionName
        releaseNotes = $notes
        required = $false
    } | ConvertTo-Json -Depth 3
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($UpdateJson, $manifest, $utf8NoBom)

    Write-Host ""
    Write-Host "APK paruoštas:" -ForegroundColor Green
    Write-Host "  Darbalaukis: $desktopApk"
    Write-Host "  Versija:     $versionName (build $versionCode)"
    Write-Host ""
} finally {
    Pop-Location
}
