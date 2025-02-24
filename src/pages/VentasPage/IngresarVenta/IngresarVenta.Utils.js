import dayjs from "dayjs";
import { consultarDetalleOrdenPorCriterio } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import { consultarProductosService } from "../../../services/productos/productos.service";


// Función para cerrar el modal y redirigir a /ventas
export const handleCloseModal = (navigate) => {
    navigate("/ventas");
};


// Función para consultar la orden
const fetchOrden = async (turnoValue, today, sucursalValue) => {
  const resOrden = await consultarDetalleOrdenPorCriterio(turnoValue, today, sucursalValue);
  return resOrden.status === 200 ? resOrden.orden : null;
};

// Función para consultar los productos
const fetchProductos = async () => {
  const resProductos = await consultarProductosService();
  return resProductos.status === 200 ? resProductos.preciosProductos : [];
};

// Función para filtrar productos de Panadería que estén en la orden
const filtrarProductosPanaderia = (productos, detalleOrden) => {
  const productosPanaderiaEnOrden = detalleOrden
    .filter((item) => item.idCategoria === 1) // Filtrar por categoría 1 (Panadería)
    .map((item) => item.idProducto); // Obtener solo los IDs de los productos

  return productos.filter((producto) => {
    if (producto.idCategoria === 1) {
      // Si es de la categoría "Panadería", solo incluir si está en la orden
      return productosPanaderiaEnOrden.includes(producto.idProducto);
    } else {
      // Incluir todos los productos de otras categorías
      return true;
    }
  });
};

// Función principal para manejar la búsqueda de ventas
export const handleBuscarVentas = async ( setIsLoading, turnoValue, sucursalValue, setOrden, setProductos, setOrdenYProductos, setShowModal, setErrorPopupMessage, setIsPopupErrorOpen ) => {
  setIsLoading(true);
  const today = dayjs().format("YYYY-MM-DD");

  try {
    // Consultar la orden
    const orden = await fetchOrden(turnoValue, today, sucursalValue);
    if (orden) {
      setOrden(orden); // Guardar la orden en el estado
    }

    // Consultar los productos
    const productos = await fetchProductos();
    if (productos.length > 0) {
      setProductos(productos); // Guardar los productos en el estado

      let nuevosProductos;

      // Verificar si existe una orden y si tiene detalles
      if (orden && orden.detalleOrden && orden.detalleOrden.length > 0) {
        // Filtrar productos de la categoría "Panadería" que estén en la orden
        nuevosProductos = filtrarProductosPanaderia(productos, orden.detalleOrden);
      } else {
        // Si no hay orden, devolver todos los productos
        nuevosProductos = productos;
      }

      // Guardar el nuevo conjunto de datos en el estado
      setOrdenYProductos(nuevosProductos);
    }

    setShowModal(false); // Cerrar el modal después de la búsqueda
  } catch (error) {
    setErrorPopupMessage("Hubo un error al consultar los recursos");
    setIsPopupErrorOpen(true);
  } finally {
    setIsLoading(false);
  }
};