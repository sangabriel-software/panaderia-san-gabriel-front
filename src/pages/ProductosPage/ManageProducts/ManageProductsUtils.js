import { useEffect, useState, useMemo} from "react";

/* Consulta interna par la pagina de roles Busqueda de usuarios*/
export const useSerchPrductos = (productos) => {
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNoResults, setShowNoResults] = useState(false);

  // Sincroniza los roles iniciales
  useEffect(() => {
    setFilteredProductos(productos);
  }, [productos]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = productos.filter((producto) =>
        producto.nombreProducto.toLowerCase().includes(query)
    );
    setFilteredProductos(filtered);

    setShowNoResults(filtered.length === 0 && query.length > 0);
  };

  return {
    filteredProductos,
    searchQuery,
    showNoResults,
    handleSearch,
  };
};

export const useCategoriasYFiltrado = (productos, filteredProductos) => {
  const [selectedCategory, setSelectedCategory] = useState("Todas las Categorias");

  // Generar lista de categorías (incluyendo "Todas las Categorias")
  const categorias = useMemo(() => {
    const categoriasSet = new Set(productos.map((p) => p.nombreCategoria));
    return ["Todas las Categorias", ...categoriasSet];
  }, [productos]);

  // Filtrar productos por categoría seleccionada
  const filteredByCategory = useMemo(() => {
    return selectedCategory === "Todas las Categorias"
      ? filteredProductos
      : filteredProductos.filter((p) => p.nombreCategoria === selectedCategory);
  }, [filteredProductos, selectedCategory]);

  return { categorias, filteredByCategory, selectedCategory, setSelectedCategory };
};


  // Función para manejar el clic en el botón "Modificar"
 export const handleModifyClick = (producto, setSelectedProduct, setInitialProductValues, setShowModifyModal, reset, setHasChanges ) => {
    setSelectedProduct(producto); // Guarda el producto seleccionado
    setInitialProductValues({ ...producto }); // Guarda los valores iniciales
    setShowModifyModal(true); // Abre el modal de modificación
    reset(producto); // Resetea el formulario con los valores del producto seleccionado
    setHasChanges(false); // Reinicia el estado de cambios
  };

    // Función para verificar cambios en los campos
  export  const checkForChanges = (selectedProduct, initialProductValues, setHasChanges, watch ) => {
      if (!selectedProduct || !initialProductValues) return;
  
      const currentValues = watch(); // Obtiene los valores actuales del formulario
      const hasChangesDetected =
        currentValues.nombreProducto !== initialProductValues.nombreProducto ||
        Number(currentValues.idCategoria) !==
        Number(initialProductValues.idCategoria) ||
        Number(currentValues.cantidad) !==
        Number(initialProductValues.cantidad) ||
        Number(currentValues.precio) !== Number(initialProductValues.precio);
  
      setHasChanges(hasChangesDetected);
    };