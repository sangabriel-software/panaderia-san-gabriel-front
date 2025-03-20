import React, { useState } from "react";
import { Container, Row, Col, Accordion, Button, Modal, Form } from "react-bootstrap";
import useGetRecetas from "../../hooks/recetas/useGetRecetas";
import useGetProductosYPrecios from "../../hooks/productosprecios/useGetProductosYprecios";
import DotsMove from "../../components/Spinners/DotsMove";
import Alert from "../../components/Alerts/Alert";
import { BsExclamationTriangleFill, BsPencil, BsTrash, BsPlus, BsClipboardData, BsCalculator, BsArrowLeft } from "react-icons/bs";
import Title from "../../components/Title/Title";
import { useNavigate } from "react-router";
import "./GestionDeRecetasPage.css";
import ToastNotification from "../../components/ToastNotifications/Notification/ToastNotification";
import SearchableSelect from "../../components/SearchableSelect/SearchableSelect";

const GestionDeRecetasPage = () => {
  const { recetas, loadingRecetas, showErrorRecetas, setRecetas } = useGetRecetas();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [showToast, setShowToast] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // Estado para el producto seleccionado
  const navigate = useNavigate();

  // Convertir productos al formato esperado por SearchableSelect
  const productOptions = productos.map((producto) => ({
    value: producto.idProducto,
    label: producto.nombreProducto,
  }));

  const handleAddReceta = () => {
    setShowAddModal(true);
  };

  const handleEditReceta = (receta) => {
    setSelectedReceta(receta);
    setShowEditModal(true);
  };

  const handleDeleteReceta = (receta) => {
    setSelectedReceta(receta);
    setShowDeleteModal(true);
  };

  const handleSaveReceta = () => {
    if (selectedProduct) {
      const newReceta = {
        idReceta: recetas.length + 1, // Generar un ID único (esto es solo un ejemplo)
        nombreProducto: selectedProduct.label,
        nombreIngrediente: "Harina", // Esto debería venir de otro input o select
        cantidadNecesaria: 100, // Esto debería venir de otro input
        unidadMedida: "kg", // Esto debería venir de otro input
      };
      setRecetas([...recetas, newReceta]);
      setShowAddModal(false);
      setSelectedProduct(null); // Limpiar selección
    }
  };

  const handleUpdateReceta = (updatedReceta) => {
    const updatedRecetas = recetas.map((receta) =>
      receta.idReceta === updatedReceta.idReceta ? updatedReceta : receta
    );
    setRecetas(updatedRecetas);
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    const filteredRecetas = recetas.filter(
      (receta) => receta.idReceta !== selectedReceta.idReceta
    );
    setRecetas(filteredRecetas);
    setShowDeleteModal(false);
  };

  // Loading mientras se cargan los recursos
  if (loadingRecetas || loadigProducts) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <DotsMove />
      </Container>
    );
  }

  // Notificación de error al consultar los recursos
  if (showErrorRecetas || showErrorProductos) {
    return (
      <Container className="justify-content-center align-items-center my-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar los productos y sus ingredientes."
              icon={<BsExclamationTriangleFill />}
            />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      {/* ---------------- Titulo ----------------- */}
      <div className="text-center mb-3">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/config")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title
              title="Configuración de ingredientes"
              description="Configura los productos y sus ingredientes."
            />
          </div>
        </div>
      </div>

      {/* Botón para agregar Recetas */}
      <Row className="mb-4">
        <Col>
          <Button
            variant="primary"
            onClick={handleAddReceta}
            className="d-flex align-items-center"
          >
            <BsPlus className="me-2" /> Agregar Nueva Receta
          </Button>
        </Col>
      </Row>

      {/* Mapear las recetas en dos columnas */}
      <Row>
        <Col>
          <Accordion>
            <Row>
              {recetas.map((receta, index) => (
                <Col key={receta.idReceta} xs={12} md={6} className="mb-3">
                  <Accordion.Item
                    eventKey={index.toString()}
                    className="shadow-sm custom-accordion-item"
                  >
                    <Accordion.Header className="custom-accordion-header">
                      <div className="d-flex justify-content-between w-100 align-items-center">
                        <span className="fw-bold d-flex align-items-center">
                          {receta.nombreProducto}
                        </span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="custom-accordion-body">
                      <Row>
                        <Col>
                          <p className="d-flex align-items-center">
                            <BsClipboardData
                              className="me-2"
                              style={{ color: "#198754" }}
                            />
                            <strong>Ingrediente:</strong>{" "}
                            {receta.nombreIngrediente}
                          </p>
                          <p className="d-flex align-items-center">
                            <BsCalculator
                              className="me-2"
                              style={{ color: "#ffc107" }}
                            />
                            <strong>Cantidad:</strong>{" "}
                            {receta.cantidadNecesaria} {receta.unidadMedida}
                          </p>
                        </Col>
                        <Col className="d-flex justify-content-end align-items-center">
                          <Button
                            variant="outline-primary"
                            onClick={() => handleEditReceta(receta)}
                            className="me-2 d-flex align-items-center custom-button"
                          >
                            <BsPencil className="me-2" /> Editar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteReceta(receta)}
                            className="d-flex align-items-center custom-button-cancel"
                          >
                            <BsTrash className="me-2" /> Eliminar
                          </Button>
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                </Col>
              ))}
            </Row>
          </Accordion>
        </Col>
      </Row>

      {/*----------------- Modal para agregar nueva receta ----------------------------*/}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-center">Nueva Receta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              {/* Usar el componente SearchableSelect */}
              <SearchableSelect
                options={productOptions}
                placeholder="Selecciona un producto..."
                onSelect={(selected) => setSelectedProduct(selected)}
                className="custom-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ingrediente</Form.Label>
              <Form.Control as="select" className="custom-input">
                <option value="1">Harina</option>
                {/* Agrega más opciones según sea necesario */}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                placeholder="Cantidad"
                className="custom-input"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-centered">
          <Button
            variant="primary"
            onClick={handleSaveReceta}
            className="custom-button-guardar"
          >
            Guardar Receta
          </Button>
        </Modal.Footer>
      </Modal>

      {/*---------------------------- Modal para editar receta -----------------*/}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        className="my-2"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-center">
            Editar Receta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Campo de Producto (deshabilitado) */}
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                as="select"
                value={selectedReceta?.nombreProducto || ""}
                disabled
                className="custom-input"
              >
                <option>{selectedReceta?.nombreProducto}</option>
              </Form.Control>
            </Form.Group>

            {/* Campo de Ingrediente (deshabilitado) */}
            <Form.Group className="mb-3">
              <Form.Label>Ingrediente</Form.Label>
              <Form.Control
                as="select"
                value={selectedReceta?.nombreIngrediente || ""}
                disabled
                className="custom-input"
              >
                <option>{selectedReceta?.nombreIngrediente}</option>
              </Form.Control>
            </Form.Group>

            {/* Campo de Cantidad (editable) */}
            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                defaultValue={selectedReceta?.cantidadNecesaria || ""}
                onChange={(e) =>
                  setSelectedReceta({
                    ...selectedReceta,
                    cantidadNecesaria: e.target.value,
                  })
                }
                className="custom-input"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-centered">
          <Button
            variant="primary"
            onClick={() => handleUpdateReceta(selectedReceta)}
            className="custom-button-guardar"
          >
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la receta de{" "}
          {selectedReceta?.nombreProducto}?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            className="custom-button"
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            className="custom-button-cancel"
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Notificaciones*/}
      <ToastNotification
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        title="Configuración de ingredientes"
        message="Configura los ingredientes de cada producto para que se muestren en las órdenes de producción."
        position="top-end"
      />
    </Container>
  );
};

export default GestionDeRecetasPage;