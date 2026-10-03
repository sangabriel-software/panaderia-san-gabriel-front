// src/pwa/useAppUpdate.js
import { useCallback, useEffect, useState } from "react";
import {
  CHECK_INTERVAL_MS,
  fetchLatestVersion,
  isNewVersionAvailable,
  applyUpdate,
} from "./appUpdate.utils";

export function useAppUpdate() {
  const [latestVersion, setLatestVersion] = useState(null);
  const [dismissedVersion, setDismissedVersion] = useState(null);
  const [updating, setUpdating] = useState(false);

  const checkForUpdate = useCallback(async () => {
    const latest = await fetchLatestVersion();
    if (isNewVersionAvailable(latest)) setLatestVersion(latest);
  }, []);

  useEffect(() => {
    // En desarrollo no existe version.json
    if (import.meta.env.DEV) return;

    checkForUpdate();

    const interval = setInterval(checkForUpdate, CHECK_INTERVAL_MS);

    // Revisa también cuando el usuario vuelve a la app (pestaña o PWA en segundo plano)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", checkForUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", checkForUpdate);
    };
  }, [checkForUpdate]);

  const updateApp = useCallback(async () => {
    setUpdating(true);
    await applyUpdate();
  }, []);

  // "Después" oculta el aviso solo para esa versión; si sale otra más nueva, vuelve a aparecer
  const dismissUpdate = useCallback(() => {
    setDismissedVersion(latestVersion);
  }, [latestVersion]);

  const updateAvailable = !!latestVersion && latestVersion !== dismissedVersion;

  return { updateAvailable, updating, updateApp, dismissUpdate };
}