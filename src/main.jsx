import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CrowdProvider } from "./contexts/CrowdContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CrowdProvider>
      <App />
    </CrowdProvider>
  </React.StrictMode>
);
