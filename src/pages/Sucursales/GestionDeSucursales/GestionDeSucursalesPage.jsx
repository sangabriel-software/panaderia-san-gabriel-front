import React, { useState } from "react";
import {  Container, Row, Col, Card, Spinner, Button, Modal, Form, } from "react-bootstrap"; 
import { useMediaQuery } from "react-responsive";
import { FaMapMarkerAlt, FaCity, FaTrash, FaEdit, FaBuilding, FaMapMarkedAlt, FaPhone, FaEnvelope, } from "react-icons/fa"; // Íconos
import { useForm } from "react-hook-form"; // Para manejar el formulario
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import Title from "../../../components/Title/Title";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import { BsExclamationTriangleFill, BsFillInfoCircleFill, } from "react-icons/bs"; 
import Alert from "../../../components/Alerts/Alert";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import "./GestionDeSucursalesPage.css";
import { handleConfirmDeleteSucursal, handleDeleteSucursal, handleIngresarSucursalSubmit, handleShowModal, } from "./GestionDeSucursales.utils"; // Importar la función desde el archivo de utilidades

const GestionDeSucursalesPage = () => {
  const { sucursales, loadingSucursales, showErrorSucursales, setSucursales } =
    useGetSucursales();
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const [showModal, setShowModal] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState(null); // Estado para guardar la sucursal que se está editando
  const [isSaving, setIsSaving] = useState(false); // Estado para controlar el loading del guardado
  const [isLoading, setIsLoading] = useState(false); //Para setear carga de alguna opcion

  // Configuración de react-hook-form
  const { register, handleSubmit, reset, setValue, formState: { errors }, } = useForm();

  // Variables de estado para mostrar popup y almacenar la orden a eliminar
  const [isPopupOpen, setIsPopupOpen] = useState(false); //Abrir pop up de confirmacion de elminacion
  const [isPopupOpenSuccess, setIsPopupOpenSuccess] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [sucursalToDelete, setSucursalToDelete] = useState(null);

  // Enviar datos del formulario
  const onSubmit = async (data) => {
    await handleIngresarSucursalSubmit( data, setIsSaving, editingSucursal, setSucursales, setIsPopupOpenSuccess,
                                        setErrorPopupMessage, setIsPopupErrorOpen, setShowModal, reset );
  };

  if (loadingSucursales) {
    return (
      <Container className="d-flex justify-content-center align-items-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (showErrorSucursales) {
    return (
      <Container className="justify-content-center align-items-center my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar las Sucursales."
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title
        title="Sucursales"
        description="Administración de sucursales activas"
      />
      <Button variant="primary" className="mb-4" onClick={() => handleShowModal( null, setEditingSucursal, setValue, reset, setShowModal ) }
      >
        Agregar Sucursal
      </Button>

      {/* Card para mostrar sucursales */}
      <Row>
        {sucursales.map((sucursal) => (
          <Col key={sucursal.idSucursal} md={isMobile ? 12 : 6} lg={4} className="mb-4" >
            <Card className="h-100 gestion-card">
              <Card.Header className="gestion-card-header">
                {sucursal.nombreSucursal}
              </Card.Header>
              <Card.Body className="gestion-card-body">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <FaMapMarkerAlt className="gestion-card-icon" />
                    <span className="me-2">
                      <strong>Dirección:</strong>
                    </span>{" "}
                    {sucursal.direccionSucursal}
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaCity className="gestion-card-icon" />
                    <span className="me-2">
                      <strong>Municipio:</strong>
                    </span>{" "}
                    {sucursal.municipioSucursal}
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaPhone className="me-2" />
                    <span className="me-2">
                      <strong>Teléfono:</strong>
                    </span>{" "}
                    {sucursal.telefonoSucursal || "N/A"}
                  </div>
                </div>
                <div className="d-flex justify-content-center gap-3 mt-3">
                  <Button
                    variant="outline-primary"
                    className="gestion-card-button gestion-card-button-primary"
                    onClick={() =>
                      handleShowModal(
                        sucursal,
                        setEditingSucursal,
                        setValue,
                        reset,
                        setShowModal
                      )
                    }
                  >
                    <FaEdit /> Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="gestion-card-button gestion-card-button-danger"
                    onClick={() =>
                      handleConfirmDeleteSucursal(
                        sucursal.idSucursal,
                        setSucursalToDelete,
                        setIsPopupOpen
                      )
                    }
                  >
                    <FaTrash /> Eliminar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ----------------Modale para ingreso y modificacion de sucrusales---------------------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="w-100 text-center">
            {editingSucursal ? "Editar Sucursal" : "Nueva Sucursal"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 my-2">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaBuilding className="me-2" />
                Nombre de la Sucursal
              </Form.Label>
              <Form.Control
                type="text"
                {...register("nombreSucursal", {
                  required: "Este campo es obligatorio",
                })}
                isInvalid={!!errors.nombreSucursal}
                className="custom-input"
              />
              {errors.nombreSucursal && (
                <Form.Control.Feedback type="invalid">
                  {errors.nombreSucursal.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaMapMarkedAlt className="me-2" />
                Dirección
              </Form.Label>
              <Form.Control
                type="text"
                {...register("direccionSucursal", {
                  required: "Este campo es obligatorio",
                })}
                isInvalid={!!errors.direccionSucursal}
                className="custom-input"
              />
              {errors.direccionSucursal && (
                <Form.Control.Feedback type="invalid">
                  {errors.direccionSucursal.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaCity className="me-2" />
                Municipio
              </Form.Label>
              <Form.Control
                type="text"
                {...register("municipioSucursal", {
                  required: "Este campo es obligatorio",
                })}
                isInvalid={!!errors.municipioSucursal}
                className="custom-input"
              />
              {errors.municipioSucursal && (
                <Form.Control.Feedback type="invalid">
                  {errors.municipioSucursal.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaPhone className="me-2" />
                Teléfono
              </Form.Label>
              <Form.Control
                type="number"
                {...register("telefonoSucursal")}
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaEnvelope className="me-2" />
                Correo Electrónico
              </Form.Label>
              <Form.Control
                type="email"
                {...register("correoSucursal")}
                className="custom-input"
              />
            </Form.Group>
            <div className="d-flex justify-content-center">
              <Button
                variant="primary"
                type="submit"
                disabled={isSaving}
                className="custom-button"
              >
                {isSaving ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Guardando...</span>
                  </>
                ) : editingSucursal ? (
                  "Guardar Cambios"
                ) : (
                  "Guardar Sucursal"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ---------------- PopUp y Alertas de errores e informacion -------------------- */}
      {sucursales.length === 0 && (
        <div className="row justify-content-center my-3">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se han ingresado Sucursales."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}

      {/* Popup modificacion e ingreso exitoso */}
      <SuccessPopup
        isOpen={isPopupOpenSuccess}
        onClose={() => setIsPopupOpenSuccess(false)}
        title="¡Éxito!"
        message={
          editingSucursal
            ? `La informacion se ha modificado con exito`
            : "La sucursal se ha ingresado con éxito."
        }
        nombreBotonVolver="Ver sucursales"
        nombreBotonNuevo="Ingresar Sucursal"
        onView={() => setIsPopupOpenSuccess(false)}
        onNew={() => setShowModal(true)}
      />

      {/* Popup confirmacion de eliminación */}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Confirmar Eliminación"
        message="¿Está seguro de eliminar la sucursal?"
        onConfirm={() => {
          handleDeleteSucursal(
            sucursalToDelete,
            setSucursales,
            setIsPopupOpen,
            setErrorPopupMessage,
            setIsPopupErrorOpen,
            setIsLoading
          );
        }}
        onCancel={() => setIsPopupOpen(false)}
        isLoading={isLoading}
      />

      {/* Popup errores */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </Container>
  );
};

export default GestionDeSucursalesPage;
