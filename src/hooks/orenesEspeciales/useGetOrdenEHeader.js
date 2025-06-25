import { useEffect, useState } from "react";
import { consultarOrdenesEspecialesService } from "../../services/ordenesEspeciales/ordenesEspeciales.service";
import { getUserData } from "../../utils/Auth/decodedata";

/* Consulta a BD los permisoso */
export const useGetOrdenEHeader = () => {
    const [ordenesEspeciales, setOrdenesEspeciales] = useState([]);
    const [loadingOrdenEspecial, setLoadingOrdenEspecial] = useState(true);
    const [showErrorOrdenEspecial, setShowErrorOrdenEspecial] = useState(false);
    const userData = getUserData();
  
    useEffect(() => {
      const fetchOrdenesEspeciales = async () => {
        try {

          if(!userData){
            setShowErrorOrdenEspecial(true);
          }

          const response = await consultarOrdenesEspecialesService(userData.idRol, userData.idSucursal);
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
