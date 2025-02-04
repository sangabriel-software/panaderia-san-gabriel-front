import { useEffect, useState } from "react";

/* Consulta a BD los permisoso */
export const useGetCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const [showErrorCategorias, setShowErrorCtegorias] = useState(false);
    const [showInfoCategorias, setShowInfoCategorias] = useState(false);
  
    useEffect(() => {
        setTimeout(() => {
          const data = [
            { idCategoria: 1, nombreCategoria: "Panadería" },
            { idCategoria: 2, nombreCategoria: "Reposteria" },
          ];
          setCategorias(data);
          setLoadingCategorias(false);
        }, 500);
      }, []);
  
    return { categorias, loadingCategorias, showErrorCategorias, showInfoCategorias };
  };
  
  export default useGetCategorias;
