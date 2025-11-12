@echo off
echo.
echo ========================================
echo   ZENO Browser - Quick Backup
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0backup-restore.ps1" -Action backup

echo.
echo Backup completed!
echo.
pause
