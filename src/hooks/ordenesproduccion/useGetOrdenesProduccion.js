import { useEffect, useState } from "react";
import { consultarOrdenesProduccion } from "../../services/ordenesproduccion/ordenesProduccion.service";

/* Consulta a BD los permisoso */
export const useGetOrdenesProduccion = () => {
    const [ordenesProduccion, setOrdenesProduccion] = useState([]);
    const [loadingOrdenes, setLoadingOrdenes] = useState(true);
    const [showErrorOrdenes, setShowErrorOrdenes] = useState(false);
    const [showInfoOrdenes, setShowInfoOrdenes] = useState(false);
  
    useEffect(() => {
      const fetchOrdenesProduccion = async () => {
        try {
          const response = await consultarOrdenesProduccion();
          const data = response;
          if (data.status === 200) {
            setOrdenesProduccion(data.ordenesProduccion);

          } else {
            setShowInfoOrdenes(true);
          }
        } catch (error) {
          setShowErrorOrdenes(true);
        } finally {
          setLoadingOrdenes(false);
        }
      };

      fetchOrdenesProduccion();
    }, []);
  
    return { ordenesProduccion, loadingOrdenes, showErrorOrdenes, showInfoOrdenes, setOrdenesProduccion };
  };
  
  export default useGetOrdenesProduccion;
