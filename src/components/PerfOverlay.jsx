import { useCrowd } from "../contexts/CrowdContext";

function PerfOverlay() {
  const { perf, perfStats } = useCrowd();

  if (!perfStats) return null;

  const pipeline = perfStats.pipeline || {};
  const bottleneck = perfStats.bottleneck || {};
  const efficiency = perfStats.efficiency || {};

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Performance Monitor</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono">
              <span className="text-gray-400">FPS: </span>
              <span className={perfStats.fps >= 14 ? "text-green-400" : perfStats.fps >= 10 ? "text-yellow-400" : "text-red-400"}>
                {perfStats.fps}
              </span>
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              efficiency.can_sustain_target
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {efficiency.can_sustain_target ? "TARGET MET" : "BELOW TARGET"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Pipeline Breakdown Bar */}
        <div>
          <div className="text-xs text-gray-400 mb-2">Pipeline Breakdown (avg ms per frame)</div>
          <PipelineBar pipeline={pipeline} />
        </div>

        {/* Stage Details Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StageCard label="Detection" data={pipeline.detection} color="text-blue-400" isBottleneck={bottleneck.stage === "detect"} />
          <StageCard label="Tracking" data={pipeline.tracking} color="text-purple-400" isBottleneck={bottleneck.stage === "track"} />
          <StageCard label="Analysis" data={pipeline.analysis} color="text-cyan-400" isBottleneck={bottleneck.stage === "analyze"} />
          <StageCard label="Capture" data={pipeline.capture} color="text-green-400" isBottleneck={bottleneck.stage === "capture"} />
          <StageCard label="Encoding" data={pipeline.encoding} color="text-yellow-400" isBottleneck={bottleneck.stage === "encode"} />
          <StageCard label="Broadcast" data={pipeline.broadcast} color="text-orange-400" isBottleneck={bottleneck.stage === "broadcast"} />
        </div>

        {/* Efficiency + Bottleneck */}
        <div className="flex gap-3">
          <div className="flex-1 bg-gray-800/30 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Bottleneck</div>
            <div className="text-sm font-semibold text-red-400 capitalize">{bottleneck.stage}</div>
            <div className="text-xs text-gray-500">
              {bottleneck.avg_ms}ms ({bottleneck.percent_of_total}% of total)
            </div>
          </div>
          <div className="flex-1 bg-gray-800/30 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Efficiency</div>
            <div className="text-sm">
              <span className="text-blue-400 font-mono">{efficiency.inference_percent}%</span>
              <span className="text-gray-500 text-xs"> inference</span>
            </div>
            <div className="text-xs text-gray-500">
              {efficiency.overhead_percent}% overhead
            </div>
          </div>
          <div className="flex-1 bg-gray-800/30 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Total Pipeline</div>
            <div className="text-sm font-mono">
              {pipeline.total?.avg || 0}ms
            </div>
            <div className="text-xs text-gray-500">
              min {pipeline.total?.min || 0} / max {pipeline.total?.max || 0}
            </div>
          </div>
        </div>

        {/* Live Per-Frame */}
        {perf && (
          <div className="text-xs text-gray-500 font-mono flex gap-4 flex-wrap">
            <span>live: {perf.total_ms}ms</span>
            <span>det: {perf.detect_ms}ms</span>
            <span>trk: {perf.track_ms}ms</span>
            <span>enc: {perf.encode_ms}ms</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineBar({ pipeline }) {
  const stages = [
    { key: "capture", label: "Cap", color: "bg-green-500" },
    { key: "detection", label: "Det", color: "bg-blue-500" },
    { key: "tracking", label: "Trk", color: "bg-purple-500" },
    { key: "analysis", label: "Ana", color: "bg-cyan-500" },
    { key: "encoding", label: "Enc", color: "bg-yellow-500" },
    { key: "broadcast", label: "Brd", color: "bg-orange-500" },
  ];

  const total = pipeline.total?.avg || 1;

  return (
    <div>
      <div className="flex rounded-lg overflow-hidden h-5">
        {stages.map((s) => {
          const val = pipeline[s.key]?.avg || 0;
          const pct = (val / total) * 100;
          if (pct < 1) return null;
          return (
            <div
              key={s.key}
              className={`${s.color} flex items-center justify-center text-[9px] font-bold text-black`}
              style={{ width: `${pct}%` }}
              title={`${s.label}: ${val.toFixed(1)}ms (${pct.toFixed(0)}%)`}
            >
              {pct > 8 ? s.label : ""}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-1">
        {stages.map((s) => (
          <div key={s.key} className="flex items-center gap-1 text-[10px] text-gray-500">
            <div className={`w-2 h-2 rounded-sm ${s.color}`} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function StageCard({ label, data, color, isBottleneck }) {
  if (!data) return null;
  return (
    <div className={`bg-gray-800/30 rounded-lg p-2 ${isBottleneck ? "ring-1 ring-red-500/50" : ""}`}>
      <div className={`text-xs ${color} font-medium`}>
        {label}
        {isBottleneck && <span className="text-red-400 ml-1">*</span>}
      </div>
      <div className="text-sm font-mono mt-0.5">{data.avg}ms</div>
      <div className="text-[10px] text-gray-500">
        {data.min}–{data.max}ms
      </div>
    </div>
  );
}

export default PerfOverlay;
