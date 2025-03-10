import React, { useState } from "react";
import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";

const ModalVentaEsperada = ({ show, handleClose, onContinue }) => {
  const [ventaReal, setVentaReal] = useState(""); // Estado para almacenar la venta real

  // Manejar el cambio en el input de la venta real
  const handleVentaRealChange = (e) => {
    setVentaReal(e.target.value); // Actualizar el estado con el valor ingresado
  };

  // Manejar la acción de continuar
  const handleContinuar = () => {
    const ventaRealNumber = parseFloat(ventaReal); // Convertir a número
    if (!isNaN(ventaRealNumber)) {
      onContinue(ventaRealNumber); // Pasar la venta real como número
    } else {
      onContinue(0); // Si no es un número válido, pasar 0
    }
    handleCloseModal(); // Cerrar el modal y limpiar el input
  };

  // Función para cerrar el modal y limpiar el input
  const handleCloseModal = () => {
    setVentaReal(""); // Limpiar el input
    handleClose(); // Cerrar el modal
  };

  return (
    <Modal
      show={show}
      onHide={handleCloseModal} // Usar handleCloseModal para cerrar y limpiar
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="venta-esperada-modal"
    >
      <Modal.Header className="bg-gradient-primary text-white">
        <Modal.Title className="w-100 text-center">
          <BsCashCoin size={28} className="me-2" />
          Ingresos del Turno
        </Modal.Title>
        <Button
          variant="link"
          onClick={handleCloseModal} // Usar handleCloseModal para cerrar y limpiar
          className="text-white"
        >
          <FaTimes />
        </Button>
      </Modal.Header>
      <Modal.Body className="bg-light d-flex justify-content-center align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={8} className="text-center">
              <div className="venta-esperada-card p-4 shadow-sm rounded">
                <h3 className="text-primary mb-4">Ingresar Venta</h3>
                {/* Mostrar el valor de ventaReal dinámicamente */}
                <div className="display-4 text-success fw-bold mb-4">
                  Q.{ventaReal ? parseFloat(ventaReal).toFixed(2) : "0.00"}
                </div>
                <Form.Group className="mb-4">
                  <Form.Label className="small text-uppercase text-muted fw-bold">
                    Venta Real (Q)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Ingrese la venta real"
                    value={ventaReal}
                    onChange={handleVentaRealChange}
                    className="input-data text-center fs-5"
                  />
                </Form.Group>
              </div>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer className="bg-gradient-primary">
        <Button
          variant="light"
          onClick={handleCloseModal} // Usar handleCloseModal para cerrar y limpiar
          className="btn-cancelar shadow"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleContinuar}
          className="btn-continuar shadow"
          disabled={!ventaReal} // Deshabilitar si no se ha ingresado la venta real
        >
          Continuar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalVentaEsperada;