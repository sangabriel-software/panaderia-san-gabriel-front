import { ingresarStockProductos } from "../../../services/stockservices/stock.service";
import { getUserData } from "../../../utils/Auth/decodedata";
import { decryptId } from "../../../utils/CryptoParams";
import { currentDate, getCurrentDateTimeWithSeconds } from "../../../utils/dateUtils";

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


export const handleStockChange = (idProducto, value, setStockValues ) => {
    setStockValues((prev) => ({
      ...prev,
      [idProducto]: value ? parseInt(value) : null,
    }));
  };

export  const handleSubmitGuardarStock = async (stockValues, productosFiltrados, idSucursal, setIsLoading, setIsPopupOpen, setStockValues, setErrorPopupMessage, setIsPopupErrorOpen) => {
      setIsLoading(true);
      const usuario = getUserData();
  
      try {
  
        // Crear payload
        const payload = {
          stockProductos: Object.entries(stockValues)
            .filter(([_, value]) => value !== null && !isNaN(value))
            .map(([idProducto, cantidad]) => {
              const producto = productosFiltrados.find(
                (p) => p.idProducto === parseInt(idProducto)
              );
  
              return {
                idUsuario: usuario.idUsuario,
                idProducto: parseInt(idProducto),
                idSucursal: Number(decryptId(decodeURIComponent(idSucursal))),
                stock: cantidad,
                tipoProduccion: producto?.tipoProduccion || "",
                controlarStock: producto?.controlarStock || 0,
                controlarStockDiario: producto?.controlarStockDiario || 0,
                fechaActualizacion: getCurrentDateTimeWithSeconds(),
                fechaCreacion: currentDate(),
              };
            }),
        };
  
        // Llamada a la API
        console.log(payload)
        const res = await ingresarStockProductos(payload);
        if (res.status === 201) {
          setIsPopupOpen(true);
          setStockValues({});
        }
      } catch (error) {
        setErrorPopupMessage("Hubo un error al ingresar el stock, vuelve a intentar");
        setIsPopupErrorOpen(true);
      } finally {
        setIsLoading(false);
      }
};
  