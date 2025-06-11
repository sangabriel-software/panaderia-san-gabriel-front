import { useEffect, useState } from "react";
import { consultardetalleTrasladoService } from "../../services/Traslados/traslados.service";
import { decryptId } from "../../utils/CryptoParams";

/* Consulta a BD los permisoso */
export const useGetDetalleTraslado = (idTraslado) => {
    const [detalleTraslado, setDetalleTraslado] = useState([]);
    const [loadingDetalleTraslado, setLoadingDetalleTraslado] = useState(true);
    const [showErrorDetalleTraslado, setShowErrorDetalleTraslado] = useState(false);
    const decryptedIdTraslado = decryptId(decodeURIComponent(idTraslado));

  
    useEffect(() => {
      const fetchDetalleTraslado = async () => {
        try {
          const response = await consultardetalleTrasladoService(decryptedIdTraslado);
          const data = response;
          if (data.status === 200) {
            setDetalleTraslado(data.traslado);
          } 
        } catch (error) {
            setShowErrorDetalleTraslado(true);
        } finally {
            setLoadingDetalleTraslado(false);
        }
      };

      fetchDetalleTraslado();
    }, []);
  
    return { detalleTraslado, loadingDetalleTraslado, showErrorDetalleTraslado, setDetalleTraslado };
  };
  
  export default useGetDetalleTraslado;
  