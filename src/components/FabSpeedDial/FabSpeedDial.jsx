import { useState, useRef, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import "./FabSpeedDial.css";

/**
 * FAB expandible (speed-dial). Al tocar el botón principal, despliega
 * hasta 4 acciones etiquetadas encima. Tocar fuera, una acción, o el
 * mismo FAB, lo cierra.
 *
 * actions: [{ key, label, icon, colorClass: 'fab--green' | 'fab--amber' | 'fab--blue', onClick }]
 */
const FabSpeedDial = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action) => {
    setIsOpen(false);
    action.onClick();
  };

  return (
    <div className="fab-container" ref={containerRef}>
      {isOpen && (
        <div className="fab-backdrop" onClick={() => setIsOpen(false)} role="presentation" />
      )}

      <div className={`fab-actions ${isOpen ? "fab-actions--open" : ""}`}>
        {actions.map((action, index) => (
          <button
            key={action.key}
            className={`fab-action ${action.colorClass || ""}`}
            style={{ transitionDelay: isOpen ? `${index * 30}ms` : "0ms" }}
            onClick={() => handleActionClick(action)}
            tabIndex={isOpen ? 0 : -1}
            aria-hidden={!isOpen}
          >
            <span className="fab-action__label">{action.label}</span>
            <span className="fab-action__icon">{action.icon}</span>
          </button>
        ))}
      </div>

      <button
        className={`fab-main ${isOpen ? "fab-main--open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Cerrar acciones" : "Abrir acciones de stock"}
        aria-expanded={isOpen}
      >
        <FaPlus size={20} />
      </button>
    </div>
  );
};

export default FabSpeedDial;
