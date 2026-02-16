"""
Export trained YOLOv8-nano model for deployment.

Exports:
  1. PyTorch → ONNX (portable, works everywhere)
  2. ONNX → TensorRT (run on Jetson Nano for max speed)

Usage:
    python export.py --weights runs/detect/crowd_yolov8n/weights/best.pt
    python export.py --weights best.pt --format engine  # Direct TensorRT (must run on Jetson)
"""

import argparse
import shutil
from pathlib import Path
from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser(description="Export YOLOv8-nano model")
    parser.add_argument("--weights", required=True, help="Path to trained .pt weights")
    parser.add_argument("--imgsz", type=int, default=480, help="Input image size")
    parser.add_argument("--format", default="onnx", choices=["onnx", "engine"], help="Export format")
    parser.add_argument("--half", action="store_true", help="FP16 export (recommended for Jetson)")
    parser.add_argument("--output-dir", default="../backend/models", help="Copy exported model here")
    args = parser.parse_args()

    model = YOLO(args.weights)

    print(f"\nExporting to {args.format.upper()}...")
    export_path = model.export(
        format=args.format,
        imgsz=args.imgsz,
        simplify=True if args.format == "onnx" else False,
        half=args.half,
    )

    print(f"Exported to: {export_path}")

    # Copy to backend models directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    src = Path(export_path)
    dst = output_dir / src.name
    shutil.copy2(src, dst)
    print(f"Copied to: {dst}")

    if args.format == "onnx":
        print("\n--- Next Steps ---")
        print("To convert ONNX to TensorRT on the Jetson Nano:")
        print(f"  trtexec --onnx={src.name} --saveEngine=yolov8n_crowd.engine --fp16")
        print(f"  cp yolov8n_crowd.engine {output_dir}/")
        print("\nThen update backend/data/config.json:")
        print('  "model_path": "models/yolov8n_crowd.engine"')


if __name__ == "__main__":
    main()
