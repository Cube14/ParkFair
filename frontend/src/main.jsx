import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { Toaster } from "react-hot-toast";

import { CycleProvider } from "./context/CycleContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <ThemeProvider>

      <CycleProvider>

        <App />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,

            style: {
              background: "#18181b",
              color: "#ffffff",
              border: "1px solid #3f3f46",
            },
          }}
        />

      </CycleProvider>

    </ThemeProvider>

  </React.StrictMode>
);