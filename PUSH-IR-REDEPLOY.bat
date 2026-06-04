@echo off
chcp 65001 >nul
cd /d H:\dev\aeterna
echo === AETERNA: git push + Vercel instrukcija ===
echo.

if not exist "web\app\paieska\page.tsx" (
  echo KLAIDA: web\app\paieska\page.tsx nerastas!
  pause
  exit /b 1
)

git add -A
git status -sb
echo.
git commit -m "fix: paieska puslapis ir paieskos UI" 2>nul
if errorlevel 1 echo (commit praleistas - gal jau viskas sucommitinta)
echo.
git push origin main
if errorlevel 1 (
  echo.
  echo PUSH nepavyko. Patikrinkite GitHub prisijungima.
  pause
  exit /b 1
)

echo.
echo OK — kodas GitHub. Dabar Vercel:
echo   1. https://vercel.com - projektas aeterna
echo   2. Deployments - paskutinis - ... - Redeploy
echo   3. Naršyklėje: https://aeterna-arnasbond-gmailcoms-projects.vercel.app/paieska
echo.
pause
