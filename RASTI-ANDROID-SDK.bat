@echo off
chcp 65001 >nul
echo.
echo Tikrinami Android SDK keliai...
echo.

set FOUND=

if exist "H:\OneDrive\Desktop\unmute\android-sdk\platform-tools" (
  set "FOUND=H:\OneDrive\Desktop\unmute\android-sdk"
  goto :ok
)

if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools" (
  set "FOUND=%LOCALAPPDATA%\Android\Sdk"
  goto :ok
)

echo NERASTA. Sprendimai:
echo.
echo A) Android Studio ^(rekomenduojama^)
echo    https://developer.android.com/studio
echo    Instaliuokite - SDK bus: %%LOCALAPPDATA%%\Android\Sdk
echo.
echo B) Nukopijuokite SDK i:
echo    H:\OneDrive\Desktop\unmute\android-sdk
echo.
pause
exit /b 1

:ok
echo RASTA: %FOUND%
echo.
echo Rasau i android\local.properties ...
(
  echo sdk.dir=%FOUND:\=\\%
) > "H:\dev\aeterna\android\local.properties"

setx ANDROID_HOME "%FOUND%" >nul 2>&1
set ANDROID_HOME=%FOUND%
set ANDROID_SDK_ROOT=%FOUND%

echo.
echo Dabar paleiskite: SURINKTI-APK-DABAR.bat
pause
