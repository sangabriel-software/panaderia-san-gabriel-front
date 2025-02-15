import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Popups.css";

const ConfirmPopUp = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header className="header-modal position-relative">
        {/* Contenedor centrado para el ícono y el título */}
        <div className="w-100 text-center">
          <div className="confirm-icon">
            <svg width="40" height="40" viewBox="0 0 24 24">
              {/* Ícono de advertencia o confirmación; en este caso un círculo amarillo con un signo de interrogación */}
              <circle cx="12" cy="12" r="10" fill="#ffc107" />
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontFamily="Arial"
                dy=".3em"
              >
                ?
              </text>
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
        <Button className="btn btn-modal-erro" onClick={onCancel}>
          Cancelar
        </Button>
        <Button className="btn btn-confirm" onClick={onConfirm}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmPopUp.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmPopUp;
