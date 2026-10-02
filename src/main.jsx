import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { initBetterStack } from "./observability/betterStack.js";
import { initPwaInstall } from "./shared/pwa/usePwaInstall.js";
import './styles/globals.css';


initBetterStack();

// Escucha beforeinstallprompt / appinstalled desde el arranque, antes de montar React,
// para no perder el evento si el navegador lo dispara temprano.
initPwaInstall();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ThemeProvider va por fuera de todo: así cualquier componente (Sidebar, páginas, login) puede usar useTheme() */}
    <ThemeProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true, // Habilita el uso de React.startTransition para actualizaciones.
          v7_relativeSplatPath: true, // Cambia la resolución de rutas relativas en rutas splat (*).
        }}
      >
        <App />
      </BrowserRouter>
    </ThemeProvider>
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