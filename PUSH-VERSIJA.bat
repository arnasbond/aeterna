@echo off
cd /d H:\dev\aeterna
git add -A
git commit -m "fix: phone local version - force Vercel URL, show host in badge"
git push origin main
echo.
echo Paleiskite Vercel deploy, tada telefone: Nustatymai - debesis arba naujas APK
pause
