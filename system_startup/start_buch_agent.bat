@echo off
rem Przejdz do folderu, w ktorym znajduje sie ten skrypt
cd /d "%~dp0"

echo ========================================
echo  SYSTEM STARTUP: LEKKIE AI DO TERMINALA
echo ========================================
echo.
echo  Dostepne modele (TYLKO terminal i komendy):
echo.
echo  API Models (główna praca):
echo  - Gemini (API key) - glówny model
echo  - OpenRouter (8 modeli, API key)
echo  - Claude (planowany, API key)
echo.
echo  Lokalnie (TYLKO terminal support, lekkie):
echo  - Gemma 2B (Google, port 11434) - max 4B
echo  - Phi Nano 0.5B (Microsoft, port 11435) - ultra lekki
echo.
echo  Modele lokalne są MAŁE - tylko komendy/terminal!
echo  Większa praca = API modele.
echo.
echo  Uruchamianie:
echo  podman compose up -d gemma-light   # 2B
echo  podman compose up -d phi-nano      # 0.5B
echo.
echo Nacisnij dowolny klawisz aby kontynuowac...
pause