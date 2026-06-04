@echo off

chcp 65001 >nul

title AETERNA — patikra ir APK

color 0A

setlocal EnableDelayedExpansion



set "EXPECTED_CODE=17"

set "EXPECTED_NAME=0.2.11"

set "OUT_NAME=AETERNA-0.2.11.apk"



echo.

echo ========================================

echo   AETERNA — PATIKRA IR APK %EXPECTED_NAME% (svetaine nepasiekiama fix)

echo ========================================

echo.



set SDK=

set SDK_UNMUTE=H:\OneDrive\Desktop\unmute\android-sdk

set SDK_LOCAL=%LOCALAPPDATA%\Android\Sdk



echo [1] Android SDK...

if exist "%SDK_UNMUTE%\platform-tools\adb.exe" (

  set "SDK=%SDK_UNMUTE%"

  echo   OK  %SDK_UNMUTE%

  goto :sdk_ok

)

if exist "%SDK_LOCAL%\platform-tools\adb.exe" (

  set "SDK=%SDK_LOCAL%"

  echo   OK  %SDK_LOCAL%

  goto :sdk_ok

)

echo   KLAIDA — SDK nerastas!

pause

exit /b 1



:sdk_ok

set ANDROID_HOME=%SDK%

set ANDROID_SDK_ROOT=%SDK%

echo sdk.dir=%SDK:\=/%> H:\dev\aeterna\android\local.properties

echo.



echo [2] Gradle...

if not exist "H:\dev\aeterna\android\gradlew.bat" (

  echo   KLAIDA — gradlew.bat nerastas

  pause

  exit /b 1

)

echo   OK

echo.



echo [3] Java...

where java >nul 2>&1

if errorlevel 1 (

  echo   ISPEJIMAS — java nerasta PATH.

) else (

  java -version 2>&1 | findstr /i "version"

  echo   OK

)

echo.



echo [4] Sustabdomi Gradle / atlaisvinami failai...

cd /d H:\dev\aeterna\android

call gradlew.bat --stop >nul 2>&1

timeout /t 3 /nobreak >nul

if exist "app\build\intermediates\dex" rd /s /q "app\build\intermediates\dex" 2>nul

echo   clean + release build ^(gali trukti 3-8 min^)...

call gradlew.bat clean assembleRelease --no-daemon -PAPP_VERSION_CODE=%EXPECTED_CODE% -PAPP_VERSION_NAME=%EXPECTED_NAME%

if errorlevel 1 (

  echo.

  echo   KLAIDA — Release build nepavyko.

  echo   Dažna priežastis: classes.dex užrakintas — uždarykite Android Studio,

  echo   antrą CMD langą su Gradle, palaukite 10 s ir paleiskite šį .bat dar kartą.

  echo.

  pause

  exit /b 1

)



set "APK=app\build\outputs\apk\release\app-release.apk"

if not exist "%APK%" (

  echo   KLAIDA — release APK nerastas: %APK%

  pause

  exit /b 1

)



echo.

echo [5] APK versijos patikra ^(privalo buti %EXPECTED_NAME% / %EXPECTED_CODE%^)...

set AAPT=

for /f "delims=" %%D in ('dir /b /ad /o-n "%SDK%\build-tools" 2^>nul') do (

  if exist "%SDK%\build-tools\%%D\aapt.exe" (

    set "AAPT=%SDK%\build-tools\%%D\aapt.exe"

    goto :aapt_found

  )

)

echo   KLAIDA — aapt.exe nerastas

pause

exit /b 1



:aapt_found

set "BADGING="

for /f "delims=" %%L in ('"%AAPT%" dump badging "%APK%" 2^>nul ^| findstr /i "versionCode versionName"') do (

  echo   %%L

  set "BADGING=%%L"

)

"%AAPT%" dump badging "%APK%" | findstr /i "versionCode='%EXPECTED_CODE%'" >nul

if errorlevel 1 (

  echo.

  echo   KLAIDA — APK versija NETINKAMA. NEDIEKITE šio failo.

  echo   Tikėtasi versionCode=%EXPECTED_CODE% versionName=%EXPECTED_NAME%

  echo   Jei matote 12 / 0.2.6 — build nepavyko, liko senas APK.

  echo.

  pause

  exit /b 1

)

"%AAPT%" dump badging "%APK%" | findstr /i "versionName='%EXPECTED_NAME%'" >nul

if errorlevel 1 (

  echo   KLAIDA — versionName ne %EXPECTED_NAME%

  pause

  exit /b 1

)



echo.

echo [6] Kopijuojama tik patikrinta APK...

copy /Y "%APK%" "%USERPROFILE%\Desktop\%OUT_NAME%"

if exist "H:\OneDrive\Desktop\" copy /Y "%APK%" "H:\OneDrive\Desktop\%OUT_NAME%"

copy /Y "%APK%" "H:\dev\aeterna\AETERNA-install.apk"

if not exist "H:\dev\aeterna\api\releases\android\" mkdir "H:\dev\aeterna\api\releases\android\"

copy /Y "%APK%" "H:\dev\aeterna\api\releases\android\aeterna.apk"

powershell -NoProfile -Command "$j=@{versionCode=%EXPECTED_CODE%;versionName='%EXPECTED_NAME%';releaseNotes='web-six build %EXPECTED_CODE%';required=$false}|ConvertTo-Json; [IO.File]::WriteAllText('H:\dev\aeterna\api\releases\android\update.json',$j,[Text.UTF8Encoding]::new($false))"



echo.

echo ========================================

echo   SEKMINGAI — tikra %EXPECTED_NAME% ^(%EXPECTED_CODE%^)

echo ========================================

echo   H:\OneDrive\Desktop\%OUT_NAME%

echo   %USERPROFILE%\Desktop\%OUT_NAME%

echo.

echo   Dabar galima idiegti telefone.

echo ========================================

echo.

pause

exit /b 0


