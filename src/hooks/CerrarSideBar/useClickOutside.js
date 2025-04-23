import { useEffect } from 'react';

/**
 * Custom Hook que detecta clics fuera de un elemento y ejecuta un callback.
 * @param {React.RefObject} ref - Referencia al elemento que no debe cerrarse al hacer clic en él.
 * @param {boolean} isActive - Indica si el hook debe estar activo (ej: sidebar abierto en móvil).
 * @param {function} callback - Función a ejecutar al hacer clic fuera (ej: cerrar sidebar).
 */
export const useClickOutside = (ref, isActive, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el clic fue fuera del elemento referenciado y el hook está activo
      if (isActive && ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive, ref, callback]); // Dependencias del efecto
};