@echo off
rem Przejdz do folderu, w ktorym znajduje sie ten skrypt
cd /d "%~dp0"

echo ========================================
echo  SYSTEM STARTUP: NARZEDZIA (TOOLS)
echo ========================================
echo.
echo  Uruchamianie narzedzi deweloperskich (walidacja kodu)...
echo.

cd ..\ZENO_WEB_CORE_APP

call npm run validate:working

echo.
echo Walidacja zakonczona. Nacisnij dowolny klawisz, aby zamknac to okno.
pause > nul