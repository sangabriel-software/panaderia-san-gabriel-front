import React, { useState, useMemo } from "react";
import { useGetProductosYPrecios } from "../../../hooks/productosprecios/useGetProductosYprecios";
import { useSerchPrductos } from "./ManageProductsUtils";
import CreateButton from "../../../components/CreateButton/CreateButton";
import SearchInput from "../../../components/SerchInput/SerchInput";
import Title from "../../../components/Title/Title";
import CardProductos from "../../../components/CardProductos/CardPoductos";
import { useNavigate } from "react-router";

const ManageProducts = () => {
  const { productos, loadigProducts, showErrorProductos, showInfoProductos } = useGetProductosYPrecios();
  const { filteredProductos, searchQuery, showNoResults, handleSearch } = useSerchPrductos(productos);
  const navigate = useNavigate()
  
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const categorias = useMemo(() => {
    const categoriasSet = new Set(productos.map((p) => p.nombreCategoria));
    return ["Todas", ...categoriasSet];
  }, [productos]);

  const filteredByCategory = useMemo(() => {
    return selectedCategory === "Todas"
      ? filteredProductos
      : filteredProductos.filter((p) => p.nombreCategoria === selectedCategory);
  }, [filteredProductos, selectedCategory]);

  if (loadigProducts) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="container">
      <Title title="Productos" description="Administración de productos existentes" />

      <div className="row mb-4">
        <div className="col-12 col-md-3 mb-2 mb-md-0">
          <CreateButton onClick={() => navigate("/productos/crear-producto")} />
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
          <select className="form-control input-data" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          {filteredByCategory.map((producto) => (
            <div key={producto.idProducto} className="col-xs-12 col-12 col-lg-6 mb-4">
              <CardProductos
                id={producto.idProducto}
                nombreProducto={producto.nombreProducto}
                cantidad={producto.cantidad}
                precio={producto.precio}
                image=""
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
