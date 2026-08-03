import { useEffect, useState } from "react";
import { consultarProductosParaInventario } from "../../services/productos/productos.service";


/* Consulta a BD los permisoso */
export const useGetProductosInventario = () => {
    const [productos, setProductos] = useState([]);
    const [loadigProducts, setLoadingProductos] = useState(true);
    const [showErrorProductos, setShowErrorProductos] = useState(false);
    const [showInfoProductos, setShowInfoProductos] = useState(false);
  
    useEffect(() => {
      const fetchProductos = async () => {
        try {
          const response = await consultarProductosParaInventario();
          const data = response;  
          if (data.status === 200) {
            setProductos(data.productos);
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
  
  export default useGetProductosInventario;
