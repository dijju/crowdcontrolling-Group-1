#!/bin/bash
# Jetson Nano Environment Setup
# Run this ONCE after flashing JetPack 4.6+
# Usage: bash setup_jetson.sh

set -e

echo "=== Jetson Nano Crowd Control Setup ==="

# Set to maximum performance mode
echo "[1/5] Setting MAX power mode..."
sudo nvpmodel -m 0
sudo jetson_clocks
echo "Power mode: MAX"

# Update system
echo "[2/5] Updating system packages..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv nodejs npm curl

# Install system-level OpenCV (from JetPack, CUDA-accelerated)
echo "[3/5] Verifying OpenCV..."
python3 -c "import cv2; print(f'OpenCV {cv2.__version__} OK')" || {
    echo "OpenCV not found. Install from JetPack or:"
    echo "  sudo apt-get install python3-opencv"
    exit 1
}

# Verify CUDA and TensorRT
echo "[4/5] Verifying CUDA & TensorRT..."
python3 -c "
import subprocess
result = subprocess.run(['nvcc', '--version'], capture_output=True, text=True)
print(result.stdout.split('\\n')[3] if result.returncode == 0 else 'CUDA not found!')
"

dpkg -l | grep tensorrt | head -1 || echo "TensorRT not found — install via JetPack"

echo "[5/5] Setup complete!"
echo ""
echo "Next: Run install.sh to set up the project"
