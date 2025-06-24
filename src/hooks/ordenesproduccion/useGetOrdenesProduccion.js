import { useEffect, useState } from "react";
import { consultarOrdenesProduccion } from "../../services/ordenesproduccion/ordenesProduccion.service";
import { getUserData } from "../../utils/Auth/decodedata";

/* Consulta a BD los permisoso */
export const useGetOrdenesProduccion = () => {
    const [ordenesProduccion, setOrdenesProduccion] = useState([]);
    const [loadingOrdenes, setLoadingOrdenes] = useState(true);
    const [showErrorOrdenes, setShowErrorOrdenes] = useState(false);
    const [showInfoOrdenes, setShowInfoOrdenes] = useState(false);
    const userData = getUserData();
  
    useEffect(() => {
      const fetchOrdenesProduccion = async () => {
        try {

          if(!userData){
            setShowErrorOrdenes(true);
          }
          const response = await consultarOrdenesProduccion(userData.idRol, userData.idSucursal);
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
