@echo off
echo ========================================
echo    ZENO Web Browser - Starting...
echo ========================================
echo.

cd ZENO_WEB_CORE_APP

echo [1/2] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies OK
)

echo.
echo [2/2] Starting development server...
echo.
echo Application will be available at:
echo    http://localhost:4378
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev -- --port 4378
