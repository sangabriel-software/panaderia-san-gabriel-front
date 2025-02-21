import { useEffect, useState } from "react";
import { getUserData } from "../../utils/Auth/decodedata";
import { consultarVentasPorUsuarioService } from "../../services/ventas/ventas.service";

/* Consulta a BD los permisoso */
export const useGetVentas = () => {
    const [ventas, setVentas] = useState([]);
    const [loadingVentas, setLoadingVentas] = useState(true);
    const [showErrorVentas, setShowErrorVentas] = useState(false);
    const [showInfoVentas, setShowInfoVentas] = useState(false);
    const usuario = getUserData();
  
    useEffect(() => {
      const fetchVentas = async () => {
        try {
            
            if(!usuario){
                setShowErrorVentas(true);
            }
            
            const response = await consultarVentasPorUsuarioService(usuario);
            const data = response;
            if (data.status === 200) {
                setVentas(data.ventas);

            } else {
                setShowInfoVentas(true);
            }
        } catch (error) {
          setShowErrorVentas(true);
        } finally {
          setLoadingVentas(false);
        }
      };

      fetchVentas();
    }, []);
  
    return { ventas, loadingVentas, showErrorVentas, showInfoVentas, setVentas };
  };
  
  export default useGetVentas;
