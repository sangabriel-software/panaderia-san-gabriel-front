import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Share, PlusSquare } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detección mejorada de dispositivos
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent);
    const iosCheck = (/ipad|iphone|ipod/.test(userAgent) && !window.MSStream) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad con iPadOS 13+
    
    setDeviceType(isMobile ? 'mobile' : 'desktop');
    setIsIOS(iosCheck);

    // 2. Verificar si ya está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;

    if (isInstalled) return;

    // 3. Sistema de recordatorios inteligente
    const dismissData = localStorage.getItem('pwa-prompt-data');
    let shouldShow = true;

    if (dismissData) {
      const { dismissedAt, dismissCount } = JSON.parse(dismissData);
      const daysSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      
      // Estrategia progresiva: cada vez espera más días
      const daysToWait = dismissCount === 1 ? 3 : dismissCount === 2 ? 7 : 30;
      
      // Si lo rechazó más de 3 veces, esperar 30 días
      if (dismissCount >= 3 && daysSinceDismiss < 30) {
        shouldShow = false;
      } else if (daysSinceDismiss < daysToWait) {
        shouldShow = false;
      }
    }

    if (!shouldShow) return;

    // 4. Evento para Android/Desktop
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostrar después de 3 segundos para no ser intrusivo
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Para iOS - mostrar después de 5 segundos
    if (iosCheck) {
      setTimeout(() => setShowPrompt(true), 5000);
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
      localStorage.removeItem('pwa-prompt-data'); // Limpiar datos
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Sistema de conteo para saber cuántas veces lo rechazó
    const dismissData = localStorage.getItem('pwa-prompt-data');
    let dismissCount = 1;
    
    if (dismissData) {
      const data = JSON.parse(dismissData);
      dismissCount = data.dismissCount + 1;
    }
    
    localStorage.setItem('pwa-prompt-data', JSON.stringify({
      dismissedAt: Date.now(),
      dismissCount: dismissCount
    }));
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:w-full p-6 relative animate-slideUp">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          {deviceType === 'mobile' ? (
            <Smartphone className="text-blue-600 mb-4" size={56} />
          ) : (
            <Monitor className="text-blue-600 mb-4" size={56} />
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Instala nuestra App!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Accede más rápido y disfruta de una mejor experiencia {deviceType === 'mobile' ? 'en tu dispositivo' : 'en tu computadora'}.
          </p>

          {isIOS ? (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left w-full">
              <p className="text-sm text-gray-700 font-semibold mb-3 flex items-center gap-2">
                <Share size={18} className="text-blue-600" />
                Pasos para instalar:
              </p>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 min-w-[20px]">1.</span>
                  <span>Toca el botón <strong>Compartir</strong> en la parte inferior de Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 min-w-[20px]">2.</span>
                  <span>Selecciona <strong>"Agregar a pantalla de inicio"</strong> <PlusSquare size={14} className="inline" /></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 min-w-[20px]">3.</span>
                  <span>Toca <strong>"Agregar"</strong> en la esquina superior derecha</span>
                </li>
              </ol>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl flex items-center gap-2 transition-all mb-4 shadow-lg hover:shadow-xl w-full justify-center text-lg"
            >
              <Download size={22} />
              Instalar Aplicación
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors py-2"
          >
            Recordármelo más tarde
          </button>
        </div>
      </div>
    </div>
  );
}