@echo off
chcp 65001 >nul
title AETERNA — serveriai
cd /d "%~dp0"
if not exist "%~dp0start-dev.ps1" (
  echo KLAIDA: start-dev.ps1 nerastas.
  echo Kelias: %~dp0
  pause
  exit /b 1
)
echo Paleidziama is: %CD%
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"
if errorlevel 1 (
  echo.
  echo KLAIDA: Nepavyko paleisti. Ar idiegta Node.js?
  pause
  exit /b 1
)
echo.
echo Jei atsidare du melyni PowerShell langai — serveriai veikia.
echo Naršykle: http://localhost:3000
pause
