@echo off
cd /d "%~dp0api"
echo === AETERNA: 685+ parapijos is RC JAR ===
python scripts/fetch-jar-parishes.py
if errorlevel 1 exit /b 1
call npm run import:parishes:jar
echo.
echo Baigta. Deploy API: cd api ^& npx vercel --prod --yes
pause
