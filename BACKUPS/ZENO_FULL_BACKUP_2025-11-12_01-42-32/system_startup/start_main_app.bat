@echo off
rem Przejdz do folderu, w ktorym znajduje sie ten skrypt
cd /d "%~dp0"

echo ========================================
echo  SYSTEM STARTUP: PODSTAWY (BASICS)
echo ========================================
echo.
echo  Uruchamianie glownej aplikacji ZENO Web Core...
echo  Aplikacja bedzie dostepna pod adresem: http://localhost:4378
echo.

cd ..\ZENO_WEB_CORE_APP

call npm run dev -- --port 4378

echo.
echo Jesli widzisz te wiadomosc, serwer nie uruchomil sie poprawnie.
pause