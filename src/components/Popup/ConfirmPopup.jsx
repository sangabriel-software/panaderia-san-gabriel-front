import "./Popups.css";

const ConfirmPopUp = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  onCancel,
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
        <div className="error-icon">
          <svg width="40" height="40" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#dc3545" />
            <path
              fill="white"
              d="M13.41 12l2.83-2.83c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L12 10.59 9.17 7.76c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12l-2.83 2.83c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l2.83 2.83c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12z"
            />
          </svg>
        </div>
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>
        <div className="return-button-container">
          {/* Botón para cancelar la eliminacion */}
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          {/* Botón para confirmar la eliminacion*/}
          <button className="btn-confirm" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopUp;
