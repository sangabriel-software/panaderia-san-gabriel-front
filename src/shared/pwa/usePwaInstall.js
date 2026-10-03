// src/pwa/usePwaInstall.js
import { useSyncExternalStore } from "react";
import { detectStandalone, detectIos } from "./pwaInstall.utils";

// ── Store mínimo (reemplaza a zustand, sin instalar nada) ──────────────────
let state = {
  deferredPrompt: null,
  // true solo cuando el navegador (Chrome/Edge/Android) ofreció el
  // evento nativo de instalación y todavía no se usó.
  isInstallable: false,
  isInstalled: detectStandalone(),
  // Safari/iOS no dispara beforeinstallprompt: ahí se muestran
  // instrucciones manuales ("Compartir" > "Agregar a inicio").
  isIos: detectIos(),
  // true justo después de instalar, para mostrar el mensaje de confirmación
  justInstalled: false,
};

const listeners = new Set();

const setState = (partial) => {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

// ── Acciones ───────────────────────────────────────────────────────────────
const setDeferredPrompt = (event) =>
  setState({ deferredPrompt: event, isInstallable: !!event });

const setInstalled = (installed) =>
  setState({
    isInstalled: installed,
    isInstallable: false,
    deferredPrompt: null,
    justInstalled: installed,
  });

export const dismissInstalledMessage = () => setState({ justInstalled: false });

export const promptInstall = async () => {
  const { deferredPrompt } = state;
  if (!deferredPrompt) return;

  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {
    setInstalled(true);
  } else {
    // El navegador solo permite usar el evento una vez
    setState({ deferredPrompt: null, isInstallable: false });
  }
};

// ── Listeners globales ─────────────────────────────────────────────────────
// Se llama UNA vez en main.jsx, antes de montar React. Así el evento
// beforeinstallprompt no se pierde si el navegador lo dispara antes de que
// App termine de montar.
let initialized = false;

export const initPwaInstall = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    // Evita el mini-banner genérico del navegador; el control queda en InstallBanner
    event.preventDefault();
    setDeferredPrompt(event);
  });

  window.addEventListener("appinstalled", () => {
    setInstalled(true);
  });
};

// ── Hook ───────────────────────────────────────────────────────────────────
export function usePwaInstall() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...snapshot, promptInstall, dismissInstalledMessage };
}