import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetProductosYPrecios } from "../../../hooks/productosprecios/useGetProductosYprecios";
import { checkForChanges, handleConfirmDeletePreoducto, handleDeleleProducto, handleModifyClick, handleUpdateProduct, useCategoriasYFiltrado, useSerchPrductos,
} from "./ManageProductsUtils";
import SearchInput from "../../../components/SerchInput/SerchInput";
import Title from "../../../components/Title/Title";
import CardProductos from "../../../components/CardProductos/CardPoductos";
import { useNavigate } from "react-router";
import Alert from "../../../components/Alerts/Alert";
import { BsExclamationTriangleFill, BsFillInfoCircleFill, BsX, } from "react-icons/bs";
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import ModalIngreso from "../../../components/ModalGenerico/Modal";
import { Form, Row, Col } from "react-bootstrap";
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import "./ManageProducts.css";
import AddButton from "../../../components/AddButton/AddButton";

const ManageProducts = () => {
  const {
    productos,
    loadigProducts,
    showErrorProductos,
    showInfoProductos,
    setProductos,
  } = useGetProductosYPrecios();
  const { filteredProductos, searchQuery, showNoResults, handleSearch } =
    useSerchPrductos(productos);
  const {
    categorias,
    filteredByCategory,
    selectedCategory,
    setSelectedCategory,
  } = useCategoriasYFiltrado(productos, filteredProductos);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [initialProductValues, setInitialProductValues] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  const { categorias: categoriasModify, loadingCategorias, showErrorCategorias, showInfoCategorias, } = useGetCategorias();
  const [loadingModificar, setLoadingModificar] = useState(false);

  // React Hook Form
  const { register, handleSubmit, reset, watch, setValue, formState: { errors }, } = useForm();

  // Estado para controlar la visibilidad del input de unidades por bandeja
  const [showUnidadesPorBandeja, setShowUnidadesPorBandeja] = useState(false);

  // Observar el valor del campo idCategoria
  const selectedCategoryModal = watch("idCategoria");

  // Efecto para mostrar/ocultar el input de unidades por bandeja
  useEffect(() => {
    if (selectedCategoryModal && selectedCategoryModal == 1) {
      setShowUnidadesPorBandeja(true);
    } else {
      setShowUnidadesPorBandeja(false);
    }
  }, [selectedCategoryModal]);

  // Efecto para verificar cambios cada vez que se modifica el formulario
  useEffect(() => {
    checkForChanges(
      selectedProduct,
      initialProductValues,
      setHasChanges,
      watch
    );
  }, [watch()]);

  // Función para guardar los cambios del producto
  const onSubmit = async (data) => {
    handleUpdateProduct( data, selectedProduct, setProductos, setShowModifyModal, setSelectedProduct, setInitialProductValues, setHasChanges,
                         setErrorPopupMessage, setIsPopupErrorOpen, setLoadingModificar );
  };

  if (loadigProducts) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="container">
      <Title
        title="Productos"
        description="Administración de productos existentes"
      />
      <div className="row mb-4">
        <AddButton
          buttonText="Ingresar Producto"
          onRedirect={() => navigate("ingresar-producto")}
        />
        <div className="col-12 col-md-6">
          <SearchInput
            id="searchInput"
            aria-label="Buscar Producto"
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            placeholder={
              showErrorProductos || showInfoProductos
                ? "No se pueden realizar búsquedas"
                : "Buscar Producto"
            }
            readOnly={showErrorProductos || showInfoProductos}
          />
        </div>
        <div className="col-12 col-md-3">
          <select
            id="selectedCategory"
            name="selectedCategory"
            className="form-control input-data"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="container mt-4">
        <div className="row">
          {filteredByCategory.map((producto) => (
            <div
              key={producto.idProducto}
              className="col-xs-12 col-12 col-lg-6 mb-4"
            >
              <CardProductos
                id={producto.idProducto}
                nombreProducto={producto.nombreProducto}
                cantidad={producto.cantidad}
                precio={producto.precio}
                image={producto.imagenB64}
                categoria={producto.nombreCategoria}
                onDelete={() =>
                  handleDeleleProducto(
                    producto.idProducto,
                    setProductoToDelete,
                    setIsPopupOpen
                  )
                }
                onModify={() =>
                  handleModifyClick(
                    producto,
                    setSelectedProduct,
                    setInitialProductValues,
                    setShowModifyModal,
                    reset,
                    setHasChanges
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal para modificación de productos */}
      <ModalIngreso
        show={showModifyModal}
        onHide={() => setShowModifyModal(false)}
        title="Modificar Producto"
        onConfirm={handleSubmit(onSubmit)}
        confirmText="Modificar"
        confirmDisabled={!hasChanges}
        isLoading={loadingModificar}
      >
        {selectedProduct && (
          <Form>
            {/* Campo: Nombre del Producto */}
            <Form.Group className="mb-3" controlId="nombreProducto">
              <Form.Label>Nombre del Producto</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  placeholder="Ingrese el nombre"
                  {...register("nombreProducto", {
                    required: "El nombre del producto es obligatorio.",
                  })}
                  isInvalid={!!errors.nombreProducto}
                  className="input-field input-data"
                />
                <BsX
                  className="input-icon"
                  onClick={() => setValue("nombreProducto", "")}
                />
              </div>
              {errors.nombreProducto && (
                <Form.Control.Feedback type="invalid">
                  {errors.nombreProducto.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Campo: Categoría */}
            <Form.Group className="mb-3" controlId="idCategoria">
              <Form.Label>Categoría</Form.Label>
              <div className="input-wrapper">
                <Form.Select
                  {...register("idCategoria", {
                    required: "La categoría es obligatoria.",
                  })}
                  isInvalid={!!errors.idCategoria}
                  className="input-field input-data"
                >
                  <option value="">Selecciona una categoría...</option>
                  {loadingCategorias ? (
                    <option>Cargando categorías...</option>
                  ) : showErrorCategorias ? (
                    <option>Error al cargar categorías</option>
                  ) : (
                    categoriasModify.map((categoria) => (
                      <option
                        key={categoria.idCategoria}
                        value={categoria.idCategoria}
                      >
                        {categoria.nombreCategoria}
                      </option>
                    ))
                  )}
                </Form.Select>
              </div>
              {errors.idCategoria && (
                <Form.Control.Feedback type="invalid">
                  {errors.idCategoria.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Campos: Cantidad y Precio */}
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="cantidad">
                  <Form.Label>Cantidad</Form.Label>
                  <div className="input-wrapper">
                    <Form.Control
                      type="number"
                      placeholder="Ingrese la cantidad"
                      {...register("cantidad", {
                        required: "La cantidad es obligatoria.",
                        min: {
                          value: 1,
                          message: "La cantidad debe ser mayor a 0.",
                        },
                      })}
                      isInvalid={!!errors.cantidad}
                      className="input-field input-data"
                    />
                    <BsX
                      className="input-icon"
                      onClick={() => setValue("cantidad", "")}
                    />
                  </div>
                  {errors.cantidad && (
                    <Form.Control.Feedback type="invalid">
                      {errors.cantidad.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group controlId="precio">
                  <Form.Label>Precio</Form.Label>
                  <div className="input-wrapper">
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="Ingrese el precio"
                      {...register("precio", {
                        required: "El precio es obligatorio.",
                        min: {
                          value: 0.01,
                          message: "El precio debe ser mayor a 0.",
                        },
                      })}
                      isInvalid={!!errors.precio}
                      className="input-field input-data"
                    />
                    <BsX
                      className="input-icon"
                      onClick={() => setValue("precio", "")}
                    />
                  </div>
                  {errors.precio && (
                    <Form.Control.Feedback type="invalid">
                      {errors.precio.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Switch para control de stock */}
            <Form.Group className="mb-3">
              <Form.Label className="label-title">Control de Stock</Form.Label>
              <div className="d-flex align-items-center">
                <span className="me-2">No</span>
                <Form.Check
                  type="switch"
                  id="controlStock"
                  {...register("controlarStock")}
                />
                <span className="ms-2">Sí</span>
              </div>
            </Form.Group>

            {/* Input de Unidades por Bandeja (solo visible si la categoría es Panadería) */}
            {showUnidadesPorBandeja && (
              <Form.Group className="mb-4">
                <Form.Label className="label-title my-2">
                  Unidades por Bandeja
                  <small className="text-bold" style={{ fontSize: "0.8em" }}>
                    <strong> (Información para producción)</strong>
                  </small>
                </Form.Label>
                <Form.Control
                  className="input-data"
                  type="number"
                  placeholder="Ingrese las unidades por bandeja"
                  {...register("unidadesPorBandeja", {
                    required: "Las unidades por bandeja son obligatorias.",
                    min: {
                      value: 1,
                      message: "Las unidades por bandeja deben ser mayor a 0.",
                    },
                  })}
                  isInvalid={!!errors.unidadesPorBandeja}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.unidadesPorBandeja?.message}
                </Form.Control.Feedback>
              </Form.Group>
            )}
          </Form>
        )}
      </ModalIngreso>

      {/* Resto del código (alertas, popups, etc.) */}
      {filteredProductos.length === 0 &&
        !loadigProducts &&
        !showErrorProductos &&
        showInfoProductos && (
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <Alert
                type="primary"
                message="No hay productos ingresados."
                icon={<BsFillInfoCircleFill />}
              />
            </div>
          </div>
        )}
      {showNoResults && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se encontraron productos que coincidan con la búsqueda."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}
      {showErrorProductos && !showInfoProductos && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar los productos. Intenta más tarde..."
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Confirmar Eliminación"
        message="Al eliminar el producto no se volverá a mostrar en ninguna parte"
        onConfirm={() =>
          handleConfirmDeletePreoducto(
            productoToDelete,
            setProductos,
            setIsPopupOpen,
            setErrorPopupMessage,
            setIsPopupErrorOpen
          )
        }
        onCancel={() => setIsPopupOpen(false)}
      />
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </div>
  );
};

export default ManageProducts;
