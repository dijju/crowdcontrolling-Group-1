import { useState, useEffect } from "react";
import { useCrowd } from "../contexts/CrowdContext";

function Settings({ onClose }) {
  const { config, updateConfig } = useCrowd();
  const [areas, setAreas] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (config?.areas) {
      setAreas(config.areas.map((a) => ({ ...a })));
    }
  }, [config]);

  const handleAreaChange = (index, field, value) => {
    setAreas((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const result = await updateConfig({ areas });
    setSaving(false);
    if (result?.status === "ok") {
      setMessage("Saved successfully");
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage("Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-bold text-lg">Area Configuration</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {areas.map((area, i) => (
            <div key={i} className="space-y-3 p-4 bg-gray-800/30 rounded-lg">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Area Name</label>
                <input
                  type="text"
                  value={area.name}
                  onChange={(e) => handleAreaChange(i, "name", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Camera Index</label>
                  <input
                    type="number"
                    value={area.camera_index}
                    onChange={(e) => handleAreaChange(i, "camera_index", parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Person Count</label>
                  <input
                    type="number"
                    value={area.max_count}
                    onChange={(e) => handleAreaChange(i, "max_count", parseInt(e.target.value) || 10)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Density Limit (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={area.density_limit}
                    onChange={(e) => handleAreaChange(i, "density_limit", parseFloat(e.target.value) || 0.5)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Chaos Threshold</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={area.chaos_threshold}
                    onChange={(e) => handleAreaChange(i, "chaos_threshold", parseFloat(e.target.value) || 2.0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            {message && (
              <span className={`text-sm ${message.includes("success") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
