@echo off
echo.
echo ========================================
echo   ZENO Browser - Restore Backup
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0backup-restore.ps1" -Action list

echo.
set /p backup_name="Enter backup name to restore: "

if "%backup_name%"=="" (
    echo No backup name provided. Exiting.
    pause
    exit /b
)

powershell -ExecutionPolicy Bypass -File "%~dp0backup-restore.ps1" -Action restore -BackupName "%backup_name%"

echo.
pause
