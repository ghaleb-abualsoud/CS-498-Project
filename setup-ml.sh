#!/bin/bash

# Health Risk Assessment - ML Integration Setup Script

echo "======================================"
echo "Health Risk Assessment ML Setup"
echo "======================================"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

echo "✓ Python 3 found"

# Install Python dependencies
echo ""
echo "Installing Python dependencies..."
cd ML
python3 -m pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install Python dependencies"
    exit 1
fi

echo "✓ Python dependencies installed"

# Check if model exists
if [ ! -f "model.pkl" ]; then
    echo ""
    echo "Model not found. Training model..."
    python3 train_model.py
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to train model"
        exit 1
    fi
    
    echo "✓ Model trained successfully"
else
    echo "✓ Model already exists"
fi

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the ML API (in terminal 1):"
echo "   cd ML && python3 api.py"
echo ""
echo "2. Start the frontend (in terminal 2):"
echo "   npm run dev"
echo ""
echo "The app will be available at http://localhost:5173"
echo "The ML API will be available at http://localhost:5000"
echo ""
