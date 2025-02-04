import { useEffect, useState } from "react";
import { consultarProductosService } from "../../services/productos/productos.service";


/* Consulta a BD los permisoso */
export const useGetProductosYPrecios = () => {
    const [productos, setProductos] = useState([]);
    const [loadigProducts, setLoadingProductos] = useState(true);
    const [showErrorProductos, setShowErrorProductos] = useState(false);
    const [showInfoProductos, setShowInfoProductos] = useState(false);
  
    useEffect(() => {
      const fetchProductos = async () => {
        try {
          const response = await consultarProductosService();
          const data = response;  
          if (data.status === 200) {
            setProductos(data.preciosProductos);
          } else {
            setShowInfoProductos(true);
          }

        } catch (error) {
          setShowErrorProductos(true);
        } finally {
          setLoadingProductos(false);
        }
      };
  
      fetchProductos();
    }, []); // Solo se ejecuta una vez cuando el componente se monta
  
    return { productos, loadigProducts, showErrorProductos, showInfoProductos, setProductos };
  };
  
  export default useGetProductosYPrecios;
