#!/bin/bash

echo "Starting ML API on port 5001..."

cd "$(dirname "$0")"

# Kill any existing instances
pkill -f "python.*api.py" 2>/dev/null
sleep 1

# Start the API
python3 api.py
