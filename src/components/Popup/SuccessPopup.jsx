import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap"; // Importa los componentes de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css"; // Asegúrate de importar Bootstrap
import "./Popups.css";

const SuccessPopup = ({
  isOpen,
  onClose,
  title,
  message,
  onViewRoles,
  onNewRole,
  nombreBotonVolver,
  nombreBotonNuevo,
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton className="header-modal position-relative">
        {/* Contenedor para el ícono y el título */}
        <div className="d-flex flex-column align-items-center w-100">
          {/* Ícono centrado */}
          <div className="error-icon mb-2">
            <svg width="40" height="40" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#28a745" />
              <path
                fill="white"
                d="M9.86 18a1 1 0 01-.73-.32l-4.86-5.17a1 1 0 111.46-1.37l4.12 4.39 8.41-9.2a1 1 0 111.48 1.34l-9.14 10a1 1 0 01-.73.33h-.01z"
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
        {/* Centramos el mensaje */}
        <p className="popup-message text-center">{message}</p>
      </Modal.Body>
      <Modal.Footer className="footer-modal d-flex flex-wrap justify-content-center gap-2">
        {/* Botón para redirigir a "Ver Roles" */}
        <Button className="btn btn-success" onClick={onViewRoles}>
          {nombreBotonVolver || "Ver Roles"}
        </Button>
        {/* Botón para crear un nuevo rol */}
        <Button className="btn btn-primary nuevo-bt" onClick={onNewRole}>
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
  onViewRoles: PropTypes.func.isRequired,
  onNewRole: PropTypes.func.isRequired,
  nombreBotonVolver: PropTypes.string,
  nombreBotonNuevo: PropTypes.string,
};

export default SuccessPopup;
