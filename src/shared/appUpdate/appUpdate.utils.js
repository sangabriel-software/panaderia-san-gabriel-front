/* global __APP_VERSION__ */
// src/utils/appUpdate/appUpdate.utils.js

// Versión con la que se compiló ESTA copia de la app (la inyecta vite.version.plugin.js)
export const CURRENT_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

export const VERSION_URL = "/version.json";
export const CHECK_INTERVAL_MS = 5 * 60 * 1000; // revisa cada 5 minutos
export const SW_ACTIVATION_TIMEOUT_MS = 8000;

// ── Migración de localStorage ──────────────────────────────────────────────
// Sube este número SOLO cuando quieras que todos los usuarios pierdan los datos viejos
// guardados en localStorage (por ejemplo, al pasar de la app vieja a esta).
// Se conservan únicamente las claves de KEYS_TO_KEEP.
export const STORAGE_VERSION = "1";
export const STORAGE_VERSION_KEY = "app-storage-version";

// IMPORTANTE: revisa en DevTools > Application > Local Storage qué claves usa tu app
// y agrega aquí las que NO deben borrarse (sesión, tema, etc.).
export const KEYS_TO_KEEP = [
  "token",
  "theme",
  "pwa-install-dismissed-at",
  STORAGE_VERSION_KEY,
];

// Consulta la última versión publicada, sin usar caché
export const fetchLatestVersion = async () => {
  try {
    const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.version ?? null;
  } catch (error) {
    return null;
  }
};

export const isNewVersionAvailable = (latestVersion) =>
  !!latestVersion && CURRENT_VERSION !== "dev" && latestVersion !== CURRENT_VERSION;

// Borra las cachés del sitio (fuentes, datos guardados por versiones viejas, etc.).
// Por defecto CONSERVA la caché "precache" de Workbox: esa es la que usa el service worker
// activo para servir la app (y para que funcione sin conexión). Si se borrara, el service worker
// quedaría sin archivos en caché hasta su próxima actualización. Workbox ya reemplaza el precache
// viejo por el nuevo por sí solo (cleanupOutdatedCaches).
export const clearCacheStorage = async ({ keepPrecache = true } = {}) => {
  try {
    if (!("caches" in window)) return;
    const keys = await caches.keys();
    const keysToDelete = keepPrecache
      ? keys.filter((key) => !key.includes("precache"))
      : keys;
    await Promise.all(keysToDelete.map((key) => caches.delete(key)));
  } catch (error) {
    // Si falla, el reload igual trae lo último del servidor
  }
};

export const clearLocalStorageExcept = (keysToKeep = KEYS_TO_KEEP) => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (!keysToKeep.includes(key)) localStorage.removeItem(key);
    });
    sessionStorage.clear();
  } catch (error) {
    // Sin acceso a storage (modo privado, etc.)
  }
};

// Se ejecuta UNA vez al arrancar (main.jsx), antes de montar React.
// Si el usuario viene de la app vieja (o de una STORAGE_VERSION anterior),
// limpia caché y localStorage una sola vez y marca la versión.
export const runStorageMigration = () => {
  try {
    if (localStorage.getItem(STORAGE_VERSION_KEY) === STORAGE_VERSION) return;

    clearLocalStorageExcept();
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
    clearCacheStorage();
  } catch (error) {
    // No bloquea el arranque de la app
  }
};

// Espera a que el service worker nuevo termine de instalarse y se active
// (con autoUpdate se activa solo; el timeout evita quedarse esperando).
const waitForServiceWorkerActivation = (registration) =>
  new Promise((resolve) => {
    const worker = registration.installing || registration.waiting;
    if (!worker || worker.state === "activated") return resolve();

    const timer = setTimeout(resolve, SW_ACTIVATION_TIMEOUT_MS);

    worker.addEventListener("statechange", () => {
      if (worker.state === "activated") {
        clearTimeout(timer);
        resolve();
      }
    });

    // Por si quedó esperando: se le pide activarse
    worker.postMessage({ type: "SKIP_WAITING" });
  });

// Aplica la actualización: busca el service worker nuevo, espera a que se active,
// limpia las cachés que no son del precache y recarga.
// A propósito NO se desregistra el service worker (si usas notificaciones push, se perderían).
export const applyUpdate = async () => {
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        await waitForServiceWorkerActivation(registration);
      }
    }
    await clearCacheStorage();
  } finally {
    window.location.reload();
  }
};