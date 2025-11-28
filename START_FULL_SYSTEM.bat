@echo off
title ZENO SYSTEM LAUNCHER
echo ===================================================
echo      URUCHAMIANIE SYSTEMU ZENO + CAYD
echo ===================================================

echo.
echo [1/4] Zamykanie poprzednich procesow (Node, Electron)...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM electron.exe /T >nul 2>&1
echo Wyczyszczono procesy.

echo.
echo [2/4] Uruchamianie ZENO_WEB_CORE_APP (Serwer tresci)...
cd /d "%~dp0ZENO_WEB_CORE_APP"
start "ZENO_CORE_SERVER" cmd /k "npm run dev"

echo.
echo [3/4] Czekanie na start serwera (10 sekund)...
timeout /t 10 /nobreak >nul

echo.
echo [4/4] Uruchamianie CAYD_SEARCH_ENG (Przegladarka)...
cd /d "%~dp0CAYD_SEARCH_ENG"
start "CAYD_BROWSER" cmd /k "npm start"

echo.
echo ===================================================
echo      SYSTEM URUCHOMIONY
echo ===================================================
echo.
echo ZENO Server: http://localhost:4378
echo CAYD Browser: GUI
echo.
pause
