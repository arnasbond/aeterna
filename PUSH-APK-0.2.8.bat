@echo off
chcp 65001 >nul
cd /d H:\dev\aeterna
echo === Push Android 0.2.8 (14) ===
if not exist "api\releases\android\aeterna.apk" (
  echo KLAIDA: api\releases\android\aeterna.apk nerastas. Paleiskite PATIKRA-IR-SURINKTI.bat
  pause
  exit /b 1
)
git add api/releases/android/update.json api/releases/android/aeterna.apk
git add android/ PATIKRA-IR-SURINKTI.bat api/src/routes/app-config.ts 2>nul
git status -sb
git commit -m "release: Android 0.2.8 (14) APK and update manifest"
if errorlevel 1 (
  echo Commit nepavyko arba nieko naujo.
  pause
  exit /b 1
)
git push origin main
echo.
echo Jei push OK — po 1-2 min API turi rodyti versionCode 14:
echo https://api-three-chi-63.vercel.app/api/v1/app/android/update
pause
