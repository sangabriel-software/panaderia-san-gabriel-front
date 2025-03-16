import React, { useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { FaMapMarkerAlt, FaCity, FaTrash, FaEdit } from 'react-icons/fa'; // Íconos
import { useForm } from 'react-hook-form'; // Para manejar el formulario
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import dayjs from 'dayjs'; // Importar day.js para manejar fechas
import "./GestionDeSucursalesPage.css";
import { actualizarSucursalService, elminarSUcursalService, ingresarSucursalService,  } from '../../../services/sucursales/sucursales.service';
import { handleShowModal } from './GestionDeSucursales.utils'; // Importar la función desde el archivo de utilidades

const GestionDeSucursalesPage = () => {
    const { sucursales, loadingSucursales, showErrorSucursales, setSucursales } = useGetSucursales();
    const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
    const [showModal, setShowModal] = useState(false);
    const [editingSucursal, setEditingSucursal] = useState(null); // Estado para guardar la sucursal que se está editando
    const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Estado para mostrar mensaje de éxito
    const [showErrorMessage, setShowErrorMessage] = useState(false); // Estado para mostrar mensaje de error

    // Configuración de react-hook-form
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    // Enviar datos del formulario
    const onSubmit = async (data) => {
        try {
            // Agregar la fecha actual al payload
            const fechaActual = dayjs().format('YYYY-MM-DD'); // Formato de fecha: Año-Mes-Día
            const payload = { ...data, fechaCreacion: fechaActual, departamentoSucursal: "" };

            if (editingSucursal) {
                // Lógica para editar la sucursal
                const actualizacionPayload = { ...payload, idSucursal: editingSucursal.idSucursal };
                const updatedSucursal = await actualizarSucursalService({ ...payload, idSucursal: editingSucursal.idSucursal });
                setShowSuccessMessage("Sucursal actualizada correctamente.");

                // Actualizar la lista de sucursales
                setSucursales((prevSucursales) =>
                    prevSucursales.map((sucursal) =>
                        sucursal.idSucursal === actualizacionPayload.idSucursal ? actualizacionPayload : sucursal
                    )
                );
            } else {
                // Lógica para agregar una nueva sucursal
                const nuevaSucursal = await ingresarSucursalService(payload);
                setSucursales((prevSucursales) => [...prevSucursales, nuevaSucursal]); // Agregar la nueva sucursal al estado
                setShowSuccessMessage("Sucursal agregada correctamente.");
            }
            setShowErrorMessage(false); // Ocultar mensaje de error
            setShowModal(false); // Cerrar el modal después de guardar
            setTimeout(() => setShowSuccessMessage(false), 3000); // Ocultar mensaje de éxito después de 3 segundos
        } catch (error) {
            setShowErrorMessage("Error al procesar la solicitud. Inténtelo de nuevo.");
            console.error(error);
        }
    };

    // Función para eliminar una sucursal
    const handleDelete = async (idSucursal) => {
        try {
            await elminarSUcursalService(idSucursal); // Llamar al servicio de eliminación
            setShowSuccessMessage("Sucursal eliminada correctamente.");

            // Actualizar el estado para eliminar la sucursal del listado
            setSucursales((prevSucursales) =>
                prevSucursales.filter((sucursal) => sucursal.idSucursal !== idSucursal)
            );

            setTimeout(() => setShowSuccessMessage(false), 3000); // Ocultar mensaje de éxito después de 3 segundos
        } catch (error) {
            setShowErrorMessage("Error al eliminar la sucursal. Inténtelo de nuevo.");
            console.error(error);
        }
    };

    if (loadingSucursales) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </Container>
        );
    }

    if (showErrorSucursales) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="alert alert-danger" role="alert">
                    Error al cargar las sucursales.
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h1 className="text-center mb-4">Gestión de Sucursales</h1>
            <Button variant="primary" className="mb-4" onClick={() => handleShowModal(null, setEditingSucursal, setValue, reset, setShowModal)}>
                Agregar Sucursal
            </Button>

            {/* Mensajes de éxito y error */}
            {showSuccessMessage && (
                <Alert variant="success" onClose={() => setShowSuccessMessage(false)} dismissible>
                    {showSuccessMessage}
                </Alert>
            )}
            {showErrorMessage && (
                <Alert variant="danger" onClose={() => setShowErrorMessage(false)} dismissible>
                    {showErrorMessage}
                </Alert>
            )}

            <Row>
                {sucursales.map((sucursal) => (
                    <Col key={sucursal.idSucursal} md={isMobile ? 12 : 6} lg={4} className="mb-4">
                        <Card className="h-100 gestion-card">
                            <Card.Header className="gestion-card-header">
                                {sucursal.nombreSucursal}
                            </Card.Header>
                            <Card.Body className="gestion-card-body">
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-2">
                                        <FaMapMarkerAlt className="gestion-card-icon" />
                                        <strong>Dirección:</strong> {sucursal.direccionSucursal}
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <FaCity className="gestion-card-icon" />
                                        <strong>Municipio:</strong> {sucursal.municipioSucursal}
                                    </div>
                                </div>
                                <div className="d-flex justify-content-center gap-3 mt-3">
                                    <Button variant="outline-primary" className="gestion-card-button gestion-card-button-primary" onClick={() => handleShowModal(sucursal, setEditingSucursal, setValue, reset, setShowModal)}>
                                        <FaEdit /> Editar
                                    </Button>
                                    <Button variant="outline-danger" className="gestion-card-button gestion-card-button-danger" onClick={() => handleDelete(sucursal.idSucursal)}>
                                        <FaTrash /> Eliminar
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal para agregar o editar sucursal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingSucursal ? "Editar Sucursal" : "Agregar Nueva Sucursal"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de la Sucursal</Form.Label>
                            <Form.Control
                                type="text"
                                {...register("nombreSucursal", { required: "Este campo es obligatorio" })}
                                isInvalid={!!errors.nombreSucursal}
                            />
                            {errors.nombreSucursal && (
                                <Form.Control.Feedback type="invalid">
                                    {errors.nombreSucursal.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control
                                type="text"
                                {...register("direccionSucursal", { required: "Este campo es obligatorio" })}
                                isInvalid={!!errors.direccionSucursal}
                            />
                            {errors.direccionSucursal && (
                                <Form.Control.Feedback type="invalid">
                                    {errors.direccionSucursal.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Municipio</Form.Label>
                            <Form.Control
                                type="text"
                                {...register("municipioSucursal", { required: "Este campo es obligatorio" })}
                                isInvalid={!!errors.municipioSucursal}
                            />
                            {errors.municipioSucursal && (
                                <Form.Control.Feedback type="invalid">
                                    {errors.municipioSucursal.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                                type="text"
                                {...register("telefonoSucursal")}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Correo Electrónico</Form.Label>
                            <Form.Control
                                type="email"
                                {...register("correoSucursal")}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {editingSucursal ? "Guardar Cambios" : "Guardar"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default GestionDeSucursalesPage;