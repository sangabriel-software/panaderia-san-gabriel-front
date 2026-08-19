import { useEffect, useRef, useState, useCallback } from "react";
import { BsX } from "react-icons/bs";
import "./BottomSheet.css";

/**
 * Bottom sheet genérico y reutilizable.
 *
 * Uso:
 * <BottomSheet isOpen={activeSheet === "ingresar"} onClose={closeSheet} title="Ingresar stock">
 *   <IngresarStockSheet ... />
 * </BottomSheet>
 *
 * - Se cierra con: tap en backdrop, botón X, tecla Escape, o arrastrando hacia abajo.
 * - Respeta prefers-reduced-motion.
 * - No desmonta children mientras se anima el cierre (evita que se pierda el estado del form a mitad de cierre).
 */
const BottomSheet = ({ isOpen, onClose, title, children, closeOnBackdrop = true }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const dragCurrentY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setDragOffset(0);
    } else if (shouldRender) {
      setIsClosing(true);
      const timeout = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 220);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!shouldRender) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldRender, onClose]);

  const handleTouchStart = useCallback((e) => {
    dragStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) {
      dragCurrentY.current = delta;
      setDragOffset(delta);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragCurrentY.current > 100) {
      onClose();
    }
    setDragOffset(0);
    dragStartY.current = null;
    dragCurrentY.current = 0;
  }, [onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`bsheet-backdrop ${isClosing ? "bsheet-backdrop--closing" : ""}`}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={sheetRef}
        className={`bsheet-panel ${isClosing ? "bsheet-panel--closing" : ""}`}
        style={{ transform: dragOffset ? `translateY(${dragOffset}px)` : undefined }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="bsheet-handle-wrap">
          <div className="bsheet-handle" />
        </div>
        <div className="bsheet-header">
          <h2 className="bsheet-title">{title}</h2>
          <button className="bsheet-close" onClick={onClose} aria-label="Cerrar">
            <BsX size={24} />
          </button>
        </div>
        <div className="bsheet-content">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
