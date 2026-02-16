import { useState } from "react";
import { useCrowd } from "./contexts/CrowdContext";
import CameraFeed from "./components/CameraFeed";
import StatusPanel from "./components/StatusPanel";
import AlertLog from "./components/AlertLog";
import PerfOverlay from "./components/PerfOverlay";
import Settings from "./components/Settings";

function App() {
  const { areas, connected } = useCrowd();
  const [showSettings, setShowSettings] = useState(false);
  const [showPerf, setShowPerf] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">Crowd Control Monitor</h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPerf((v) => !v)}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              showPerf ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Perf
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Status Cards */}
        <StatusPanel />

        {/* Camera Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {areas.map((area) => (
            <CameraFeed key={area.camera_index} area={area} />
          ))}
          {areas.length === 0 && (
            <div className="col-span-2 text-center py-20 text-gray-500">
              {connected ? "Waiting for camera data..." : "Connecting to server..."}
            </div>
          )}
        </div>

        {/* Performance Monitor */}
        {showPerf && <PerfOverlay />}

        {/* Alert Log */}
        <AlertLog />
      </main>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
