#!/bin/bash
# Install project dependencies
# Works on both PC (development) and Jetson Nano (production)
# Usage: bash scripts/install.sh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "=== Installing Crowd Control System ==="
echo "Project: $PROJECT_DIR"

# Detect platform
IS_JETSON=false
if [ -f /etc/nv_tegra_release ]; then
    IS_JETSON=true
    echo "Platform: NVIDIA Jetson (detected)"
else
    echo "Platform: PC/Server"
fi

# Python backend
echo ""
echo "[1/4] Setting up Python environment..."
cd "$PROJECT_DIR"

if [ "$IS_JETSON" = true ]; then
    # Jetson Nano: must use Python 3.8 (code uses from __future__ import annotations)
    PYTHON_BIN=python3.8
    if ! command -v $PYTHON_BIN &> /dev/null; then
        echo "Installing Python 3.8..."
        sudo apt-get install -y python3.8 python3.8-venv python3.8-dev
    fi
    echo "Using $PYTHON_BIN for Jetson Nano"

    $PYTHON_BIN -m venv --system-site-packages venv
    source venv/bin/activate
    pip install --upgrade pip

    # On Jetson: use jetson-specific requirements (OpenCV/NumPy come from JetPack)
    # --system-site-packages gives access to JetPack's OpenCV, NumPy, PyTorch
    pip install -r backend/requirements-jetson.txt
    echo "Jetson deps installed (using system OpenCV + CUDA + PyTorch)"

    # Verify critical imports
    echo ""
    echo "Verifying Jetson packages..."
    python3 -c "import torch; print(f'  PyTorch {torch.__version__}, CUDA: {torch.cuda.is_available()}')" || echo "  WARNING: PyTorch not found — install from NVIDIA wheel (see requirements-jetson.txt)"
    python3 -c "import cv2; print(f'  OpenCV {cv2.__version__}')" || echo "  WARNING: OpenCV not found"
else
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r backend/requirements.txt
    echo "PC deps installed"
fi

# React dashboard
echo ""
echo "[2/4] Building dashboard..."
cd "$PROJECT_DIR/dashboard"
npm install
npm run build
echo "Dashboard built to dashboard/dist/"

# Create directories
echo ""
echo "[3/4] Setting up directories..."
mkdir -p "$PROJECT_DIR/backend/models"
mkdir -p "$PROJECT_DIR/backend/data"

# Download YOLOv8n model if missing
echo ""
echo "[4/4] Setting up model..."
if [ ! -f "$PROJECT_DIR/backend/models/yolov8n.pt" ]; then
    echo "Downloading YOLOv8n pretrained model..."
    cd "$PROJECT_DIR"
    source venv/bin/activate
    python3 -c "from ultralytics import YOLO; m = YOLO('yolov8n.pt'); print('Model downloaded')"
    cp yolov8n.pt backend/models/ 2>/dev/null || true
    echo "Model saved to backend/models/yolov8n.pt"
else
    echo "Model already exists at backend/models/yolov8n.pt"
fi

# On Jetson: suggest TensorRT export
if [ "$IS_JETSON" = true ]; then
    echo ""
    echo "=== Jetson Nano: TensorRT Export ==="
    echo "For maximum speed, export the model to TensorRT:"
    echo "  source venv/bin/activate"
    echo "  python3 training/export.py --weights backend/models/yolov8n.pt --format engine --half"
    echo "This converts YOLOv8n to TensorRT FP16 (~7x faster inference)"
    echo "The system will auto-detect and use the .engine file"
fi

echo ""
echo "=== Installation Complete ==="
echo "Start with: bash scripts/start.sh"
