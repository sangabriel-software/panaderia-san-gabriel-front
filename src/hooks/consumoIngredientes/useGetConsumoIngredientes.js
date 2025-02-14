import { useEffect, useState } from "react";
import { consultarDetalleConsumoProduccion } from "../../services/consumoingredientes/consumoingredientesprod.service";

/* Consulta a BD los permisoso */
export const useGetConsumoIngredientes = (idOrdenProduccion) => {
    const [detalleConsumo, setDetalleConsumo] = useState([]);
    const [loadingDetalleConsumo, setLoadingDetalleConsumo] = useState(true);
    const [showErrorDetalleConsumo, setShowErrorDetalleConsumo] = useState(false);
    const [showInfoDetalleConsumo, setShowInfoDetalleConsumo] = useState(false);
  
    useEffect(() => {
      const fetchDetallaConsumoIngredientes = async () => {
        try {
          const response = await consultarDetalleConsumoProduccion(idOrdenProduccion);
          const data = response;
          if (data.status === 200) {
            setDetalleConsumo(data.IngredientesConsumidos);

          } else {
            setShowInfoDetalleConsumo(true);
          }
        } catch (error) {
            setShowErrorDetalleConsumo(true);
        } finally {
            setLoadingDetalleConsumo(false);
        }
      };

      fetchDetallaConsumoIngredientes();
    }, []);
  
    return { detalleConsumo, loadingDetalleConsumo, showErrorDetalleConsumo, showInfoDetalleConsumo };
  };
  
  export default useGetConsumoIngredientes;
