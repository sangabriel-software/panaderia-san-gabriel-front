import { useEffect, useState } from "react";
import { consultarTrasladosService } from "../../services/Traslados/traslados.service";

/* Consulta a BD los permisoso */
export const useGetTraslados = () => {
    const [traslados, setTraslados] = useState([]);
    const [loadingTraslados, setLoadingTraslados] = useState(true);
    const [showErrorTraslados, setShowErrorTraslados] = useState(false);
  
    useEffect(() => {
      const fetchTraslados = async () => {
        try {
          const response = await consultarTrasladosService();
          const data = response;
          if (data.status === 200) {
            setTraslados(data.traslados);
          } 
        } catch (error) {
            setShowErrorTraslados(true);
        } finally {
            setLoadingTraslados(false);
        }
      };

      fetchTraslados();
    }, []);
  
    return { traslados, loadingTraslados, showErrorTraslados, setTraslados };
  };
  
  export default useGetTraslados;
