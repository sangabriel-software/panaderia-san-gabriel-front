import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Popups.css";

const ErrorPopup = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header className="header-modal position-relative">
        {/* Contenedor centrado para el ícono y el título */}
        <div className="w-100 text-center">
          <div className="error-icon">
            <svg width="40" height="40" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#dc3545" />
              <path
                fill="white"
                d="M13.41 12l2.83-2.83c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L12 10.59 9.17 7.76c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12l-2.83 2.83c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l2.83 2.83c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12z"
              />
            </svg>
          </div>
          <Modal.Title className="popup-title">{title}</Modal.Title>
        </div>
        {/* Botón de cerrar posicionado en la esquina superior derecha */}
        <Button
          variant="close"
          onClick={onClose}
          aria-label="Close"
          className="position-absolute top-0 end-0 m-2"
        />
      </Modal.Header>
      <Modal.Body className="body-modal text-center">
        <p className="popup-message">{message}</p>
      </Modal.Body>
      <Modal.Footer className="footer-modal d-flex justify-content-center">
        <Button className="btn btn-modal-erro " onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ErrorPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default ErrorPopup;
