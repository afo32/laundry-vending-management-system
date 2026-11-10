import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import { Capacitor } from "@capacitor/core";
import { registerSW } from "virtual:pwa-register";

if (Capacitor.isNativePlatform()) {
  // Dentro de la app: eliminar cualquier service worker viejo
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()));
  }
} else {
  // En la web: PWA normal
  registerSW({ immediate: true });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
