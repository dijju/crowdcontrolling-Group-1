import { useCrowd } from "../contexts/CrowdContext";

const STATUS_CONFIG = {
  NORMAL: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", label: "IN CONTROL" },
  WARNING: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", label: "CAUTION" },
  CRITICAL: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", label: "NOT IN CONTROL" },
  OFFLINE: { bg: "bg-gray-500/10", border: "border-gray-500/30", text: "text-gray-400", label: "OFFLINE" },
};

function StatusPanel() {
  const { areas } = useCrowd();

  if (areas.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {areas.map((area) => {
        const cfg = STATUS_CONFIG[area.status] || STATUS_CONFIG.OFFLINE;
        return (
          <div
            key={area.camera_index}
            className={`${cfg.bg} ${cfg.border} border rounded-xl p-4 transition-all ${
              area.status === "CRITICAL" ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{area.name}</h3>
              <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Persons</span>
                <span className="font-mono">{area.person_count}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Avg Velocity</span>
                <span className="font-mono">{area.avg_velocity?.toFixed(1) || "0.0"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Chaos Index</span>
                <span className="font-mono">{area.velocity_std?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Overall System Status */}
      <div className="border border-gray-700 rounded-xl p-4 bg-gray-800/30">
        <h3 className="font-semibold text-sm mb-2">System Overview</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Active Cameras</span>
            <span className="font-mono">{areas.filter((a) => a.status !== "OFFLINE").length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Persons</span>
            <span className="font-mono">
              {areas.reduce((sum, a) => sum + (a.person_count || 0), 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Critical Areas</span>
            <span className="font-mono text-red-400">
              {areas.filter((a) => a.status === "CRITICAL").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusPanel;
