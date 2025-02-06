import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap'; // Importa los componentes de Bootstrap
import './Popups.css';

const ErrorPopup = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton className="header-modal position-relative">
        {/* Contenedor para el ícono y el título */}
        <div className="d-flex flex-column align-items-center w-100">
          {/* Ícono centrado */}
          <div className="error-icon mb-2">
            <svg width="40" height="40" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#dc3545" />
              <path
                fill="white"
                d="M13.41 12l2.83-2.83c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L12 10.59 9.17 7.76c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12l-2.83 2.83c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l2.83 2.83c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12z"
              />
            </svg>
          </div>
          {/* Título centrado */}
          <Modal.Title className="title-modal-error text-center w-100">
            {title}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body className="body-modal">
        <p className="popup-message text-center">{message}</p>
      </Modal.Body>
      <Modal.Footer className="footer-modal d-flex justify-content-center">
        <Button className="btn-modal-erro" variant="secondary" onClick={onClose}>
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