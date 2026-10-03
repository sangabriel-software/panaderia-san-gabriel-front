// src/utils/pwa/pwaInstall.utils.js

export const DISMISS_KEY = "pwa-install-dismissed-at";
export const DISMISS_DAYS = 14;
export const INSTALLED_MESSAGE_MS = 4000;

// true si la app ya se está ejecutando como PWA instalada
export const detectStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

// Safari/iOS no dispara beforeinstallprompt: ahí se muestran pasos manuales.
// iPadOS 13+ se identifica como "Macintosh", por eso se revisa también el multitouch.
export const detectIos = () => {
  if (typeof navigator === "undefined") return false;
  const isIosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isIpadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isIosDevice || isIpadOs;
};

export const wasRecentlyDismissed = () => {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (Number.isNaN(dismissedAt)) return false;
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSince < DISMISS_DAYS;
  } catch (error) {
    return false;
  }
};

export const markDismissed = () => {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch (error) {
    // Sin acceso a localStorage: el aviso solo se oculta durante esta sesión
  }
};