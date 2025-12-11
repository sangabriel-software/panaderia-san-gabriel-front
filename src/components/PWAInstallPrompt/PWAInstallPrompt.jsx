import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Share, PlusSquare } from 'lucide-react';
import './PWAInstallPrompt.css';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detección básica
    const userAgent = navigator.userAgent;
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const iosCheck = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    setDeviceType(mobileCheck ? 'mobile' : 'desktop');
    setIsIOS(iosCheck);

    // 2. Verificar si ya está instalada (Standalone mode)
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;

    // 3. Verificar si el usuario lo descartó antes (opcional, si quieres que SIEMPRE salga, comenta estas lineas)
    const wasPromptDismissed = localStorage.getItem('pwa-prompt-dismissed');

    if (isInstalled || wasPromptDismissed) return;

    // --- LÓGICA ANDROID / DESKTOP (Chrome, Edge, etc) ---
    const handleBeforeInstallPrompt = (e) => {
      // Prevenir que el navegador muestre su banner nativo (feo) automáticamente
      e.preventDefault();
      // Guardar el evento para dispararlo cuando el usuario haga click
      setDeferredPrompt(e);
      // ¡MOSTRAR INMEDIATAMENTE! (Sin setTimeout)
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // --- LÓGICA IOS (iPhone/iPad) ---
    // iOS no dispara eventos, así que lo mostramos manualmente nada más cargar
    if (iosCheck) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt nativo del sistema
    deferredPrompt.prompt();
    
    // Esperar a ver qué decide el usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar');
    }
    
    // Limpiamos
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
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