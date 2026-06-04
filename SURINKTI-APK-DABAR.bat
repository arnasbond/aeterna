@echo off
chcp 65001 >nul
cd /d H:\dev\aeterna
echo === 1. Push web i GitHub ===
git add -A
git commit -m "fix: native version bar + server fetch commit-hash"
git push origin main
echo.
echo === 2. APK (versija 0.2.4) ===
cd android
call build-apk.ps1
echo.
echo === 3. Telefone ===
echo Idiekite nauja APK is android\app\build\outputs\apk\release\
echo Apacioje MATOMA ZALIA JUOSTA su versija (ne WebView)
pause
