// useBuscarVentas.js
import { useEffect } from "react";
import { handleBuscarVentas } from "../../pages/VentasPage/IngresarVenta/IngresarVenta.Utils";


export const useBuscarOrden = (turnoValue, sucursalValue, setIsLoading, setOrden, setProductos, setOrdenYProductos, setShowModal,
                               setErrorPopupMessage, setIsPopupErrorOpen
) => {
  useEffect(() => {
    if (turnoValue && sucursalValue) {
      handleBuscarVentas( setIsLoading, turnoValue, sucursalValue, setOrden, setProductos, setOrdenYProductos, setShowModal,
                          setErrorPopupMessage, setIsPopupErrorOpen);
    }
  }, [turnoValue, sucursalValue]); // Dependencias del useEffect
};