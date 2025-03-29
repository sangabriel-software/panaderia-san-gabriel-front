import { useEffect, useState, useMemo} from "react";
import { actualizarPrecioProductoSevice, actualizarProductoSevice, desactivarProductosService } from "../../../services/productos/productos.service";
import { capitalizeFirstLetter } from "../../../utils/utils";
import { currentDate } from "../../../utils/dateUtils";

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

/* Elminacion de productos*/
export const handleDeleleProducto = (idProducto, setProductoToDelete, setIsPopupOpen) => {
  setProductoToDelete(idProducto);
  setIsPopupOpen(true);
}

  /* funcion para ejcutar la logica de eliminacion de producto */
export const handleConfirmDeletePreoducto = async (productoToDelete, setProducto, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen ) => {
  try{

      if (productoToDelete) {
        const resDelete = await desactivarProductosService(productoToDelete);

        if (resDelete.status === 200) {
            setProducto((prevProductos) => prevProductos.filter(producto => producto.idProducto !== productoToDelete));
          setIsPopupOpen(false); 
        }
      }else{

      }
    }catch(error){
      if(error.status === 409 && error.data.error.code === 402){
        setIsPopupOpen(false); 
        setErrorPopupMessage(`Para elminar el rol debe elminar los usuarios al que esta relacionado`);
        setIsPopupErrorOpen(true);
      }

    }
  };

  // Función para manejar el clic en el botón "Modificar"
//  export const handleModifyClick = (producto, setSelectedProduct, setInitialProductValues, setShowModifyModal, reset, setHasChanges, watch ) => {
//     setSelectedProduct(producto); // Guarda el producto seleccionado
//     setInitialProductValues({ ...producto }); // Guarda los valores iniciales
//     setShowModifyModal(true); // Abre el modal de modificación
//     reset(producto); // Resetea el formulario con los valores del producto seleccionado
//     setHasChanges(false); // Reinicia el estado de cambios
//   };

    // Función para verificar cambios en los campos
export const checkForChanges = (currentValues, initialProductValues) => {
  if (!initialProductValues) return false;

  // Comparación más robusta que maneja valores undefined/null
  const compare = (a, b) => {
    if (a === undefined || b === undefined) return false;
    if (a === null || b === null) return false;
    return Number(a) !== Number(b);
    };

    return (
      currentValues.nombreProducto !== initialProductValues.nombreProducto ||
      compare(currentValues.idCategoria, initialProductValues.idCategoria) ||
      compare(currentValues.cantidad, initialProductValues.cantidad) ||
      compare(currentValues.precio, initialProductValues.precio) ||
      compare(currentValues.controlStock, initialProductValues.controlarStock) ||
      compare(currentValues.unidadesPorBandeja, initialProductValues.unidadesPorBandeja) ||
      compare(currentValues.tipoProduccion, initialProductValues.tipoProduccion)
    );
};


  /* Funcion para crear paylod datos de productos */
  export const crearPayloadProducto = (data, selectedProduct) => {

    try{
      const idCategoria = Number(data.idCategoria);
      const unidadesPorBandeja = Number(data.unidadesPorBandeja);
      const badejasUnidades = (idCategoria === 1) ? unidadesPorBandeja : null;   // Determinar bandejasUnidades basado en la categoría
      //determinar tipo produccion
      let tipoProduccion
      if(idCategoria === 1){
        tipoProduccion = data.tipoProduccion;
      }else{
        tipoProduccion = "Otros";
      }
    
      //determinar control stock 
      let controlStock;
      if(idCategoria === 1){
        controlStock = data.controlStock;
      }else{
        controlStock = 1;
      }
    
      const productoPayload = {  // Crear el payload del producto
        idProducto: selectedProduct.idProducto,
        nombreProducto: capitalizeFirstLetter(data.nombreProducto),
        idCategoria: idCategoria, 
        controlarStock: controlStock,
        controlarStockDiario: data.stockDiario,
        tipoProduccion: tipoProduccion, 
        fechaCreacion: currentDate(),
        ...(badejasUnidades !== null && { unidadesPorBandeja: badejasUnidades }) // Agregar solo si no es null
      };

      return productoPayload;

    }catch(error){
      throw error;
    }
  };

/* Funcion para crar payload de ingreso de precio de productos */
export const crearPayloadPrecioProducto = (data, idProducto) => {
    const precioProductoPayload = {
        idProducto,
        cantidad: data.cantidad,
        precio: data.precio,
        precioPorUnidad: data.precio / data.cantidad,
        fechaInicio: currentDate(),
        fechaFin: data.fechaFin || null
    }

    return precioProductoPayload;
}


  // Función para manejar la actualización del producto
  export const handleUpdateProduct = async ( data, selectedProduct, setProductos, setShowModifyModal, setSelectedProduct, setInitialProductValues, setHasChanges, setErrorPopupMessage, setIsPopupErrorOpen, setLoadingModificar ) => {
    // if (!data || !selectedProduct) return;
    setLoadingModificar(true);

    try {
      const payloaUpdate = crearPayloadProducto(data, selectedProduct);
      
      // Actualiza el producto en el servidor
      const resProdActualizado = await actualizarProductoSevice(payloaUpdate);

      if (resProdActualizado.status === 200) {
        // Actualiza el precio del producto en el servidor

         const preciosUpdatePayload = crearPayloadPrecioProducto(data, selectedProduct.idProducto);
        const resPrecioActualizado = await actualizarPrecioProductoSevice(preciosUpdatePayload);

        // Actualiza el estado local con el producto modificado
        setProductos((prevProductos) =>
          prevProductos.map((producto) =>
            producto.idProducto === selectedProduct.idProducto
              ? { ...producto, ...data } // Reemplaza los datos del producto con los nuevos
              : producto
          )
        );

        // Cierra el modal y limpia los estados
        setShowModifyModal(false);
        setSelectedProduct(null);
        setInitialProductValues(null);
        setHasChanges(false);
      }
    } catch (error) {
      setShowModifyModal(false);
      setErrorPopupMessage("No se pudo actualizar el producto. Inténtalo de nuevo.");
      setIsPopupErrorOpen(true);
    } finally {
      setLoadingModificar(false);
    }
  };