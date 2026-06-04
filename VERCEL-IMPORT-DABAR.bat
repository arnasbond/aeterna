@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === AETERNA: Git push + Vercel import ===
echo.

git add -A
git status --short
echo.

git diff --cached --quiet
if %errorlevel% equ 0 (
  echo Nera nauju pakeitimu - bandome push bet kokiu atveju...
) else (
  git commit -m "deploy: paieska, Vercel web root, Android sync"
  if errorlevel 1 (
    echo Commit nepavyko.
    pause
    exit /b 1
  )
  echo Commit OK.
)

git push origin main
if errorlevel 1 (
  echo.
  echo Push nepavyko. Paleiskite: gh auth login
  echo Arba: git push -u origin main
  pause
  exit /b 1
)

echo.
echo === PUSH OK ===
echo.
echo Dabar Vercel.com:
echo   1. Pasirinkite "Import Git Repository"  (NE "Create Empty Project")
echo   2. GitHub -^> repozitorija: arnasbond/aeterna
echo   3. Root Directory: web
echo   4. Env: API_INTERNAL_URL ir NEXT_PUBLIC_API_URL = api-three-chi-63.vercel.app
echo   5. Deploy
echo.
start https://vercel.com/new
start https://github.com/arnasbond/aeterna
pause
