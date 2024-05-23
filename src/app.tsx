import React from "react";
import { createRoot } from "react-dom/client";
import { MainScreen } from "./screens";

declare global {
  interface Window {
    electronAPI?: any;
  }
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MainScreen />
  </React.StrictMode>,
);
