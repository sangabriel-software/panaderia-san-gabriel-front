import React from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import "./ModalStyles.css";
import { BsExclamationTriangleFill } from "react-icons/bs";

const ModalIngreso = ({
  show,
  onHide,
  title,
  children,
  isLoading = false,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  centered = true,
  titleCentered = true,
  footerCentered = true,
  isError = false,
  confirmDisabled,
  ...rest
}) => {
  return (
    <Modal className="modal-content-ingreso" show={show} onHide={onHide} centered={centered} {...rest}>
      <Modal.Header className="modal-ingreso-header" closeButton>
        <Modal.Title className={`${titleCentered ? "w-100 text-center" : ""} modal-ingreso-title`}>
          {title}
        </Modal.Title>
      </Modal.Header>
      {isError && (
        <Alert variant="danger" className="modal-ingreso-alert d-flex align-items-center text-center">
          <BsExclamationTriangleFill className="me-2" />
          Hubo un error al guardar la información, intente mas tarde.
        </Alert>
      )}

      <Modal.Body className="modal-ingreso-body">{children}</Modal.Body>
      <Modal.Footer className={`${footerCentered ? "justify-content-center" : ""} modal-ingreso-footer`}>
        <div className="w-100 d-flex flex-row justify-content-center">
          <Button
            className="bt-cancelar me-2 flex-fill modal-ingreso-btn"
            onClick={onHide}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            className="btn-type-category flex-fill modal-ingreso-btn"
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Cargando...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalIngreso;