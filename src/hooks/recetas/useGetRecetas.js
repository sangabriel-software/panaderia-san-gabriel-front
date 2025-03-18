import { useEffect, useState } from "react";
import { consultarRecetasService } from "../../services/recetasServices/recetas.service";


/* Consulta a BD los permisoso */
export const useGetRecetas = () => {
    const [recetas, setRecetas] = useState([]);
    const [loadingRecetas, setLoadingRecetas] = useState(true);
    const [showErrorRecetas, setShowErrorRecetas] = useState(false);
    const [showInfoRecetas, setShowInfoRecetas] = useState(false);
  
    useEffect(() => {
      const fetchRecetas = async () => {
        try {
          const response = await consultarRecetasService();
          const data = response;
          if (data.status === 200) {
            setRecetas(data.recetas);

          } else {
            setShowInfoRecetas(true);
          }
        } catch (error) {
          setShowErrorRecetas(true);
        } finally {
          setLoadingRecetas(false);
        }
      };

      fetchRecetas();
    }, []);
  
    return { recetas, loadingRecetas, showErrorRecetas, showInfoRecetas, setRecetas };
  };
  
  export default useGetRecetas;
