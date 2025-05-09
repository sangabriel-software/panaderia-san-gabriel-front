import React, { useState } from "react";
import { Modal, Button, Form, Container, Row, Col, ListGroup } from "react-bootstrap";
import { FaTimes, FaPlus } from "react-icons/fa";
import { BsCashStack } from "react-icons/bs";

const ModalGastos = ({ show, handleClose, onContinue }) => {
  const [gastos, setGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({
    detalle: "",
    subtotal: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoGasto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarGasto = () => {
    if (nuevoGasto.detalle && nuevoGasto.subtotal) {
      setGastos(prev => [...prev, {
        detalleGasto: nuevoGasto.detalle,
        subtotal: parseFloat(nuevoGasto.subtotal)
      }]);
      setNuevoGasto({ detalle: "", subtotal: "" });
    }
  };

  const eliminarGasto = (index) => {
    setGastos(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinuar = () => {
    onContinue(gastos);
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      className="gastos-modal"
    >
      <Modal.Header className="bg-gradient-warning text-white">
        <Modal.Title className="w-100 text-center">
          <BsCashStack size={28} className="me-2" />
          Gastos del Turno
        </Modal.Title>
        <Button
          variant="link"
          onClick={handleClose}
          className="text-white"
        >
          <FaTimes />
        </Button>
      </Modal.Header>
      <Modal.Body className="bg-light">
        <Container>
          <Row className="justify-content-center mb-4">
            <Col xs={12} md={8}>
              <div className="bg-white p-3 rounded shadow-sm">
                <h5 className="text-center mb-3">Agregar Nuevo Gasto</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Detalle del Gasto</Form.Label>
                      <Form.Control
                        type="text"
                        name="detalle"
                        value={nuevoGasto.detalle}
                        onChange={handleInputChange}
                        placeholder="Ej. Pago de taxi"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subtotal (Q)</Form.Label>
                      <Form.Control
                        type="number"
                        name="subtotal"
                        value={nuevoGasto.subtotal}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      variant="success"
                      onClick={agregarGasto}
                      className="w-100"
                      disabled={!nuevoGasto.detalle || !nuevoGasto.subtotal}
                    >
                      <FaPlus />
                    </Button>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {gastos.length > 0 && (
            <Row className="justify-content-center">
              <Col xs={12} md={8}>
                <div className="bg-white p-3 rounded shadow-sm">
                  <h5 className="text-center mb-3">Gastos Registrados</h5>
                  <ListGroup>
                    {gastos.map((gasto, index) => (
                      <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{gasto.detalleGasto}</strong>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Q{gasto.subtotal.toFixed(2)}</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => eliminarGasto(index)}
                          >
                            <FaTimes />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </Modal.Body>
      <Modal.Footer className="bg-gradient-warning">
        <Button
          variant="light"
          onClick={handleClose}
          className="btn-cancelar shadow"
        >
          Cancelar
        </Button>
        <Button
          variant="warning"
          onClick={handleContinuar}
          className="btn-continuar shadow text-white"
        >
          Continuar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalGastos;