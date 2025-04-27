import dayjs from "dayjs";
import { consultarDetalleOrdenPorCriterio } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import { consultarProductosService } from "../../../services/productos/productos.service";
import { ingresarVentaService } from "../../../services/ventas/ventas.service";

// Función para obtener las iniciales de un nombre
export const getInitials = (name) => {
  const words = name.split(" ");
  return words.map((word) => word[0]).join("").toUpperCase();
};

// Function to get a unique color for each product
export const getUniqueColor = (text) => {
  const assignedColors = {}; // Almacena los colores asignados de manera persistente
  
      if (assignedColors[text]) {
          return assignedColors[text]; // Retorna el color si ya está asignado
      }
      // Generar un hash basado en el texto
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
          hash = text.charCodeAt(i) + ((hash << 5) - hash);
      }
      // Convertir el hash en un color hexadecimal
      const color = `#${((hash & 0xFFFFFF) >>> 0).toString(16).padStart(6, '0')}`;
      assignedColors[text] = color;
      return color;
};

// Función para cerrar el modal y redirigir a /ventas
export const handleCloseModal = (navigate) => {
    navigate("/ventas");
};

//funcion para la modificacion de datos ingresados (turno o sucursal)
export const handleModificarDatos = (setValue, setShowModal) => {
  setValue("sucursal", "");
  setValue("turno", "AM");
  setShowModal(true);
};

