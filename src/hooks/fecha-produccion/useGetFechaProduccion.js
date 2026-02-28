import { useEffect, useState } from "react";
import { consultarFechaProduccionService } from "../../services/activar-fecha-produccion/activar-fecha-produccion.service";
import { getCurrentDateTimeWithSeconds } from "../../utils/dateUtils";

/* Consulta a BD los permisoso */
export const useGetFechaProduccion = () => {
    const [diaProduccion, setDiaProduccion] = useState("");
    const [loadingFechaProduccion, setLoadingFechaProduccion] = useState(true);
    const [showErrorFechaProduccion, setShowErrorFechaProduccion] = useState(false);
    const [showInfoFechaProduccion, setShowInfoFechaProduccion] = useState(false);
  
    useEffect(() => {
      const fetchFechaProduccion = async () => {
        try {
          const fechaActual = getCurrentDateTimeWithSeconds();
          const response = await consultarFechaProduccionService(fechaActual);
          const data = response;
          if (data.status === 200) {
            setDiaProduccion(data.diaProduccion);

          } else {
            setShowInfoFechaProduccion(true);
          }
        } catch (error) {
          setShowErrorFechaProduccion(true);
        } finally {
          setLoadingFechaProduccion(false);
        }
      };

      fetchFechaProduccion();
    }, []);
  
    return { diaProduccion, loadingFechaProduccion, showErrorFechaProduccion, showInfoFechaProduccion };
  };
  
  export default useGetFechaProduccion;
