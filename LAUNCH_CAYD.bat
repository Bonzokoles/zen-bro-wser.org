@echo off
echo Starting CAYD Browser...
cd CAYD_SEARCH_ENG
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
call npm start
pause
