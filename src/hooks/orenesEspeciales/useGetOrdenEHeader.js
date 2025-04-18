import { useEffect, useState } from "react";
import { consultarOrdenesEspecialesService } from "../../services/ordenesEspeciales/ordenesEspeciales.service";

/* Consulta a BD los permisoso */
export const useGetOrdenEHeader = () => {
    const [ordenesEspeciales, setOrdenesEspeciales] = useState([]);
    const [loadingOrdenEspecial, setLoadingOrdenEspecial] = useState(true);
    const [showErrorOrdenEspecial, setShowErrorOrdenEspecial] = useState(false);
  
    useEffect(() => {
      const fetchOrdenesEspeciales = async () => {
        try {
          const response = await consultarOrdenesEspecialesService();
          const data = response;
          if (data.status === 200) {
            setOrdenesEspeciales(data.ordenesEspeciales);
          } 
        } catch (error) {
            setShowErrorOrdenEspecial(true);
        } finally {
            setLoadingOrdenEspecial(false);
        }
      };

      fetchOrdenesEspeciales();
    }, []);
  
    return { ordenesEspeciales, loadingOrdenEspecial, showErrorOrdenEspecial, setOrdenesEspeciales };
  };
  
  export default useGetOrdenEHeader;
