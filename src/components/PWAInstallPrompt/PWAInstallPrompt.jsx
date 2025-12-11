import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Share, PlusSquare } from 'lucide-react';
import './PWAInstallPrompt.css'; // Importamos el CSS separado

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detección de dispositivo y entorno
    const userAgent = navigator.userAgent;
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const iosCheck = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    setDeviceType(mobileCheck ? 'mobile' : 'desktop');
    setIsIOS(iosCheck);

    // 2. Verificar si ya está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;

    // 3. Verificar si el usuario ya lo descartó previamente
    const wasPromptDismissed = localStorage.getItem('pwa-prompt-dismissed');

    if (isInstalled || wasPromptDismissed) return;

    // 4. Lógica para Android/Desktop (beforeinstallprompt)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Retrasar un poco la aparición para no ser agresivo al cargar la página
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Lógica para iOS (No soporta beforeinstallprompt, lo mostramos manualmente)
    if (iosCheck) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

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
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guardamos en localStorage para no volver a molestar en esta sesión
    // Opcional: Podrías guardar un timestamp para volver a mostrarlo en 7 días
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-overlay" onClick={(e) => {
        // Cerrar si se hace click fuera del contenido (en el fondo oscuro)
        if(e.target === e.currentTarget) handleDismiss();
    }}>
      <div className="pwa-container">
        
        {/* Botón Cerrar (X) */}
        <button onClick={handleDismiss} className="pwa-close-btn" aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className="pwa-header">
          {/* Icono Principal */}
          <div className="pwa-icon-wrapper">
            {deviceType === 'mobile' ? <Smartphone size={32} /> : <Monitor size={32} />}
          </div>
          
          {/* Textos */}
          <div className="pwa-content">
            <h2 className="pwa-title">Instalar Aplicación</h2>
            <p className="pwa-description">
              {deviceType === 'mobile' 
                ? 'Instala nuestra app para un acceso más rápido y mejor rendimiento.' 
                : 'Instala la aplicación en tu escritorio para una experiencia nativa.'}
            </p>
          </div>
        </div>

        {/* Contenido condicional: Instrucciones iOS vs Botón Android */}
        {isIOS ? (
          <div className="ios-instructions">
            <div className="ios-step">
              <span>1. Toca el botón</span>
              <Share size={16} className="text-blue-500 ios-icon" />
              <span className="font-semibold">Compartir</span>
            </div>
            <div className="ios-step">
              <span>2. Selecciona</span>
              <PlusSquare size={16} className="text-gray-600 ios-icon" />
              <span className="font-semibold">Agregar a inicio</span>
            </div>
          </div>
        ) : (
          <div className="pwa-actions">
            <button onClick={handleDismiss} className="pwa-btn pwa-btn-secondary">
              Ahora no
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