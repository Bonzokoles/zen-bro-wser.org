@echo off
rem Przejdz do folderu, w ktorym znajduje sie ten skrypt
cd /d "%~dp0"

echo ========================================
echo  SYSTEM STARTUP: DODATKI (ADD-ONS)
echo ========================================
echo.
echo  Uruchamianie systemu agentow BIELIK...
echo.

cd ..\BIELIK_THE_whitie

call npm run dev

echo.
echo Jesli widzisz te wiadomosc, serwer nie uruchomil sie poprawnie.
pause