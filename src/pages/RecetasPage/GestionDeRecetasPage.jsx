import React, { useState, useRef, useEffect } from "react"; // Asegúrate de importar useEffect
import { Container, Row, Col, Accordion, Button, Modal, Form, } from "react-bootstrap";
import { useForm } from "react-hook-form";
import useGetRecetas from "../../hooks/recetas/useGetRecetas";
import useGetProductosYPrecios from "../../hooks/productosprecios/useGetProductosYprecios";
import DotsMove from "../../components/Spinners/DotsMove";
import Alert from "../../components/Alerts/Alert";
import { BsExclamationTriangleFill, BsPencil, BsTrash, BsPlus, BsClipboardData, BsCalculator, BsArrowLeft, BsFillInfoCircleFill, } from "react-icons/bs";
import Title from "../../components/Title/Title";
import { useNavigate } from "react-router";
import ToastNotification from "../../components/ToastNotifications/Notification/ToastNotification";
import SearchableSelect from "../../components/SearchableSelect/SearchableSelect";
import SuccessPopup from "../../components/Popup/SuccessPopup";
import ConfirmPopUp from "../../components/Popup/ConfirmPopup";
import "./GestionDeRecetasPage.css";
import { getProductOptions, handleAddReceta, handleConfirmDeleteReceta, handleDeleteReceta, handleEditReceta, handleIngresarReceta, handleModificarReceta } from "./GestionDeRecetas.utils";