export const filterProductsByName = (products, searchTerm) => {
  if (!searchTerm) return products;
  return products.filter((producto) =>
    producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
  );
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

// Función para filtrar productos de Panaderia que estén en la orden
const filtrarProductosPanaderia = (productos, detalleOrden) => {
  // Obtener los productos de Panaderia que están en la orden
  const productosPanaderiaEnOrden = detalleOrden
    .filter((item) => item.idCategoria === 1) // Filtrar por categoría 1 (Panaderia)
    .map((item) => ({
      idProducto: item.idProducto,
      cantidadUnidades: item.cantidadUnidades, // Incluir el campo cantidadUnidades
    }));

  return productos.map((producto) => {
    if (producto.idCategoria === 1) {
      // Si es de la categoría "Panaderia", buscar si está en la orden
      const productoEnOrden = productosPanaderiaEnOrden.find(
        (item) => item.idProducto === producto.idProducto
      );

      if (productoEnOrden) {
        // Si está en la orden, agregar el campo cantidadUnidades
        return {
          ...producto,
          cantidadUnidades: productoEnOrden.cantidadUnidades,
        };
      } else {
        // Si no está en la orden, no incluirlo
        return null;
      }
    } else {
      // Incluir todos los productos de otras categorías sin cambios
      return producto;
    }
  }).filter((producto) => producto !== null); // Filtrar los productos nulos (Panaderia no incluidos en la orden)
};

// Función principal para manejar la búsqueda de ventas
export const handleBuscarVentas = async ( setIsLoading, turnoValue, sucursalValue, setOrden, setProductos, setOrdenYProductos, setShowModal, setErrorPopupMessage, setIsPopupErrorOpen, setHasOrdenes ) => {
  setIsLoading(true);
  const today = dayjs().format("YYYY-MM-DD");

  try {
    // Consultar la orden
    const orden = await fetchOrden(turnoValue, today, sucursalValue);

    if (orden.encabezadoOrden !== null) {
      setOrden(orden); // Guardar la orden en el estado
    }else{
      setShowModal(true);
      setHasOrdenes(false);
      return;
    }

    // Consultar los productos
    const productos = await fetchProductos();
    if (productos.length > 0) {
      setProductos(productos); // Guardar los productos en el estado

      let nuevosProductos;


        nuevosProductos = productos;
      

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


// Función para crear el encabezado de la venta
const crearEncabezadoVenta = (idOrdenProduccion, usuario, turnoValue, sucursalValue, fechaActual) => {
  return {
    idOrdenProduccion: idOrdenProduccion, // Usar el idOrdenProduccion correcto
    idUsuario: usuario.idUsuario,
    idSucursal: sucursalValue,
    ventaTurno: turnoValue,
    fechaVenta: fechaActual,
    fechaCreacion: fechaActual,
  };
};

const obtenerUnidadesFrances = (cantidadIngresada) => {
  // Convertir a string por si viene como número
  const valorStr = cantidadIngresada.toString();
  
  // Separar parte entera y decimal
  const partes = valorStr.split('.');
  
  const filaFrances = partes[0] ? parseInt(partes[0], 10) : 0;
  const unidadFrances = partes[1] ? parseInt(partes[1], 10) : 0;

  const francesUnidad = filaFrances * 6;

  const totalUnidadesFrances = francesUnidad + unidadFrances;
  
  return totalUnidadesFrances;
};


// Función para obtener las cantidades ingresadas
const obtenerCantidadesIngresadas = (productos, trayQuantities) => {
  return productos.map((producto) => {
    const cantidadIngresada = trayQuantities[producto.idProducto]?.cantidad || 0; // Si no hay valor, se establece en 0
    return {
      ...producto, // Mantener todas las propiedades del producto original
      cantidadIngresada, // Agregar la cantidad ingresada
    };
  });
};

// Función para crear el detalle de la venta
const crearDetalleVenta = (productos, trayQuantities, orden, fechaActual) => {
  const idOrdenProduccion = orden.encabezadoOrden ? orden.encabezadoOrden.idOrdenProduccion : null;

  // Obtener las cantidades ingresadas para cada producto
  const productosConCantidad = obtenerCantidadesIngresadas(productos, trayQuantities);

  return productosConCantidad
    .map((producto) => {
      const cantidadIngresada = producto.cantidadIngresada; // Usar la cantidad obtenida


        const unidadesFrancesNoVendidas = obtenerUnidadesFrances(cantidadIngresada);
      

      // Solo para la categoría 1 (Panaderia) y si hay idOrdenProduccion
      if (producto.idCategoria === 1 && idOrdenProduccion && producto.controlarStock === 0 && producto.controlarStockDiario === 1) {
        // Verificar si el producto está en la orden
        const productoEnOrden = orden.detalleOrden.some((detalle) => detalle.idProducto === producto.idProducto);

        if (productoEnOrden) {
          return {
            idProducto: producto.idProducto,
            tipoProduccion: producto.tipoProduccion,
            controlarStock: producto.controlarStock,
            controlarStockDiario: producto.controlarStockDiario,
            idCategoria: producto.idCategoria,
            unidadesNoVendidas: producto.idProducto === 1 ? unidadesFrancesNoVendidas : cantidadIngresada, 
            fechaCreacion: fechaActual,
          };
        } else {
          return null; // No se incluye si no está en la orden
        }
      } else {
        // Para otras categorías
          return {
            idProducto: producto.idProducto,
            tipoProduccion: producto.tipoProduccion,
            controlarStock: producto.controlarStock,
            controlarStockDiario: producto.controlarStockDiario,
            idCategoria: producto.idCategoria,
            unidadesNoVendidas: cantidadIngresada, 
            fechaCreacion: fechaActual,
          };
      }
    })
    .filter(Boolean); // Filtrar elementos nulos (productos no incluidos)
};

const crearPayloadDetalleIngreso = (montoTotalIngresado, fechaActual) => {
  const detalleingreso = {
    montoTotalIngresado: montoTotalIngresado,
    fechaIngreso: fechaActual,
  }

  return detalleingreso;
}


// IngresarVenta.utils.js
export const handleGuardarVenta = async (setIsLoading, orden, sucursalValue, usuario, productos, trayQuantities, setShowSalesSummary, navigate, setErrorPopupMessage, setIsPopupErrorOpen, setIsPopupSuccessOpen, reset, setTrayQuantities, ventaReal, turnoValue) => {
  setIsLoading(true);

  const fechaActual = dayjs().format("YYYY-MM-DD");

  // Acceder al idOrdenProduccion desde encabezadoOrden
  const idOrdenProduccion = orden.encabezadoOrden ? orden.encabezadoOrden.idOrdenProduccion : null;

  // Crear el encabezado de la venta
  const encabezadoVenta = crearEncabezadoVenta(idOrdenProduccion, usuario, turnoValue, sucursalValue, fechaActual);

  // Crear el detalle de la venta
  const detalleVenta = crearDetalleVenta(productos, trayQuantities, orden, fechaActual);

  const detalleIngreso = crearPayloadDetalleIngreso(ventaReal, fechaActual); 

  // Construir el payload
  const payload = {
    encabezadoVenta,
    detalleVenta,
    detalleIngreso,
  };

  try {
    const resIngrearVenta = await ingresarVentaService(payload);
    if(resIngrearVenta.status === 200){
      setTrayQuantities([])
      reset();
      setIsPopupSuccessOpen(true);
    }
  } catch (error) {
    if (error.status === 422) {
      setErrorPopupMessage("Has ingresado más unidades restantes que las producidas en algún producto");
    }else{
      setErrorPopupMessage("Error al guardar la venta. Intente nuevamente.");
    }
    setIsPopupErrorOpen(true);
  }finally{
    setShowSalesSummary(false); // Cerrar el modal después de guardar o en algun error
    setIsLoading(false);
  }
};