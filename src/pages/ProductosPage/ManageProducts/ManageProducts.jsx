import React, { useState, useMemo } from "react";
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

const ManageProducts = () => {
  const {
    productos,
    loadigProducts,
    showErrorProductos,
    showInfoProductos,
    setProductos,
  } = useGetProductosYPrecios(); //Consultar productos
  const { filteredProductos, searchQuery, showNoResults, handleSearch } =
    useSerchPrductos(productos); //Busqueda local
  const {
    categorias,
    filteredByCategory,
    selectedCategory,
    setSelectedCategory,
  } = useCategoriasYFiltrado(productos, filteredProductos); //filtrar por categorias
  const [productoToDelete, setProductoToDelete] = useState(null); // Setea el id a eliminar
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para el popup de confirmacion
  const [errorPopupMessage, setErrorPopupMessage] = useState(false); // Setea el mensaje a mostrar
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false); // Estado para el popup de errores
  const navigate = useNavigate();

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
              />
            </div>
          ))}
        </div>
      </div>

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

      {/* Confirmación personalizada */}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)} // Cierra el popup
        title="Confirmar Eliminación"
        message="Al eliminar el producto no se volvera a mostrar en ninguna parte"
        onConfirm={() =>
          handleConfirmDeletePreoducto(
            productoToDelete,
            setProductos,
            setIsPopupOpen,
            setErrorPopupMessage,
            setIsPopupErrorOpen
          )
        }
        onCancel={() => setIsPopupOpen(false)} // cierra el popup
      />

      {/* Componente error PopUp */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)} // Cierra el popup
        title="¡Error!"
        message={errorPopupMessage}
      />
    </div>
  );
};

export default ManageProducts;
