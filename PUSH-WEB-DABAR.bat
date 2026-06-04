@echo off
chcp 65001 >nul
title AETERNA — push web
cd /d H:\dev\aeterna

echo.
echo === Push web pataisymai ===
git add web/
git status --short web/

git diff --cached --quiet
if %errorlevel% equ 0 (
  echo Tusciam commit — Vercel redeploy...
  git commit --allow-empty -m "chore(web): redeploy memorial JSON fix"
) else (
  git commit -m "fix(web): static demo pages, full nav, API URL baked in"
)

if errorlevel 1 goto fail

git push origin main
if errorlevel 1 goto fail

echo.
echo OK — po 2-3 min bandykite:
echo https://aeterna-mauve.vercel.app/m/ona-demo
goto end

:fail
echo KLAIDA — ziurekite zinute auksciau.

:end
pause
