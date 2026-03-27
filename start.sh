#!/bin/bash
echo "💳 Starting DebitMeKe? Protocol..."

# Start Backend
echo "Starting FastAPI Backend Engine in background..."
cd backend
if [ -d "venv" ]; then
  source venv/bin/activate
fi
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Vite Frontend in background..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo " "
echo "✅ Both servers are online!"
echo "🧠 The Brain (API): http://localhost:8000"
echo "🎨 The Vault (App): http://localhost:5173"
echo " "
echo "Press Ctrl+C to terminate both."

trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT
wait
