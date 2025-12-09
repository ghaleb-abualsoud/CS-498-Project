#!/bin/bash

# Start script for Health Risk Assessment with ML

echo "🚀 Starting Health Risk Assessment with ML"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Check if model exists
if [ ! -f "ML/model.pkl" ]; then
    echo "⚠️  Model not found. Training model first..."
    cd ML
    python3 train_model.py
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to train model"
        exit 1
    fi
    cd ..
    echo ""
fi

# Start ML API
echo "🔧 Starting ML API..."
cd ML
python3 api.py &
API_PID=$!
cd ..

# Wait for API to start
echo "⏳ Waiting for ML API to be ready..."
sleep 3

# Check if API is running
if ! curl -s http://localhost:5000/health > /dev/null; then
    echo "❌ Error: ML API failed to start"
    kill $API_PID 2>/dev/null
    exit 1
fi

echo "✅ ML API is running on http://localhost:5000"
echo ""

# Start frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✨ Application is starting!"
echo ""
echo "   Frontend: http://localhost:5173"
echo "   ML API:   http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $API_PID $FRONTEND_PID
