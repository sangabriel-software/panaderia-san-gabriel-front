import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Share, PlusSquare } from 'lucide-react';
import './PWAInstallPrompt.css';

// Constantes de tiempo
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_DAYS_COUNT = 3; // Mostrar diariamente los primeros 3 días
const SUBSEQUENT_DELAY_DAYS = 5; // Mostrar cada 5 días después de los 3 iniciales

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detección básica
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isApple = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    setDeviceType(isMobile ? 'mobile' : 'desktop');
    setIsIOS(isApple);

    // 2. Verificar si ya está instalada (Standalone mode)
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;

    if (isInstalled) return;

    // 3. Lógica de control de frecuencia (UX Mejorada)
    const nextShowTimeStr = localStorage.getItem('pwa-prompt-next-show');
    const firstDismissTimeStr = localStorage.getItem('pwa-prompt-first-dismiss');
    const currentTime = Date.now();

    if (nextShowTimeStr) {
      const nextShowTime = parseInt(nextShowTimeStr, 10);
      
      if (nextShowTime > currentTime) {
        // Aún no ha pasado el tiempo de espera (1 o 5 días)
        return;
      }
    }

    // --- CONTINUAR: Mostrar el Prompt ---

    // ESTRATEGIA A: iOS (Apple)
    if (isApple) {
      setShowPrompt(true);
      return;
    }

    // ESTRATEGIA B: Android / Desktop (beforeinstallprompt)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar');
    }
    
    // Si se acepta o rechaza permanentemente, ocultamos el prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
    // Opcional: Eliminar la clave para no interferir en futuras instalaciones
    localStorage.removeItem('pwa-prompt-next-show');
    localStorage.removeItem('pwa-prompt-first-dismiss');
  };

  const handleDismiss = () => {
    setShowPrompt(false);

    const currentTime = Date.now();
    let delayMS = 0;

    // Guardar el primer momento de descarte si aún no existe
    let firstDismissTime = localStorage.getItem('pwa-prompt-first-dismiss');
    if (!firstDismissTime) {
      firstDismissTime = currentTime;
      localStorage.setItem('pwa-prompt-first-dismiss', firstDismissTime.toString());
    } else {
      firstDismissTime = parseInt(firstDismissTime, 10);
    }

    // Calcular cuántos días han pasado desde el primer descarte
    const elapsedDays = Math.floor((currentTime - firstDismissTime) / ONE_DAY_MS);

    if (elapsedDays < INITIAL_DAYS_COUNT) {
      // Estamos dentro de los primeros 3 días: volver a mostrar en 1 día
      delayMS = ONE_DAY_MS;
      console.log(`Descartado. Reaparecerá en 1 día (Día ${elapsedDays + 1} de ${INITIAL_DAYS_COUNT}).`);
    } else {
      // Ya pasaron los 3 días iniciales: volver a mostrar en 5 días
      delayMS = SUBSEQUENT_DELAY_DAYS * ONE_DAY_MS;
      console.log(`Descartado. Reaparecerá en ${SUBSEQUENT_DELAY_DAYS} días.`);
    }

    const nextShowTime = currentTime + delayMS;
    localStorage.setItem('pwa-prompt-next-show', nextShowTime.toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-overlay" onClick={(e) => {
        if(e.target === e.currentTarget) handleDismiss();
    }}>
      <div className="pwa-container">
        
        <button onClick={handleDismiss} className="pwa-close-btn" aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className="pwa-header">
          <div className="pwa-icon-wrapper">
            {deviceType === 'mobile' ? <Smartphone size={32} /> : <Monitor size={32} />}
          </div>
          
          <div className="pwa-content">
            <h2 className="pwa-title">Instalar App</h2>
            <p className="pwa-description">
              {deviceType === 'mobile' 
                ? 'Agrega la app a tu inicio para acceder más rápido.' 
                : 'Instala la aplicación en tu escritorio.'}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="ios-instructions">
            <div className="ios-step">
              <span>1. Toca</span>
              <Share size={16} className="text-blue-500 ios-icon" />
              <span className="font-semibold">Compartir</span>
            </div>
            <div className="ios-step">
              <span>2. Elige</span>
              <PlusSquare size={16} className="text-gray-600 ios-icon" />
              <span className="font-semibold">Agregar a inicio</span>
            </div>
          </div>
        ) : (
          <div className="pwa-actions">
            <button onClick={handleDismiss} className="pwa-btn pwa-btn-secondary">
              Cerrar
            </button>
            <button onClick={handleInstallClick} className="pwa-btn pwa-btn-primary">
              <Download size={18} />
              Instalar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}