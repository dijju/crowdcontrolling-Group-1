import { useRef, useEffect } from "react";

const STATUS_COLORS = {
  NORMAL: "#22c55e",
  WARNING: "#eab308",
  CRITICAL: "#ef4444",
  OFFLINE: "#6b7280",
};

function CameraFeed({ area }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());

  useEffect(() => {
    if (!area.frame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw camera frame
      ctx.drawImage(img, 0, 0);

      // Draw bounding boxes
      if (area.detections) {
        area.detections.forEach((det) => {
          const [x1, y1, x2, y2] = det.bbox;
          const color = STATUS_COLORS[area.status] || "#22c55e";

          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

          // Track ID label
          if (det.track_id >= 0) {
            ctx.fillStyle = color;
            ctx.font = "12px monospace";
            ctx.fillText(`#${det.track_id}`, x1, y1 - 4);
          }
        });
      }

      // Draw density heatmap overlay if available
      if (area.density_grid && area.density_grid.length > 0) {
        drawDensityOverlay(ctx, area.density_grid, canvas.width, canvas.height);
      }
    };

    img.src = `data:image/jpeg;base64,${area.frame}`;
  }, [area]);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[area.status] }}
          />
          <span className="font-medium text-sm">{area.name}</span>
          <span className="text-xs text-gray-400">CAM {area.camera_index}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400">
            Count: <span className="text-white font-mono">{area.person_count}</span>
          </span>
          <span
            className="px-2 py-0.5 rounded font-semibold"
            style={{
              backgroundColor: STATUS_COLORS[area.status] + "20",
              color: STATUS_COLORS[area.status],
            }}
          >
            {area.status}
          </span>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative aspect-video bg-black">
        {area.frame ? (
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            No Signal
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 px-4 py-2 text-xs text-gray-400 bg-gray-800/30">
        <span>
          Velocity: <span className="text-white font-mono">{area.avg_velocity?.toFixed(1)}</span>
        </span>
        <span>
          Chaos: <span className="text-white font-mono">{area.velocity_std?.toFixed(2)}</span>
        </span>
      </div>
    </div>
  );
}

function drawDensityOverlay(ctx, grid, width, height) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  if (rows === 0 || cols === 0) return;

  const cellW = width / cols;
  const cellH = height / rows;

  ctx.globalAlpha = 0.25;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const val = grid[i][j];
      if (val < 0.1) continue;

      // Blue → Yellow → Red gradient
      let r, g, b;
      if (val < 0.5) {
        const t = val / 0.5;
        r = Math.round(t * 255);
        g = Math.round(t * 255);
        b = Math.round((1 - t) * 255);
      } else {
        const t = (val - 0.5) / 0.5;
        r = 255;
        g = Math.round((1 - t) * 255);
        b = 0;
      }

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(j * cellW, i * cellH, cellW, cellH);
    }
  }
  ctx.globalAlpha = 1.0;
}

export default CameraFeed;
