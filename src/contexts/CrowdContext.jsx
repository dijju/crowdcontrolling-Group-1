import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

const CrowdContext = createContext();

export const CrowdProvider = ({ children }) => {
  const [areas, setAreas] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState(null);
  const [perf, setPerf] = useState(null);        // per-frame latency from backend
  const [perfStats, setPerfStats] = useState(null); // rolling stats from /api/perf
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const getWsUrl = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  };

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("[WS] Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "frame_update") {
          setAreas(data.areas);
          if (data.perf) setPerf(data.perf);
        } else if (data.type === "alert") {
          setAlerts((prev) => [data, ...prev].slice(0, 100));
          // Play alert sound
          playAlertBeep();
        }
      } catch (e) {
        console.error("[WS] Parse error:", e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("[WS] Disconnected, reconnecting in 2s...");
      reconnectTimer.current = setTimeout(connectWebSocket, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  // Fetch full perf stats periodically (every 3 seconds)
  const fetchPerfStats = useCallback(async () => {
    try {
      const res = await fetch("/api/perf");
      const data = await res.json();
      setPerfStats(data);
    } catch (e) {
      // perf endpoint may not be available yet
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    fetchConfig();
    const perfInterval = setInterval(fetchPerfStats, 3000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      clearInterval(perfInterval);
    };
  }, [connectWebSocket, fetchPerfStats]);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      console.error("Failed to fetch config:", e);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.config) setConfig(data.config);
      return data;
    } catch (e) {
      console.error("Failed to update config:", e);
      return null;
    }
  };

  return (
    <CrowdContext.Provider
      value={{ areas, alerts, connected, config, updateConfig, refreshConfig: fetchConfig, perf, perfStats }}
    >
      {children}
    </CrowdContext.Provider>
  );
};

export const useCrowd = () => {
  const context = useContext(CrowdContext);
  if (!context) throw new Error("useCrowd must be used within CrowdProvider");
  return context;
};

// Simple beep using Web Audio API
let audioCtx = null;
function playAlertBeep() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    // Audio may not be available
  }
}
