@echo off
echo ========================================
echo Expense Tracker - Quick Start Guide
echo ========================================
echo.

echo Step 1: Checking Local PostgreSQL Database...
echo.
echo Please ensure PostgreSQL is installed and running locally.
echo Database: expense_tracker
echo Connection: postgresql://postgres:postgres@localhost:5432/expense_tracker
echo.
echo If you haven't created the database yet, run:
echo CREATE DATABASE expense_tracker;
echo.
echo (Press any key once PostgreSQL is ready)
pause
echo PostgreSQL should be ready!
echo.

echo Step 2: Setting up Backend...
echo.
cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env and add your SMTP credentials!
    echo - Open backend\.env in a text editor
    echo - Add your email settings (SMTP_USER, SMTP_PASSWORD, etc.)
    echo - Set SMTP_ENABLED=true to enable email notifications
    echo.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Configure SMTP (optional but recommended):
echo    - Edit backend\.env file
echo    - Add your email credentials
echo.
echo 2. Start the backend:
echo    cd backend
echo    venv\Scripts\activate
echo    uvicorn main:app --reload
echo.
echo 3. Start the frontend (in a new terminal):
echo    cd frontend
echo    python -m http.server 8080
echo.
echo 4. Open your browser:
echo    http://localhost:8080/login.html
echo.
echo ========================================
pause
