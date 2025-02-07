import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetProductosYPrecios } from "../../../hooks/productosprecios/useGetProductosYprecios";
import { checkForChanges, handleConfirmDeletePreoducto, handleDeleleProducto, handleModifyClick, handleUpdateProduct, useCategoriasYFiltrado, useSerchPrductos } from "./ManageProductsUtils";
import CreateButton from "../../../components/CreateButton/CreateButton";
import SearchInput from "../../../components/SerchInput/SerchInput";
import Title from "../../../components/Title/Title";
import CardProductos from "../../../components/CardProductos/CardPoductos";
import { useNavigate } from "react-router";
import Alert from "../../../components/Alerts/Alert";
import { BsExclamationTriangleFill, BsFillInfoCircleFill, BsX } from "react-icons/bs";
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import ModalIngreso from "../../../components/ModalGenerico/Modal";
import { Form } from "react-bootstrap";
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import "./ManageProducts.css";

const ManageProducts = () => {
  const { productos, loadigProducts, showErrorProductos, showInfoProductos, setProductos } = useGetProductosYPrecios();
  const { filteredProductos, searchQuery, showNoResults, handleSearch } = useSerchPrductos(productos);
  const { categorias, filteredByCategory, selectedCategory, setSelectedCategory } = useCategoriasYFiltrado(productos, filteredProductos);
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

  // React Hook Form
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  // Efecto para verificar cambios cada vez que se modifica el formulario
  useEffect(() => {
    checkForChanges(selectedProduct, initialProductValues, setHasChanges, watch);
  }, [watch()]);

  // Función para guardar los cambios del producto
  const onSubmit = async (data) => {
    handleUpdateProduct( data, selectedProduct, setProductos, setShowModifyModal, setSelectedProduct, setInitialProductValues,
                         setHasChanges, setErrorPopupMessage, setIsPopupErrorOpen, setLoadingModificar );
  };

  if (loadigProducts) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="container">
      <Title title="Productos" description="Administración de productos existentes" />
      <div className="row mb-4">
        <div className="col-12 col-md-3 mb-2 mb-md-0">
          <CreateButton onClick={() => navigate("/productos/ingresar-producto")} />
        </div>
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
                onDelete={() => handleDeleleProducto( producto.idProducto, setProductoToDelete, setIsPopupOpen )}
                onModify={() => handleModifyClick( producto, setSelectedProduct, setInitialProductValues, setShowModifyModal, reset, setHasChanges ) }
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
            <div className="row gx-2">
              <div className="col-6 mb-3">
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
              </div>
              <div className="col-6 mb-3">
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
              </div>
            </div>
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
