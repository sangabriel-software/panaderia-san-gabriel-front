import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useGetProductosYPrecios } from "../../../hooks/productosprecios/useGetProductosYprecios";
import { checkForChanges, handleConfirmDeletePreoducto, handleDeleleProducto, handleUpdateProduct, useCategoriasYFiltrado, useSerchPrductos, resetFormToInitialValues, useProductFormSetup, useCheckFormChanges, useSwitchExclusivity, handleModify, handleCloseModal } from "./ManageProductsUtils";
import SearchInput from "../../../components/SerchInput/SerchInput";
import Title from "../../../components/Title/Title";
import CardProductos from "../../../components/CardProductos/CardPoductos";
import { useNavigate } from "react-router";
import Alert from "../../../components/Alerts/Alert";
import { BsExclamationTriangleFill, BsFillInfoCircleFill, BsX } from "react-icons/bs";
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import ModalIngreso from "../../../components/ModalGenerico/Modal";
import { Form, Row, Col } from "react-bootstrap";
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import "./ManageProducts.css";
import AddButton from "../../../components/AddButton/AddButton";

const ManageProducts = () => {
  const { productos, loadigProducts, showErrorProductos, showInfoProductos, setProductos, } = useGetProductosYPrecios();
  const { filteredProductos, searchQuery, showNoResults, handleSearch } = useSerchPrductos(productos);
  const { categorias, filteredByCategory, selectedCategory, setSelectedCategory, } = useCategoriasYFiltrado(productos, filteredProductos);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [initialProductValues, setInitialProductValues] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  const { categorias: categoriasModify, loadingCategorias, showErrorCategorias, showInfoCategorias } = useGetCategorias();
  const [loadingModificar, setLoadingModificar] = useState(false);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();  // React Hook Form

  // Estado para controlar la visibilidad de los controles de Panadería
  const [isPanaderia, setIsPanaderia] = useState(false);
  const [tipoProduccion, setTipoProduccion] = useState("bandejas");

  // Observar todos los valores relevantes
  const formValues = watch();
  const controlStock = watch("controlStock") === 1; 
  const stockDiario = watch("stockDiario") === 1;

  // Custom hooks para manejar la lógica del formulario
  useProductFormSetup(selectedProduct, setValue, reset, setIsPanaderia, setTipoProduccion, setInitialProductValues);
  useCheckFormChanges(selectedProduct, initialProductValues, formValues, isPanaderia, setHasChanges);
  useSwitchExclusivity(controlStock, stockDiario, setValue, setHasChanges);


  // Función para guardar los cambios del producto
  const onSubmit = async (data) => {
    handleUpdateProduct( data, selectedProduct, setProductos, setShowModifyModal, setSelectedProduct, setInitialProductValues, setHasChanges, setErrorPopupMessage, setIsPopupErrorOpen, setLoadingModificar);
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
                onModify={() => handleModify(producto, setSelectedProduct, setShowModifyModal, reset, setIsPanaderia, setTipoProduccion, setInitialProductValues, setHasChanges)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal para modificación de productos */}
      <ModalIngreso
        show={showModifyModal}
        onHide={() => {handleCloseModal(resetFormToInitialValues, setShowModifyModal)}}
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
                  defaultValue={selectedProduct.nombreProducto}
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
                      defaultValue={selectedProduct.idCategoria}
                      {...register("idCategoria", {
                        required: "La categoría es obligatoria.",
                      })}
                      isInvalid={!!errors.idCategoria}
                      className="input-field input-data"
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setValue("idCategoria", newValue);
                        const isNowPanaderia = newValue == 1;
                        setIsPanaderia(isNowPanaderia);
                        
                        // Cambio clave aquí: establecer "bandejas" como valor por defecto si es Panadería
                        if (isNowPanaderia) {
                          setTipoProduccion("bandejas");
                          setValue("tipoProduccion", "bandejas");
                        } else {
                          setTipoProduccion(null);
                          setValue("tipoProduccion", null);
                        }
                        
                        setHasChanges(checkForChanges(watch(), initialProductValues));
                      }}
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
                      defaultValue={selectedProduct.cantidad}
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
                      defaultValue={selectedProduct.precio}
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

            {/* Sección específica para Panadería */}
            {isPanaderia && (
              <>
                <div className="mb-3">
                  <h6 className="label-title">Configuración para Producción y Stock</h6>
                </div>

                {/* Controles de stock en una fila */}
                <Row className="mb-3">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="label-title">Control de Stock</Form.Label>
                      <div className="d-flex align-items-center">
                        <span className="me-2">No</span>
                        <Form.Check
                          type="switch"
                          id="controlStock"
                          checked={controlStock}
                          onChange={(e) => {
                            setValue("controlStock", e.target.checked ? 1 : 0);
                            setHasChanges(true);
                          }}
                          disabled={stockDiario}
                        />
                        <span className="ms-2">Sí</span>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="label-title">Stock Diario</Form.Label>
                      <div className="d-flex align-items-center">
                        <span className="me-2">No</span>
                        <Form.Check
                          type="switch"
                          id="stockDiario"
                          checked={stockDiario}
                          onChange={(e) => {
                            setValue("stockDiario", e.target.checked ? 1 : 0);
                            setHasChanges(true);
                          }}
                          disabled={controlStock}
                        />
                        <span className="ms-2">Sí</span>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Selector de tipo de producción */}
                <Form.Group className="mb-3">
                  <Form.Label className="label-title">Tipo de Producción</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Check
                      type="radio"
                      id="bandejas"
                      label="Bandejas"
                      value="bandejas"
                      checked={tipoProduccion === "bandejas"}
                      onChange={() => {
                        setTipoProduccion("bandejas");
                        setValue("tipoProduccion", "bandejas");
                        setHasChanges(true);
                      }}
                      className="me-3 tipoProd"
                    />
                    <Form.Check
                      className="tipoProd"
                      type="radio"
                      id="harina"
                      label="Harina"
                      value="harina"
                      checked={tipoProduccion === "harina"}
                      onChange={() => {
                        setTipoProduccion("harina");
                        setValue("tipoProduccion", "harina");
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </Form.Group>

                {/* Input para unidades por bandeja */}
                {tipoProduccion === "bandejas" && (
                  <Form.Group className="mb-3">
                    <Form.Label className="label-title">Unidades por Bandeja</Form.Label>
                    <Form.Control
                    className="input-data"
                    type="number"
                    placeholder="Ingrese las unidades por bandeja"
                    defaultValue={selectedProduct.unidadesPorBandeja || ''}
                    {...register("unidadesPorBandeja", {
                      required: tipoProduccion === "bandejas" ? "Las unidades por bandeja son obligatorias." : false,
                      min: {
                        value: 1,
                        message: "Las unidades por bandeja deben ser mayor a 0.",
                      },
                    })}
                    isInvalid={!!errors.unidadesPorBandeja}
                    onChange={(e) => {
                      setValue("unidadesPorBandeja", e.target.value);
                      setHasChanges(checkForChanges(watch(), initialProductValues));
                    }}
                  />
                    <Form.Control.Feedback type="invalid">
                      {errors.unidadesPorBandeja?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}
              </>
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