const GestionDeRecetasPage = () => {
  const { recetas, loadingRecetas, showErrorRecetas, setRecetas } = useGetRecetas();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [showToast, setShowToast] = useState(false); // Inicialmente en false
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchableSelectError, setSearchableSelectError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const searchableSelectRef = useRef(null);
  const navigate = useNavigate();

  // Variables de estado para mostrar popup y almacenar la orden a eliminar
  const [isPopupOpen, setIsPopupOpen] = useState(false); //Abrir pop up de confirmacion de elminacion
  const [isPopupOpenSuccess, setIsPopupOpenSuccess] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [recetaToDelete, setRecetaToDelete] = useState(null);
  const [editingReceta, setEditingReceta] = useState(false); // Estado para guardar la sucursal que se está editando
  const [isLoading, setIsLoading] = useState(false); //Para setear carga de alguna opcion

  // React Hook Form para el modal de agregar
  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd }, } = useForm();
  // React Hook Form para el modal de editar
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit }, setValue: setEditValue, } = useForm();

  const onSubmitAdd = (data) => {
    handleIngresarReceta( data, selectedProduct, setEditingReceta, setShowAddModal, resetAdd, setRecetas, setSelectedProduct,
                   setSearchableSelectError, setErrorMessage, setIsPopupOpenSuccess, setIsPopupErrorOpen, setErrorPopupMessage );
  };

  const onSubmitEdit = (data) => {
    handleModificarReceta( data, selectedReceta, setRecetas, setEditingReceta, setShowEditModal, resetEdit, setErrorMessage,
                      setIsPopupOpenSuccess, setIsPopupErrorOpen, setErrorPopupMessage );
};

  // Usa useEffect para mostrar el Toast solo al cargar la página por primera vez
  useEffect(() => {
    setShowToast(true); // Muestra el Toast cuando el componente se monta
  }, []); // El array vacío asegura que esto solo ocurra una vez


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
            onClick={() => handleAddReceta(setShowAddModal)}
            className="d-flex align-items-center"
          >
            <BsPlus className="me-2" /> Agregar Nueva Receta
          </Button>
        </Col>
      </Row>

      {/* Mostrar mensaje de error general */}
      {errorMessage && (
        <Row className="mb-4">
          <Col>
            <Alert
              type="danger"
              message={errorMessage}
              icon={<BsExclamationTriangleFill />}
              onClose={() => setErrorMessage("")}
            />
          </Col>
        </Row>
      )}

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
                            onClick={() => handleEditReceta(receta, setSelectedReceta, setShowEditModal, setEditValue)}
                            className="me-2 d-flex align-items-center custom-button"
                          >
                            <BsPencil className="me-2" /> Editar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleConfirmDeleteReceta(receta.idProducto, setRecetaToDelete, setIsPopupOpen)}
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
      <Modal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false); // Cerrar el modal
          resetAdd(); // Limpiar el formulario
          setSelectedProduct(null); // Limpiar el producto seleccionado
          setSearchableSelectError(""); // Limpiar el mensaje de error
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-center">Nueva Receta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitAdd(onSubmitAdd)}>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <SearchableSelect
                options={getProductOptions(productos)}
                placeholder="Selecciona un producto..."
                onSelect={(selected) => {
                  setSelectedProduct(selected);
                  setSearchableSelectError("");
                }}
                className="custom-input"
                required
                ref={searchableSelectRef} // Esto ahora funcionará correctamente
              />
              {searchableSelectError && (
                <span className="text-danger">{searchableSelectError}</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ingrediente</Form.Label>
              <Form.Control
                as="select"
                {...registerAdd("nombreIngrediente", { required: true })}
                className="custom-input"
                disabled
              >
                <option value="Harina">Harina</option>
                {/* Agrega más opciones según sea necesario */}
              </Form.Control>
              {errorsAdd.nombreIngrediente && (
                <span className="text-danger">Este campo es requerido</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                placeholder="Cantidad"
                {...registerAdd("cantidadNecesaria", { required: true })}
                className="custom-input"
              />
              {errorsAdd.cantidadNecesaria && (
                <span className="text-danger">Este campo es requerido</span>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-centered">
          <Button
            variant="primary"
            type="submit"
            onClick={handleSubmitAdd(onSubmitAdd)}
            className="custom-button-guardar"
          >
            Guardar Receta
          </Button>
        </Modal.Footer>
      </Modal>

      {/*---------------------------- Modal para editar receta -----------------*/}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false); // Cerrar el modal
          resetEdit(); // Limpiar el formulario
        }}
        className="my-2"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-center">
            Editar Receta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitEdit(onSubmitEdit)}>
            {/* Campo de Producto (deshabilitado) */}
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                as="select"
                value={selectedReceta?.nombreProducto || ""}
                disabled
                className="custom-input"
                {...registerEdit("nombreProducto")}
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
                {...registerEdit("nombreIngrediente")}
              >
                <option>{selectedReceta?.nombreIngrediente}</option>
              </Form.Control>
            </Form.Group>

            {/* Campo de Cantidad (editable) */}
            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                placeholder="Cantidad"
                {...registerEdit("cantidadNecesaria", { required: true })}
                className="custom-input"
              />
              {errorsEdit.cantidadNecesaria && (
                <span className="text-danger">Este campo es requerido</span>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-centered">
          <Button
            variant="primary"
            type="submit"
            onClick={handleSubmitEdit(onSubmitEdit)}
            className="custom-button-guardar"
          >
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ---------------- PopUp y Alertas de errores e informacion -------------------- */}
      {recetas.length === 0 && (
        <div className="row justify-content-center my-3">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se han ingresado Recetas."
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
          editingReceta
            ? `La informacion se ha modificado con exito.`
            : "La Receta se ha ingresado con éxito."
        }
        nombreBotonVolver="Ver Recetas"
        nombreBotonNuevo="Ingresar Receta"
        onView={() => setIsPopupOpenSuccess(false)}
        onNew={() => {
          setIsPopupOpenSuccess(false);
          setShowAddModal(true);
        }}
      />

      {/* Popup confirmacion de eliminación */}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Confirmar Eliminación"
        message="¿Está seguro de eliminar la sucursal?"
        onConfirm={() => {
          handleDeleteReceta(
            recetaToDelete,
            setRecetas,
            setIsPopupOpen,
            setErrorPopupMessage,
            setIsPopupErrorOpen,
            setIsLoading
          );
        }}
        onCancel={() => setIsPopupOpen(false)}
        isLoading={isLoading}
      />

      {/* Notificaciones*/}
      <ToastNotification
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={2000}
        title="Configuración de ingredientes"
        message="Configura los ingredientes de cada producto para que se muestren en las órdenes de producción."
        position="top-end"
      />
    </Container>
  );
};

export default GestionDeRecetasPage;
