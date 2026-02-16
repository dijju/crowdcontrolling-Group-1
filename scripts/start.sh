#!/bin/bash
# Start the Crowd Control System
# Usage: bash start.sh

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi

echo "=== Crowd Control Monitor ==="
echo "Dashboard: http://$(hostname -I | awk '{print $1}'):8000"
echo "API:       http://$(hostname -I | awk '{print $1}'):8000/api/health"
echo "Press Ctrl+C to stop"
echo ""

# Run the server
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
