import React, { useState, useEffect } from "react";
import { useGetProductosYPrecios } from "../../../hooks/productosprecios/useGetProductosYprecios";
import {
  useCategoriasYFiltrado,
  useSerchPrductos,
} from "./ManageProductsUtils";
import CreateButton from "../../../components/CreateButton/CreateButton";
import SearchInput from "../../../components/SerchInput/SerchInput";
import Title from "../../../components/Title/Title";
import CardProductos from "../../../components/CardProductos/CardPoductos";
import { useNavigate } from "react-router";
import Alert from "../../../components/Alerts/Alert";
import {
  BsExclamationTriangleFill,
  BsFillInfoCircleFill,
} from "react-icons/bs";
import {
  handleConfirmDeletePreoducto,
  handleDeleleProducto,
} from "../IngresarProductos/IngresarProductosUtils";
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import ModalIngreso from "../../../components/ModalGenerico/Modal"; // Importa el modal
import { Form } from "react-bootstrap"; // Para los inputs del modal
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";

const ManageProducts = () => {
  const {
    productos,
    loadigProducts,
    showErrorProductos,
    showInfoProductos,
    setProductos,
  } = useGetProductosYPrecios(); // Consultar productos
  const { filteredProductos, searchQuery, showNoResults, handleSearch } =
    useSerchPrductos(productos); // Búsqueda local
  const {
    categorias,
    filteredByCategory,
    selectedCategory,
    setSelectedCategory,
  } = useCategoriasYFiltrado(productos, filteredProductos); // Filtrar por categorías
  const [productoToDelete, setProductoToDelete] = useState(null); // Setea el id a eliminar
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para el popup de confirmación
  const [errorPopupMessage, setErrorPopupMessage] = useState(false); // Setea el mensaje a mostrar
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false); // Estado para el popup de errores
  const [showModifyModal, setShowModifyModal] = useState(false); // Estado para mostrar el modal de modificación
  const [selectedProduct, setSelectedProduct] = useState(null); // Estado para almacenar el producto seleccionado
  const [initialProductValues, setInitialProductValues] = useState(null); // Estado para almacenar los valores iniciales
  const [hasChanges, setHasChanges] = useState(true); // Estado para detectar cambios
  const navigate = useNavigate();
  const {
    categorias: categoriasModify,
    loadingCategorias,
    showErrorCategorias,
    showInfoCategorias,
  } = useGetCategorias();

  const [loadingModificar, setLoadingModificar] = useState(false);

  // Función para manejar el clic en el botón "Modificar"
  const handleModifyClick = (producto) => {
    setSelectedProduct(producto); // Guarda el producto seleccionado
    setInitialProductValues({ ...producto }); // Guarda los valores iniciales
    setShowModifyModal(true); // Abre el modal de modificación
    setHasChanges(false); // Reinicia el estado de cambios
  };

  // Función para verificar cambios en los campos
  const checkForChanges = () => {
    if (!selectedProduct || !initialProductValues) return;

    const hasChangesDetected =
      selectedProduct.nombreProducto !== initialProductValues.nombreProducto ||
      Number(selectedProduct.idCategoria) !==
        Number(initialProductValues.idCategoria) ||
      Number(selectedProduct.cantidad) !==
        Number(initialProductValues.cantidad) ||
      Number(selectedProduct.precio) !== Number(initialProductValues.precio);

    setHasChanges(hasChangesDetected);
  };

  // Efecto para verificar cambios cada vez que se modifica el producto seleccionado
  useEffect(() => {
    checkForChanges();
  }, [selectedProduct]);

  // Función para guardar los cambios del producto
  const handleSaveChanges = async () => {
    if (!selectedProduct || !hasChanges) return;

    try {
      // Aquí iría la lógica para actualizar el producto en el backend
      const response = await fetch(
        `http://localhost:300/api/productos/${selectedProduct.idProducto}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedProduct),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el producto.");
      }

      // Actualiza la lista de productos localmente
      const updatedProductos = productos.map((p) =>
        p.idProducto === selectedProduct.idProducto ? selectedProduct : p
      );
      setProductos(updatedProductos);

      // Cierra el modal
      setShowModifyModal(false);
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      setErrorPopupMessage(
        "No se pudo actualizar el producto. Inténtalo de nuevo."
      );
      setIsPopupErrorOpen(true);
    }
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
        <div className="col-12 col-md-3 mb-2 mb-md-0">
          <CreateButton
            onClick={() => navigate("/productos/ingresar-producto")}
          />
        </div>
        <div className="col-12 col-md-6">
          <SearchInput
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
                onDelete={() =>
                  handleDeleleProducto(
                    producto.idProducto,
                    setProductoToDelete,
                    setIsPopupOpen
                  )
                }
                onModify={() => handleModifyClick(producto)} // Pasa la función para modificar
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
        onConfirm={handleSaveChanges}
        confirmText="Modificar"
        confirmDisabled={!hasChanges} // Desactiva el botón si no hay cambios
        isLoading={loadingModificar}
      >
        {selectedProduct && (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Producto</Form.Label>
              <Form.Control
                type="text"
                value={selectedProduct.nombreProducto}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    nombreProducto: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                as="select"
                value={selectedProduct.idCategoria}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    idCategoria: Number(e.target.value), // Convertir a número
                  })
                }
              >
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
              </Form.Control>
            </Form.Group>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    value={selectedProduct.cantidad}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        cantidad: Number(e.target.value), // Convertir a número
                      })
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Precio</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={selectedProduct.precio}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        precio: Number(e.target.value), // Convertir a número
                      })
                    }
                  />
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
