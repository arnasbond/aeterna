@echo off
chcp 65001 >nul
set OUT=H:\dev\aeterna\_patikra-sdk-rezultatas.txt
echo PATIKRA %DATE% %TIME% > "%OUT%"
echo. >> "%OUT%"

echo === local.properties === >> "%OUT%"
type H:\dev\aeterna\android\local.properties >> "%OUT%" 2>&1
echo. >> "%OUT%"

echo === SDK unmute === >> "%OUT%"
if exist "H:\OneDrive\Desktop\unmute\android-sdk\platform-tools\adb.exe" (
  echo RASTA: H:\OneDrive\Desktop\unmute\android-sdk >> "%OUT%"
) else (
  echo NERASTA: H:\OneDrive\Desktop\unmute\android-sdk >> "%OUT%"
)

echo === SDK LocalAppData === >> "%OUT%"
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
  echo RASTA: %LOCALAPPDATA%\Android\Sdk >> "%OUT%"
) else (
  echo NERASTA: %LOCALAPPDATA%\Android\Sdk >> "%OUT%"
)

echo === gradlew === >> "%OUT%"
if exist "H:\dev\aeterna\android\gradlew.bat" (echo gradlew OK >> "%OUT%") else (echo gradlew MISSING >> "%OUT%")

echo === Desktop APK === >> "%OUT%"
if exist "%USERPROFILE%\Desktop\AETERNA-0.2.5.apk" (
  echo RASTA Desktop APK >> "%OUT%"
  dir "%USERPROFILE%\Desktop\AETERNA-0.2.5.apk" >> "%OUT%"
) else (
  echo NERASTA Desktop APK >> "%OUT%"
)

echo === JAVA === >> "%OUT%"
where java >> "%OUT%" 2>&1

echo DONE >> "%OUT%"
