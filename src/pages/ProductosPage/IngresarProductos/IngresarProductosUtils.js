import { ingresarPrecioProducto, ingresarProducto } from "../../../services/productos/productos.service"
import { currentDate } from "../../../utils/dateUtils"
import { capitalizeFirstLetter } from "../../../utils/utils"

/* Funcion para crear paylod datos de productos */
export const crearPayloadProducto = (data) => {

  const idCategoria = Number(data.idCategoria);
  const unidadesPorBandeja = Number(data.unidadesPorBandeja);
  const badejasUnidades = (idCategoria === 1) ? unidadesPorBandeja : null;   // Determinar bandejasUnidades basado en la categoría
  const tipoProduccion = data.tipoProduccion === "bandejas" ? 0 : 1;

  const productoPayload = {  // Crear el payload del producto
    nombreProducto: capitalizeFirstLetter(data.nombreProducto),
    idCategoria: idCategoria, 
    controlarStock: data.controlStock,
    controlarStockDiario: data.stockDiario,
    tipoProduccion: tipoProduccion, 
    fechaCreacion: currentDate(),
    ...(badejasUnidades !== null && { unidadesPorBandeja: badejasUnidades }) // Agregar solo si no es null
  };

  return productoPayload;
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

/* Funcion para crear paylod para ingreso de imagen */
export const crearPayloadProductoImagen = (idProducto, imagen) => {
    const imagenProductoPayload = {
        idProducto: idProducto,
        imagenB64: imagen,
        fechaCreacion: currentDate()
    }

    return imagenProductoPayload;

}

// Función para resetear el formulario
export const resetForm = (reset) => {
  reset(); // Limpia los campos del formulario
};


/* Funcion para ingreso de productos */
export const handleIngresarProductoSubmit = async (data, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setIsLoading, reset) => {
  setIsLoading(true); // Activar el loading del input
    try {
      let resIngresoProducto;
  
      // Crea el payload del producto y lo envía
      const payloadProducto = crearPayloadProducto(data);

      resIngresoProducto = await ingresarProducto(payloadProducto);
  
      if (resIngresoProducto.status === 201) {
        // Crea el payload del precio y lo envía
        const payloadPrecio = crearPayloadPrecioProducto(data, resIngresoProducto.idProducto);
        const resIngresoPrecio = await ingresarPrecioProducto(payloadPrecio);
  
        // Muestra el popup de éxito y limpia el formulario
        reset()
        setIsPopupOpen(true);
        resetForm(reset);
      }
    } catch (error) {
      if (error.status === 409) {
        setErrorPopupMessage("Ya existe un producto con el nombre ingresado.");
        setIsPopupErrorOpen(true);
      } else {
        setErrorPopupMessage("Hubo un error al ingresar el producto. Inténtelo de nuevo.");
        setIsPopupErrorOpen(true);
      }
    } finally {
      setIsLoading(false); // Desactivar el loading del input
    }
  };
  