// useCategoriasActivas.js
import { useEffect, useState } from "react";

export const useCategoriasActivas = (ordenYProductos) => {
  const [activeCategory, setActiveCategory] = useState("");
  const [categorias, setCategorias] = useState([]);

  // Obtener las categorías únicas de los productos
  useEffect(() => {
    const categoriasUnicas = [...new Set(ordenYProductos.map((p) => p.nombreCategoria))];
    setCategorias(categoriasUnicas);

    // Establecer la primera categoría como activa si no hay una seleccionada
    if (categoriasUnicas.length > 0 && !activeCategory) {
      setActiveCategory(categoriasUnicas[0]);
    }
  }, [ordenYProductos, activeCategory]);

  return {
    activeCategory,
    setActiveCategory,
    categorias,
  };
};