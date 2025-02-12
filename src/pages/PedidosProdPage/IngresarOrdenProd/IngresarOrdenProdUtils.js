import dayjs from "dayjs";
import { ingresarOrdenProduccionService } from "../../../services/ordenesproduccion/ordenesProduccion.service";


export const getInitials = (name) => {
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.toUpperCase();
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



const crearPyaloadOrdenProduccion = (data, trayQuantities) => {
  const detalleOrden = Object.entries(trayQuantities)
    .filter(([_, cantidad]) => cantidad > 0)
    .map(([idProducto, cantidad]) => ({
      idProducto: Number(idProducto),
      cantidadBandejas: cantidad,
      fechaCreacion: dayjs().format("YYYY-MM-DD"),
    }));

  if (detalleOrden.length === 0) {
    return null;
  }

  return {
    encabezadoOrden: {
      idSucursal: Number(data.sucursal),
      ordenTurno: data.turno,
      nombrePanadero: data.nombrePanadero,
      fechaAProducir: dayjs(data.fechaAProducir).format("YYYY-MM-DD"),
      idUsuario: 1, // Se asume que el usuario está logueado
      fechaCreacion: dayjs().format("YYYY-MM-DD"),
    },
    detalleOrden,
  };
};

/* Funcion para ingreso de productos */
export const handleIngresarOrdenProduccionSubmit = async ( data, trayQuantities, setTrayQuantities, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setIsLoading, reset ) => {
  setIsLoading(true); // Activar el loading del input
  try {
    if (trayQuantities.length === 0 || Object.keys(trayQuantities).length === 0){
      setErrorPopupMessage(
        "Ingresar la cantidad de productos para al menos un producto."
      );
      return;
    }

    setErrorPopupMessage("");
    const payload = crearPyaloadOrdenProduccion(data, trayQuantities);
    const resIngresoOrden = await ingresarOrdenProduccionService(payload);
    if (resIngresoOrden.status === 200) {
        console.log("exito");
      reset();
      setTrayQuantities([])
      setIsPopupOpen(true);
    }
  } catch (error) {
    setErrorPopupMessage(
      "Hubo un error al ingresar el producto. Inténtelo de nuevo."
    );
    setIsPopupErrorOpen(true);
  } finally {
    setIsLoading(false); // Desactivar el loading del input
  }
};
