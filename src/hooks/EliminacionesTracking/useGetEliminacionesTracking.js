import { useEffect, useState } from "react";
import { consultarEliminacionesService } from "../../services/eliminacionesTracking/eliminacionesTracking.service";
import { currentDate } from "../../utils/dateUtils";

/* Consulta a BD los permisoso */
export const useGetEliminacionesTracking = (procesoEliminado) => {
    const [eliminacionesTracking, setEliminacionesTracking] = useState([]);
    const [loadingEliminacionesTracking, setLoadingEliminacionesTracking] = useState(true);
    const [showErrorEliminacionesTracking, setShowErrorEliminacionesTracking] = useState(false);

    const fechaHoy = currentDate();

    useEffect(() => {
      const fetchEliminacionesTracking = async () => {
        try {
          const response = await consultarEliminacionesService(procesoEliminado, fechaHoy);
          const data = response;
          if (data.status === 200) {
            setEliminacionesTracking(data.eliminacionesDiarias);
          } 
        } catch (error) {
            setShowErrorEliminacionesTracking(true);
        } finally {
            setLoadingEliminacionesTracking(false);
        }
      };

      fetchEliminacionesTracking();
    }, []);
  
    return { eliminacionesTracking, loadingEliminacionesTracking, showErrorEliminacionesTracking, setEliminacionesTracking };
  };
  
  export default useGetEliminacionesTracking;
  