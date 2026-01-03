import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true, // Habilita el uso de React.startTransition para actualizaciones.
        v7_relativeSplatPath: true, // Cambia la resolución de rutas relativas en rutas splat (*).
      }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Registro del Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        
        // Actualización automática del service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
            }
          });
        });
      })
      .catch((error) => {
       
      });
  });
}