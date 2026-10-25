@echo off
echo ========================================================
echo   Starting Timeless AI - NLP Mini Project
echo ========================================================
echo [1/2] Starting Local NLP FastAPI Backend on port 8000...
if exist ".venv\Scripts\python.exe" (
    start "Timeless AI - Backend (NLP Server)" .venv\Scripts\python.exe -m uvicorn backend.server:app --host 127.0.0.1 --port 8000
) else (
    start "Timeless AI - Backend (NLP Server)" py -3.12 -m uvicorn backend.server:app --host 127.0.0.1 --port 8000
)

echo [2/2] Starting Frontend Vite Server on port 3000...
start "Timeless AI - Frontend (React/Vite)" npm start

echo.
echo ========================================================
echo  Timeless AI is running!
echo  Backend API Docs: http://127.0.0.1:8000/docs
echo  Frontend Web App: http://localhost:3000
echo ========================================================
