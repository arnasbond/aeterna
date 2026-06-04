@echo off
cd /d H:\dev\aeterna
git add -A
git commit -m "fix: phone shows commit hash not vercel (server badge, WebView cache)"
git push origin main
echo.
echo 1) Palaukite Vercel Ready
echo 2) Telefone: Perkrauti is serverio
echo 3) Jei vis dar vercel: surinkite nauja APK (android\build-apk.ps1)
pause
