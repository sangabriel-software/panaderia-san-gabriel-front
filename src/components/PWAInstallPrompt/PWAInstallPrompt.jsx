import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Share, PlusSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './PWAInstallPrompt.css';

// Constantes de tiempo
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_DAYS_COUNT = 3; // Mostrar diariamente los primeros 3 días
const SUBSEQUENT_DELAY_DAYS = 5; // Mostrar cada 5 días después de los 3 iniciales

// Rutas públicas donde NO debe mostrarse el prompt
const PUBLIC_ROUTES = [
  '/surveys',
  '/login', 
  '/acceso-denegado'
];

// Prefijos de rutas (todas sus subrutas también son públicas)
const ROUTE_PREFIXES = ['/surveys'];

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');
  const [isIOS, setIsIOS] = useState(false);
  const location = useLocation();

  // Función para verificar si la ruta actual es pública
  const isPublicRoute = () => {
    const { pathname } = location;
    
    // Verificar rutas exactas
    if (PUBLIC_ROUTES.includes(pathname)) {
      return true;
    }
    
    // Verificar prefijos de rutas
    const isPrefixMatch = ROUTE_PREFIXES.some(prefix => 
      pathname.startsWith(prefix)
    );
    
    return isPrefixMatch;
  };

  // Función para verificar si ya está instalada como PWA
  const isPWAInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  };

  useEffect(() => {
    // 0. Verificación temprana: Si es ruta pública, no hacer nada
    if (isPublicRoute()) {
      setShowPrompt(false);
      return;
    }

    // 1. Detección básica
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isApple = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    setDeviceType(isMobile ? 'mobile' : 'desktop');
    setIsIOS(isApple);

    // 2. Verificar si ya está instalada (Standalone mode)
    if (isPWAInstalled()) {
      return;
    }

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
      // Verificar nuevamente que no sea ruta pública antes de mostrar
      if (!isPublicRoute()) {
        setShowPrompt(true);
      }
      return;
    }

    // ESTRATEGIA B: Android / Desktop (beforeinstallprompt)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Verificar que no sea ruta pública antes de mostrar
      if (!isPublicRoute()) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [location.pathname]); // Re-ejecutar cuando cambie la ruta

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Para iOS, redirigir a instrucciones
      if (isIOS) {
        return;
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Limpiar localStorage si se instala
        localStorage.removeItem('pwa-prompt-next-show');
        localStorage.removeItem('pwa-prompt-first-dismiss');
      }
    } catch (error) {
      console.error('Error durante la instalación:', error);
    }
    
    // Si se acepta o rechaza permanentemente, ocultamos el prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);

    // Solo guardar tiempo de descarte si NO es una ruta pública
    if (!isPublicRoute()) {
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
      } else {
        // Ya pasaron los 3 días iniciales: volver a mostrar en 5 días
        delayMS = SUBSEQUENT_DELAY_DAYS * ONE_DAY_MS;
      }

      const nextShowTime = currentTime + delayMS;
      localStorage.setItem('pwa-prompt-next-show', nextShowTime.toString());
    }
  };

  // No renderizar si es ruta pública
  if (!showPrompt || isPublicRoute()) {
    return null;
  }

  return (
    <div 
      className="pwa-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div className="pwa-container">
        
        <button 
          onClick={handleDismiss} 
          className="pwa-close-btn" 
          aria-label="Cerrar prompt de instalación"
        >
          <X size={20} />
        </button>

        <div className="pwa-header">
          <div className="pwa-icon-wrapper">
            {deviceType === 'mobile' ? (
              <Smartphone size={32} aria-hidden="true" />
            ) : (
              <Monitor size={32} aria-hidden="true" />
            )}
          </div>
          
          <div className="pwa-content">
            <h2 id="pwa-install-title" className="pwa-title">
              Instalar App
            </h2>
            <p className="pwa-description">
              {deviceType === 'mobile' 
                ? 'Agrega la app a tu inicio para acceder más rápido.' 
                : 'Instala la aplicación en tu escritorio para una mejor experiencia.'}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="ios-instructions">
            <p className="ios-instructions-title">
              Para instalar en iOS:
            </p>
            <div className="ios-step">
              <span>1. Toca el ícono</span>
              <Share size={16} className="text-blue-500 ios-icon" aria-hidden="true" />
              <span className="font-semibold">Compartir</span>
            </div>
            <div className="ios-step">
              <span>2. Selecciona</span>
              <PlusSquare size={16} className="text-gray-600 ios-icon" aria-hidden="true" />
              <span className="font-semibold">Agregar a inicio</span>
            </div>
            <div className="ios-step">
              <span>3. Confirma con</span>
              <span className="font-semibold text-green-600">Agregar</span>
            </div>
          </div>
        ) : (
          <div className="pwa-actions">
            <button 
              onClick={handleDismiss} 
              className="pwa-btn pwa-btn-secondary"
              aria-label="Cerrar y recordar más tarde"
            >
              Cerrar
            </button>
            <button 
              onClick={handleInstallClick} 
              className="pwa-btn pwa-btn-primary"
              aria-label="Instalar aplicación"
            >
              <Download size={18} aria-hidden="true" />
              Instalar
            </button>
          </div>
        )}

        <div className="pwa-footer">
          <p className="pwa-footer-text">
            La instalación es gratuita y mejora la experiencia de uso.
          </p>
        </div>
      </div>
    </div>
  );
}