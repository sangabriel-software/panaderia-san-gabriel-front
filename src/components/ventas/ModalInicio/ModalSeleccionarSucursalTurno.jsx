import React from "react";
import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import DotsMove from "../../../components/Spinners/DotsMove";
import Alert from "../../Alerts/Alert";
import { BsFillInfoCircleFill } from "react-icons/bs";

const ModalSeleccionarSucursalTurno = ({ showModal, handleCloseModal, turnoValue, setValue, errors, loadingSucursales, 
                                         sucursales, register, isLoading, navigate, hasOrdenes, isAdmin, usuarioSucursal }) => {
  return (
    <Modal
      show={showModal}
      onHide={() => handleCloseModal(navigate)}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      fullscreen
      className="ingresar-venta-modal"
    >
      <Modal.Header className="bg-purple text-white">
        <Modal.Title className="w-100 text-center">
          ¿En que sucursal y en que turno te encuntras?
        </Modal.Title>
        <Button
          variant="link"
          onClick={() => handleCloseModal(navigate)}
          className="text-white"
        >
          <FaTimes />
        </Button>
      </Modal.Header>
      <Modal.Body className="bg-light d-flex justify-content-center align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={6} className="text-center">
              <Form>
                <Form.Group className="mb-4">
                  <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                    Turno
                  </label>
                  <div className="d-flex flex-column flex-md-row justify-content-center gap-3 ingresar-venta-shift-selector">
                    <Button
                      variant={
                        turnoValue === "AM" ? "primary" : "outline-primary"
                      }
                      className="ingresar-venta-shift-btn shadow w-100 w-md-auto"
                      onClick={() => setValue("turno", "AM")}
                    >
                      🌅 AM
                    </Button>
                    <Button
                      variant={
                        turnoValue === "PM" ? "primary" : "outline-primary"
                      }
                      className="ingresar-venta-shift-btn shadow w-100 w-md-auto"
                      onClick={() => setValue("turno", "PM")}
                    >
                      🌇 PM
                    </Button>
                  </div>
                  {errors.turno && (
                    <span className="ingresar-venta-text-danger small">
                      Selecciona un turno
                    </span>
                  )}
                </Form.Group>

                <Form.Group controlId="formSucursal" className="mb-4">
                  <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                    Sucursal
                  </label>
                  {loadingSucursales ? (
                    <div className="loading-spinner">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      />
                    </div>
                  ) : isAdmin ? (
                    <Form.Select
                      {...register("sucursal", { required: true })}
                      className={`ingresar-venta-custom-select shadow w-100 ${
                        errors.sucursal ? "is-invalid" : ""
                      }`}
                    >
                      <option value="">Selecciona una sucursal</option>
                      {sucursales.map((sucursal) => (
                        <option
                          key={sucursal.idSucursal}
                          value={sucursal.idSucursal}
                        >
                          {sucursal.nombreSucursal}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Select
                      {...register("sucursal", { required: true })}
                      className={`ingresar-venta-custom-select shadow w-100 ${
                        errors.sucursal ? "is-invalid" : ""
                      }`}
                    >
                      <option value="">Selecciona una sucursal</option>
                        <option
                          key={usuarioSucursal.idSucursal}
                          value={usuarioSucursal.idSucursal}
                        >
                          {usuarioSucursal.sucursal || "Tu sucursal"}
                        </option>

                    </Form.Select>
                  )}
                  {errors.sucursal && (
                    <span className="ingresar-venta-text-danger small">
                      {isAdmin ? "No se pudieron cargar las sucursales. Intente más tarde." : "Error al cargar tu sucursal"}
                    </span>
                  )}
                </Form.Group>
                {isLoading && (
                  <div className="d-flex justify-content-center mt-3">
                    <DotsMove />
                  </div>
                )}

                {!isLoading && showModal && !hasOrdenes && (
                  <div className="row justify-content-center my-3">
                    <div className="col-md-12 text-center">
                      <Alert
                        type="danger"
                        message="No se encontraron ordenes para ingresar una venta."
                        icon={<BsFillInfoCircleFill />}
                      />
                    </div>
                  </div>
                )}
              </Form>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer className="bg-purple">
        <Button
          variant="light"
          onClick={() => handleCloseModal(navigate)}
          className="bt-cancelar shadow"
        >
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalSeleccionarSucursalTurno;