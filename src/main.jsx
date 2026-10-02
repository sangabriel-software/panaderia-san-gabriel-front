import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { initBetterStack } from "./observability/betterStack.js";
import { initPwaInstall } from "./shared/pwa/usePwaInstall.js";
import { runStorageMigration } from "./shared/appUpdate/appUpdate.utils.js";
import './styles/globals.css';

// Limpieza única de caché y localStorage para usuarios que vienen de la app vieja.
// Va PRIMERO, antes de montar React, para que ThemeProvider y el resto lean datos ya limpios.
runStorageMigration();

initBetterStack();

// Escucha beforeinstallprompt / appinstalled desde el arranque, antes de montar React,
// para no perder el evento si el navegador lo dispara temprano.
initPwaInstall();

// Si tras un deploy una pantalla intenta cargar un archivo (chunk) de la versión anterior
// que ya no existe, Vite dispara este evento: se recarga UNA vez para traer la versión nueva.
window.addEventListener("vite:preloadError", () => {
  const RELOAD_FLAG = "chunk-reload-at";
  const lastReload = Number(sessionStorage.getItem(RELOAD_FLAG) || 0);

  // Evita un bucle de recargas si el error persiste (máximo una vez por minuto)
  if (Date.now() - lastReload > 60 * 1000) {
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
    window.location.reload();
  }
});

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
// (vite.config.js tiene injectRegister: false, así que este es el único registro)
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