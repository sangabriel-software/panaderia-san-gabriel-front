import { useEffect, useState } from "react";
import { consultarOrdenEspecialByIdService } from "../../services/ordenesEspeciales/ordenesEspeciales.service";

/* Consulta a BD los permisoso */
export const useGetOrdenEDetalle = (idOrdenEspecial) => {
    const [detalleOrdenEspecial, setDetalleOrdenEspecial] = useState([]);
    const [loadingDetalleOrdenEspecial, setLoadingDetalleOrdenEspecial] = useState(true);
    const [showErrorDetalleOrdenEspecial, setShowErrorDetalleOrdenEspecial] = useState(false);
  
    useEffect(() => {
      const fetchDetalleOrdenEspecial = async () => {
        try {
          const response = await consultarOrdenEspecialByIdService(idOrdenEspecial);
          const data = response;
          if (data.status === 200) {
            setDetalleOrdenEspecial(data.ordenEspecial);
          }
        } catch (error) {
            setShowErrorDetalleOrdenEspecial(true);
        } finally {
            setLoadingDetalleOrdenEspecial(false);
        }
      };

      fetchDetalleOrdenEspecial();
    }, []);
  
    return { detalleOrdenEspecial, loadingDetalleOrdenEspecial, showErrorDetalleOrdenEspecial };
  };
  
  export default useGetOrdenEDetalle;
