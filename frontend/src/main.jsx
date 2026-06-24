import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import {
  CycleProvider,
} from "./context/CycleContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <CycleProvider>
      <App />
    </CycleProvider>

  </React.StrictMode>
);