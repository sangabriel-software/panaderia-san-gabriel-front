import React, { useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { FaMapMarkerAlt, FaCity, FaGlobeAmericas, FaTrash, FaEdit } from 'react-icons/fa'; // Íconos
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import "./GestionDeSucursalesPage.css";

const GestionDeSucursalesPage = () => {
    const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
    const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nombreSucursal: '',
        direccionSucursal: '',
        municipioSucursal: '',
        departamentoSucursal: '',
        latitudSucursal: '',
        longitudSucursal: '',
        telefonoSucursal: '',
        correoSucursal: '',
        fechaCreacion: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para enviar los datos al backend
        console.log('Datos a guardar:', formData);
        setShowModal(false); // Cerrar el modal después de guardar
    };

    const handleDelete = (idSucursal) => {
        // Aquí iría la lógica para eliminar la sucursal
        console.log('Eliminar sucursal con ID:', idSucursal);
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
            <Button variant="primary" className="mb-4" onClick={() => setShowModal(true)}>
                Agregar Sucursal
            </Button>
            <Row>
                {sucursales.map((sucursal) => (
                    <Col key={sucursal.idSucursal} md={isMobile ? 12 : 6} lg={4} className="mb-4">
                        <Card className="h-100 shadow-sm border-0 custom-card">
                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="text-center text-primary">
                                    {sucursal.nombreSucursal}
                                </Card.Title>
                                <Card.Text className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-2">
                                        <FaMapMarkerAlt className="me-2 text-secondary" />
                                        <strong>Dirección:</strong> {sucursal.direccionSucursal}
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <FaCity className="me-2 text-secondary" />
                                        <strong>Municipio:</strong> {sucursal.municipioSucursal}
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <FaGlobeAmericas className="me-2 text-secondary" />
                                        <strong>Departamento:</strong> {sucursal.departamentoSucursal}
                                    </div>
                                </Card.Text>
                                <div className="d-flex justify-content-center gap-3 mt-3">
                                    <Button variant="outline-primary" onClick={() => console.log('Editar:', sucursal.idSucursal)}>
                                        <FaEdit /> Editar
                                    </Button>
                                    <Button variant="outline-danger" onClick={() => handleDelete(sucursal.idSucursal)}>
                                        <FaTrash /> Eliminar
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal para agregar sucursal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Nueva Sucursal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de la Sucursal</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombreSucursal"
                                value={formData.nombreSucursal}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control
                                type="text"
                                name="direccionSucursal"
                                value={formData.direccionSucursal}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Municipio</Form.Label>
                            <Form.Control
                                type="text"
                                name="municipioSucursal"
                                value={formData.municipioSucursal}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Departamento</Form.Label>
                            <Form.Control
                                type="text"
                                name="departamentoSucursal"
                                value={formData.departamentoSucursal}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                                type="text"
                                name="telefonoSucursal"
                                value={formData.telefonoSucursal}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Correo Electrónico</Form.Label>
                            <Form.Control
                                type="email"
                                name="correoSucursal"
                                value={formData.correoSucursal}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Guardar
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default GestionDeSucursalesPage;