import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Popups.css";

const WarningPopup = ({
  isOpen,
  onClose,
  title,
  message,
  onViews,
  onNew,
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header className="header-modal position-relative">
        {/* Contenedor centrado para el ícono y el título */}
        <div className="w-100 text-center">
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
      <Modal.Footer className="footer-modal d-flex flex-wrap justify-content-center gap-2">
        <Button className="btn btn-success rol-button" onClick={onViews}>
          Ver Roles
        </Button>
        <Button className="btn btn-primary new-button" onClick={onNew}>
          Nuevo Rol
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

WarningPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onViews: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
};

export default WarningPopup;
