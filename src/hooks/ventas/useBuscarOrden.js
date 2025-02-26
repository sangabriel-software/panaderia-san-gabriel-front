// useBuscarVentas.js
import { useEffect } from "react";
import { handleBuscarVentas } from "../../pages/VentasPage/IngresarVenta/IngresarVenta.Utils";


export const useBuscarOrden = (turnoValue, sucursalValue, setIsLoading, setOrden, setProductos, setOrdenYProductos, setShowModal,
                               setErrorPopupMessage, setIsPopupErrorOpen, setHasOrdenes
) => {
  useEffect(() => {
    if (turnoValue && sucursalValue) {
      handleBuscarVentas( setIsLoading, turnoValue, sucursalValue, setOrden, setProductos, setOrdenYProductos, setShowModal,
                          setErrorPopupMessage, setIsPopupErrorOpen, setHasOrdenes);
    }
  }, [turnoValue, sucursalValue]); // Dependencias del useEffect
};