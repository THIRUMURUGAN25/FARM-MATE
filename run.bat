@echo off
echo Starting FarmMate Application Setup...

REM Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python and try again.
    pause
    exit
)

echo.
echo Installing requirements...
pip install -r requirements.txt

echo.
echo Starting FastAPI Server...
echo The app will be available at http://127.0.0.1:8000
python main.py

pause
