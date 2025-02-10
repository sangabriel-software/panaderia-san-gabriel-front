import { useEffect, useState } from "react";
import { consultarDetallenOrdenProduccion, consultarOrdenesProduccion } from "../../services/ordenesproduccion/ordenesProduccion.service";

/* Consulta a BD los permisoso */
export const useGetDetalleOrden = (idOrdenProduccion) => {
    const [detalleOrden, setDetalleOrden] = useState([]);
    const [loadingDetalleOrdene, setLoadingDetalleOrdene] = useState(true);
    const [showErrorDetalleOrdene, setShowErrorDetalleOrdene] = useState(false);
    const [showInfoDetalleOrden, setShowInfoDetalleOrden] = useState(false);
  
    useEffect(() => {
      const fetchDetalleOrden = async () => {
        try {
          const response = await consultarDetallenOrdenProduccion(idOrdenProduccion);
          const data = response;
          if (data.status === 200) {
            setDetalleOrden(data.detalleOrden);

          } else {
            setShowInfoDetalleOrden(true);
          }
        } catch (error) {
            setShowErrorDetalleOrdene(true);
        } finally {
            setLoadingDetalleOrdene(false);
        }
      };

      fetchDetalleOrden();
    }, []);
  
    return { detalleOrden, loadingDetalleOrdene, showErrorDetalleOrdene, showInfoDetalleOrden };
  };
  
  export default useGetDetalleOrden;
