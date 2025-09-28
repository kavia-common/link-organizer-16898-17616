import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";

const rootEl = document.getElementById("root");
if (!rootEl) {
  const el = document.createElement("div");
  el.innerText = "App failed to mount: #root element not found.";
  el.style.color = "white";
  el.style.background = "black";
  el.style.padding = "1rem";
  document.body.appendChild(el);
} else {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
