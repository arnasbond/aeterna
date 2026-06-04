@echo off
chcp 65001 >nul
cd /d H:\dev\aeterna\android

echo.
echo === AETERNA APK 0.2.5 ===
echo.

powershell -ExecutionPolicy Bypass -File "build-apk.ps1" -Notes "0.2.5 telefonui"
if errorlevel 1 (
  echo.
  echo Jei ANDROID_HOME nerastas - paleiskite:
  echo   H:\dev\aeterna\RASTI-ANDROID-SDK.bat
  pause
  exit /b 1
)

echo.
echo Telefone idiekite Desktop\AETERNA-0.2.5.apk ^(versija 0.2.5, ne 0.1.0^)
pause
