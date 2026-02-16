import { useCrowd } from "../contexts/CrowdContext";

function AlertLog() {
  const { alerts } = useCrowd();

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50">
        <h2 className="font-semibold text-sm">Alert Log</h2>
        <span className="text-xs text-gray-400">{alerts.length} alerts</span>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-600 text-sm">
            No alerts yet. System monitoring...
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-800/30">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-red-400">{alert.area}</span>
                    <span className="text-xs text-gray-500">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{alert.reason}</p>
                  <span className="text-xs text-gray-500">
                    {alert.person_count} persons detected
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default AlertLog;
