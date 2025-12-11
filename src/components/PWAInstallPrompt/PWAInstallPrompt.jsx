import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    // Detectar tipo de dispositivo
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'mobile' : 'desktop');

    console.log(isMobile)

    // Verificar si ya está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;

    // Verificar si el usuario ya rechazó la instalación
    const wasPromptDismissed = localStorage.getItem('pwa-prompt-dismissed');

    if (!isInstalled && !wasPromptDismissed) {
      // Esperar al evento beforeinstallprompt
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Para iOS (que no soporta beforeinstallprompt)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS && !isInstalled) {
        // Mostrar prompt después de 2 segundos en iOS
        setTimeout(() => setShowPrompt(true), 2000);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Si no hay deferredPrompt (ej: iOS), mostrar instrucciones
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slideUp">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          {deviceType === 'mobile' ? (
            <Smartphone className="text-blue-600 mb-4" size={64} />
          ) : (
            <Monitor className="text-blue-600 mb-4" size={64} />
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Instala nuestra App!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Accede más rápido y disfruta de una mejor experiencia instalando nuestra aplicación en tu {deviceType === 'mobile' ? 'dispositivo' : 'computadora'}.
          </p>

          {isIOS ? (
            // Instrucciones para iOS
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left w-full">
              <p className="text-sm text-gray-700 font-semibold mb-2">
                Para instalar en iOS:
              </p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Toca el botón <span className="font-semibold">Compartir</span> (cuadrado con flecha hacia arriba)</li>
                <li>Desplázate y selecciona <span className="font-semibold">"Agregar a pantalla de inicio"</span></li>
                <li>Toca <span className="font-semibold">"Agregar"</span></li>
              </ol>
            </div>
          ) : (
            // Botón de instalación para Android/Desktop
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors mb-4 shadow-lg hover:shadow-xl"
            >
              <Download size={20} />
              Instalar Ahora
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
          >
            Tal vez después
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}