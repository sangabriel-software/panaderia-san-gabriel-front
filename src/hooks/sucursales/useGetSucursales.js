import { useEffect, useState } from "react";
import { consultarSucursalesService } from "../../services/sucursales/sucursales.service";


/* Consulta a BD los permisoso */
export const useGetSucursales = () => {
    const [sucursales, setSucursales] = useState([]);
    const [loadingSucursales, setLoadingSucursales,] = useState(true);
    const [showErrorSucursales, setShowErrorSucursales, ] = useState(false);
    const [showInfoSucursales, setShowInfoSucursales] = useState(false);
  
    useEffect(() => {
      const fetchSucursales = async () => {
        try {
          const response = await consultarSucursalesService();
          const data = response;
          if (data.status === 200) {
            setSucursales(data.sucursales);

          } else {
            setShowInfoSucursales(true);
          }
        } catch (error) {
          setShowErrorSucursales(true);
        } finally {
          setLoadingSucursales(false);
        }
      };

      fetchSucursales();
    }, []);
  
    return { sucursales, loadingSucursales, showErrorSucursales, showInfoSucursales };
  };
  
  export default useGetSucursales;
