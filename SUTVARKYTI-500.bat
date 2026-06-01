@echo off
title AETERNA — sutvarkyti Internal Server Error
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0restart-clean.ps1"
