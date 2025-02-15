import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Popups.css";

const SuccessPopup = ({
  isOpen,
  onClose,
  title,
  message,
  onView,
  onNew,
  nombreBotonVolver,
  nombreBotonNuevo,
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      {/* Eliminamos la prop "closeButton" y creamos la estructura manualmente */}
      <Modal.Header className="header-modal position-relative">
        {/* Contenedor centrado para el ícono y el título */}
        <div className="w-100 text-center">
          <div className="success-icon">
            <svg width="40" height="40" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#28a745" />
              <path
                fill="white"
                d="M9.86 18a1 1 0 01-.73-.32l-4.86-5.17a1 1 0 111.46-1.37l4.12 4.39 8.41-9.2a1 1 0 111.48 1.34l-9.14 10a1 1 0 01-.73.33h-.01z"
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
      <Modal.Footer className="footer-modal d-flex flex-wrap justify-content-center gap-2">
        <Button className="btn btn-success" onClick={onView}>
          {nombreBotonVolver || "Ver Roles"}
        </Button>
        <Button className="btn btn-primary nuevo-bt" onClick={onNew}>
          {nombreBotonNuevo || "Nuevo Rol"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

SuccessPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onView: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  nombreBotonVolver: PropTypes.string,
  nombreBotonNuevo: PropTypes.string,
};

export default SuccessPopup;
