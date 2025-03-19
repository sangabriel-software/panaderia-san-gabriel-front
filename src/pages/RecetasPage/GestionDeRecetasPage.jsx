import React, { useState } from "react";
import { Container, Row, Col, Accordion, Button, Modal, Form } from "react-bootstrap";
import useGetRecetas from "../../hooks/recetas/useGetRecetas";
import DotsMove from "../../components/Spinners/DotsMove";
import Alert from "../../components/Alerts/Alert";
import { BsExclamationTriangleFill, BsPencil, BsTrash, BsPlus, BsBox, BsClipboardData, BsCalculator } from "react-icons/bs";

const GestionDeRecetasPage = () => {
  const { recetas, loadingRecetas, showErrorRecetas, showInfoRecetas, setRecetas } = useGetRecetas();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);

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

  const handleSaveReceta = (newReceta) => {
    // Lógica para guardar la nueva receta
    setRecetas([...recetas, newReceta]);
    setShowAddModal(false);
  };

  const handleUpdateReceta = (updatedReceta) => {
    // Lógica para actualizar la receta
    const updatedRecetas = recetas.map(receta =>
      receta.idReceta === updatedReceta.idReceta ? updatedReceta : receta
    );
    setRecetas(updatedRecetas);
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    // Lógica para eliminar la receta
    const filteredRecetas = recetas.filter(receta => receta.idReceta !== selectedReceta.idReceta);
    setRecetas(filteredRecetas);
    setShowDeleteModal(false);
  };

  console.log(recetas);

  if (loadingRecetas) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <DotsMove />
      </Container>
    );
  }

  if (showErrorRecetas) {
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
    <Container className="my-5">
      <Row className="mb-4">
        <Col>
          <Button variant="primary" onClick={handleAddReceta} className="d-flex align-items-center">
            <BsPlus className="me-2" /> Agregar Nueva Receta
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Accordion>
            {recetas.map((receta, index) => (
              <Accordion.Item key={receta.idReceta} eventKey={index.toString()} className="mb-3 shadow-sm">
                <Accordion.Header>
                  <div className="d-flex justify-content-between w-100 align-items-center">
                    <span className="fw-bold d-flex align-items-center">
                      <BsBox className="me-2" /> {receta.nombreProducto}
                    </span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col>
                      <p className="d-flex align-items-center">
                        <BsClipboardData className="me-2" /> <strong>Ingrediente:</strong> {receta.nombreIngrediente}
                      </p>
                      <p className="d-flex align-items-center">
                        <BsCalculator className="me-2" /> <strong>Cantidad:</strong> {receta.cantidadNecesaria} {receta.unidadMedida}
                      </p>
                    </Col>
                    <Col className="d-flex justify-content-end align-items-center">
                      <Button variant="outline-primary" onClick={() => handleEditReceta(receta)} className="me-2 d-flex align-items-center">
                        <BsPencil className="me-2" /> Editar
                      </Button>
                      <Button variant="outline-danger" onClick={() => handleDeleteReceta(receta)} className="d-flex align-items-center">
                        <BsTrash className="me-2" /> Eliminar
                      </Button>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>

      {/* Modal para agregar nueva receta */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Receta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control as="select">
                {/* Aquí puedes mapear los productos disponibles */}
                <option>Producto 1</option>
                <option>Producto 2</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ingrediente</Form.Label>
              <Form.Control as="select">
                {/* Aquí puedes mapear los ingredientes disponibles */}
                <option>Ingrediente 1</option>
                <option>Ingrediente 2</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control type="number" placeholder="Cantidad" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Unidad de Medida</Form.Label>
              <Form.Control type="text" placeholder="Unidad de Medida" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveReceta}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar receta */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Receta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control as="select" defaultValue={selectedReceta?.idProducto}>
                {/* Aquí puedes mapear los productos disponibles */}
                <option>Producto 1</option>
                <option>Producto 2</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ingrediente</Form.Label>
              <Form.Control as="select" defaultValue={selectedReceta?.idIngrediente}>
                {/* Aquí puedes mapear los ingredientes disponibles */}
                <option>Ingrediente 1</option>
                <option>Ingrediente 2</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control type="number" defaultValue={selectedReceta?.cantidadNecesaria} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Unidad de Medida</Form.Label>
              <Form.Control type="text" defaultValue={selectedReceta?.unidadMedida} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => handleUpdateReceta(selectedReceta)}>
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
          ¿Estás seguro de que deseas eliminar la receta de {selectedReceta?.nombreProducto}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionDeRecetasPage;