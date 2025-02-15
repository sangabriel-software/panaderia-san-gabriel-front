import { useEffect, useState } from "react";
import { consultarCategoriasService } from "../../services/categorias/categorias.service";

/* Consulta a BD los permisoso */
export const useGetCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const [showErrorCategorias, setShowErrorCtegorias] = useState(false);
    const [showInfoCategorias, setShowInfoCategorias] = useState(false);
  
    useEffect(() => {
      const fetchCategorias = async () => {
        try {
          const response = await consultarCategoriasService();
          const data = response;
          if (data.status === 200) {
            setCategorias(data.categorias);

          } else {
            setShowInfoCategorias(true);
          }
        } catch (error) {
          setShowErrorCtegorias(true);
        } finally {
          setLoadingCategorias(false);
        }
      };

      fetchCategorias();
    }, []);
  
    return { categorias, loadingCategorias, showErrorCategorias, showInfoCategorias };
  };
  
  export default useGetCategorias;
