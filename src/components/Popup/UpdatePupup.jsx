import PropTypes from "prop-types";
import "./Popups.css";

const UpdatePopUp = ({ isOpen, onClose, title, message, onAccept }) => {
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
        <div className="success-icon">
          <svg width="40" height="40" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#28a745" />
            <path
              fill="white"
              d="M9.86 18a1 1 0 01-.73-.32l-4.86-5.17a1 1 0 111.46-1.37l4.12 4.39 8.41-9.2a1 1 0 111.48 1.34l-9.14 10a1 1 0 01-.73.33h-.01z"
            />
          </svg>
        </div>
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>
        <div className="return-button-container">
          {/* Botón para crear un nuevo rol */}
          <button className="new-button" onClick={onAccept}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePopUp;
