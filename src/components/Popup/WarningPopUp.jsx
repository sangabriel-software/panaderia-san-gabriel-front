import PropTypes from "prop-types";
import "./Popups.css";

const WarningPopup = ({
  isOpen,
  onClose,
  title,
  message,
  onViewRoles,
  onNewRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        
        <button className="close-button" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
        <div className="warning-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v4M12 16h0M21 19l-9-16-9 16h18z" />
          </svg>
        </div>
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>
        <div className="return-button-container">
          {/* Botón para redirigir a "Ver Roles" */}
          <button className="rol-button" onClick={onViewRoles}>
            Ver Roles
          </button>
          {/* Botón para crear un nuevo rol */}
          <button className="new-button" onClick={onNewRole}>
            Nuevo Rol
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningPopup;
