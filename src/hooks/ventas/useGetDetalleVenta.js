
import { useEffect, useState } from "react";
import { consultarDetalleVenta } from "../../services/ventas/ventas.service";

/* Consulta a BD los permisoso */
export const useGetDetalleVenta = (idVenta) => {
    const [detalleVenta, setDetalleVenta] = useState([]);
    const [loadingDetalleVenta, setLoadingDetalleVenta] = useState(true);
    const [showErrorDetalleVenta, setShowErrorDetalleVenta] = useState(false);
    const [showInfoDetalleVenta, setShowInfoDetalleVenta] = useState(false);
  
    useEffect(() => {
      const fetchDetalleVenta = async () => {
        try {
          const response = await consultarDetalleVenta(idVenta);
          const data = response;
          if (data.status === 200) {
            setDetalleVenta(data.venta);

          } else {
            setShowInfoDetalleVenta(true);
          }
        } catch (error) {
            setShowErrorDetalleVenta(true);
        } finally {
            setLoadingDetalleVenta(false);
        }
      };

      fetchDetalleVenta();
    }, []);
  
    return { detalleVenta, loadingDetalleVenta, showErrorDetalleVenta, showInfoDetalleVenta };
  };
  
  export default useGetDetalleVenta;
