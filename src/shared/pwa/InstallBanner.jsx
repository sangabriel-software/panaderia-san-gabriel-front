import { useEffect, useState } from "react";
import { FiDownload, FiShare, FiX, FiCheck } from "react-icons/fi";
import { usePwaInstall } from "./usePwaInstall";
import {
  INSTALLED_MESSAGE_MS,
  wasRecentlyDismissed,
  markDismissed,
} from "./pwaInstall.utils";

// Banner flotante arriba, visible en cualquier pantalla (login o app).
// Aparece solo si el navegador ofreció instalarla (Android/desktop) o
// si es iOS (donde no hay evento nativo, así que se muestran los pasos
// manuales). Se puede cerrar; reaparece pasados 14 días.
// Cuando la instalación termina, muestra una confirmación unos segundos.
export function InstallBanner() {
  const {
    isInstallable,
    isInstalled,
    isIos,
    justInstalled,
    promptInstall,
    dismissInstalledMessage,
  } = usePwaInstall();

  const [dismissed, setDismissed] = useState(() => wasRecentlyDismissed());

  // Oculta solo el mensaje de "instalada" después de unos segundos
  useEffect(() => {
    if (!justInstalled) return;
    const timer = setTimeout(dismissInstalledMessage, INSTALLED_MESSAGE_MS);
    return () => clearTimeout(timer);
  }, [justInstalled, dismissInstalledMessage]);

  const showIosHint = isIos && !isInstalled && !dismissed;
  const showNativePrompt = isInstallable && !isInstalled && !dismissed;

  if (!showIosHint && !showNativePrompt && !justInstalled) return null;

  const handleDismiss = () => {
    markDismissed();
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-3 pt-safe-top sm:px-4 sm:pt-3">
      <div
        role="status"
        className="mx-auto mt-3 flex max-w-lg items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-modal animate-slide-up sm:mt-0"
      >
        {justInstalled ? (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-600 text-white">
              <FiCheck size={20} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">¡San Gabriel App instalada!</p>
              <p className="mt-0.5 text-xs text-muted">
                Ya puedes abrirla desde tu pantalla de inicio.
              </p>
            </div>

            <button
              type="button"
              onClick={dismissInstalledMessage}
              aria-label="Cerrar aviso"
              className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <FiX size={16} />
            </button>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <FiDownload size={20} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Instala San Gabriel App</p>
              {showIosHint ? (
                <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted">
                  Toca <FiShare size={14} className="shrink-0" /> y luego "Agregar a inicio".
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-muted">
                  Acceso rápido desde tu pantalla de inicio, sin el navegador.
                </p>
              )}
            </div>

            {showNativePrompt && (
              <button
                type="button"
                onClick={promptInstall}
                className="btn-primary shrink-0 !px-3 !py-1.5 text-xs"
              >
                Instalar
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Cerrar aviso de instalación"
              className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <FiX size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default InstallBanner;