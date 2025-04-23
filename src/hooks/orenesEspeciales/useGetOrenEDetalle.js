// src/hooks/ordenesEspeciales/useGetOrdenEDetalle.js
import { useEffect, useState } from "react";
import { consultarOrdenEspecialByIdService } from "../../services/ordenesEspeciales/ordenesEspeciales.service";

export const useGetOrdenEDetalle = (idOrdenEspecial) => {
    const [detalleOrdenEspecial, setDetalleOrdenEspecial] = useState(null);
    const [loadingDetalleOrdenEspecial, setLoadingDetalleOrdenEspecial] = useState(true);
    const [showErrorDetalleOrdenEspecial, setShowErrorDetalleOrdenEspecial] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  
    useEffect(() => {
      const fetchDetalleOrdenEspecial = async () => {
        try {
          setLoadingDetalleOrdenEspecial(true);
          const response = await consultarOrdenEspecialByIdService(idOrdenEspecial);
          
          if (response.status === 200) {
            setDetalleOrdenEspecial(response.ordenEspecial);
          } else {
            setShowErrorDetalleOrdenEspecial(true);
            setErrorMessage(response.message || 'Error al cargar el detalle');
          }
        } catch (error) {
          setShowErrorDetalleOrdenEspecial(true);
          setErrorMessage(error.message || 'Error al cargar el detalle');
        } finally {
          setLoadingDetalleOrdenEspecial(false);
        }
      };

      if (idOrdenEspecial) {
        fetchDetalleOrdenEspecial();
      }
    }, [idOrdenEspecial]);
  
    return { 
      detalleOrdenEspecial, 
      loadingDetalleOrdenEspecial, 
      showErrorDetalleOrdenEspecial,
      errorMessage,
      setDetalleOrdenEspecial // Para permitir actualización local
    };
};
  
export default useGetOrdenEDetalle;