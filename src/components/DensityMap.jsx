import { useRef, useEffect } from "react";

function DensityMap({ grid, width = 300, height = 225 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!grid || !grid.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    if (rows === 0 || cols === 0) return;

    const cellW = width / cols;
    const cellH = height / rows;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val = grid[i][j];
        if (val < 0.05) continue;

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

        ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
        ctx.fillRect(j * cellW, i * cellH, cellW, cellH);
      }
    }
  }, [grid, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-gray-700"
      style={{ width, height }}
    />
  );
}

export default DensityMap;
