@echo off
chcp 65001 >nul
cd /d H:\dev\aeterna
echo === 1. Push web i GitHub ===
git add -A
git commit -m "fix: native version bar + server fetch commit-hash"
git push origin main
echo.
echo === 2. APK (versija 0.2.5 build 7) ===
cd android
powershell -ExecutionPolicy Bypass -File build-apk.ps1 -Notes "0.2.5 versijos juosta telefone"
echo.
echo === 3. Telefone ===
copy /Y android\app\build\outputs\apk\release\app-release.apk "%USERPROFILE%\Desktop\AETERNA-0.2.5.apk" 2>nul
echo.
echo Desktop: AETERNA-0.2.5.apk
echo Telefone idiekite — virsuje AETERNA 0.2.5, apacioje geltona juosta
pause
