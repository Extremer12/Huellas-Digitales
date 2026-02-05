import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Register Service Worker for PWA & Push Notifications
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => console.log("Service Worker registrado:", reg))
            .catch((err) => console.error("Error al registrar SW:", err));
    });
}

createRoot(document.getElementById("root")!).render(<App />);
