"""
YOLOv8-nano training script for person detection.

Run on a machine with a GPU (not the Jetson Nano).

Usage:
    python train.py                          # Train with defaults
    python train.py --epochs 100 --batch 32  # Custom settings
    python train.py --resume                 # Resume interrupted training
"""

import argparse
from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8-nano for person detection")
    parser.add_argument("--model", default="yolov8n.pt", help="Base model (yolov8n.pt for nano)")
    parser.add_argument("--data", default="dataset.yaml", help="Dataset YAML config")
    parser.add_argument("--epochs", type=int, default=50, help="Training epochs")
    parser.add_argument("--imgsz", type=int, default=480, help="Input image size")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--device", default="0", help="GPU device (0, 1, cpu)")
    parser.add_argument("--resume", action="store_true", help="Resume from last checkpoint")
    parser.add_argument("--name", default="crowd_yolov8n", help="Run name")
    args = parser.parse_args()

    if args.resume:
        model = YOLO("runs/detect/crowd_yolov8n/weights/last.pt")
        model.train(resume=True)
    else:
        model = YOLO(args.model)
        model.train(
            data=args.data,
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            device=args.device,
            name=args.name,
            # Person-detection optimizations
            single_cls=True,      # Treat all classes as one (person)
            cos_lr=True,          # Cosine learning rate scheduler
            close_mosaic=10,      # Disable mosaic for last 10 epochs
            augment=True,
        )

    print("\nTraining complete!")
    print(f"Best weights: runs/detect/{args.name}/weights/best.pt")
    print("\nNext step: Run export.py to convert to ONNX/TensorRT")


if __name__ == "__main__":
    main()
