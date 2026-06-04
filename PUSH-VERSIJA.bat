@echo off
cd /d H:\dev\aeterna
git add -A
git commit -m "fix: Vercel build label on phone (server runtime, not local)"
git push origin main
git rev-parse --short HEAD
pause
