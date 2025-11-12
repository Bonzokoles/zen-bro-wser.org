@echo off
echo ================================================
echo  ZENO Browser + CAYD Search Engine Launcher
echo ================================================
echo.

REM Sprawdzenie czy U:\JIMBO_INC_CONTROL_CENTER\LIBRARIES istnieje
if not exist "U:\JIMBO_INC_CONTROL_CENTER\LIBRARIES" (
    echo [ERROR] Katalog U:\JIMBO_INC_CONTROL_CENTER\LIBRARIES nie istnieje!
    echo.
    echo Sprawdz czy dysk U:\ jest zamontowany i czy folder JIMBO_INC_CONTROL_CENTER\LIBRARIES jest dostepny.
    pause
    exit /b 1
)

echo [OK] Znaleziono katalog biblioteki: U:\JIMBO_INC_CONTROL_CENTER\LIBRARIES
echo.

REM Zmiana katalogu na CAYD_SEARCH_ENG
cd /d "V:\PROTO_TYpy\ZENO_web_CORE\CAYD_SEARCH_ENG"

echo [1/3] Uruchamianie CAYD Search Engine (port 6040)...
start "CAYD Search Engine" cmd /k "npm start"

REM Czekanie 3 sekundy na start CAYD
timeout /t 3 /nobreak >nul

echo [2/3] Sprawdzanie czy CAYD działa...
curl -s http://localhost:6040/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] CAYD Search Engine moze nie byc gotowy (sprawdz okno terminala CAYD)
) else (
    echo [OK] CAYD Search Engine działa poprawnie!
)
echo.

REM Zmiana katalogu na ZENO_WEB_CORE_APP
cd /d "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP"

echo [3/3] Uruchamianie ZENO Browser (port 4378)...
start "ZENO Browser" cmd /k "npm run dev"

echo.
echo ================================================
echo  Uruchomiono oba serwisy:
echo  - CAYD Search Engine: http://localhost:6040
echo  - ZENO Browser: http://localhost:4378
echo ================================================
echo.
echo Aby zatrzymac serwisy, zamknij oba okna terminala.
echo.
pause
