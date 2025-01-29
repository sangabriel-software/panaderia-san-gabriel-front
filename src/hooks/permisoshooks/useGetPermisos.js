import { useEffect, useState } from "react";
import { consultarPermisosList } from "../../services/userServices/permisosservices/permisos.service";



/* Consulta a BD los permisoso */
export const useGetPermiosos = () => {
    const [permisos, setPermisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showError, setShowError] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
  
    useEffect(() => {
      const fetchPermisos = async () => {
        try {
          const response = await consultarPermisosList();
          const data = response;
  
          if (data.status === 200) {
            setPermisos(data.permisos);
          } else {
            setShowError(true);
          }
        } catch (error) {
          if (error.status === 404) {
            setShowInfo(true);
            setShowError(false);
          }
          setShowError(true);
        } finally {
          setLoading(false);
        }
      };
  
      fetchPermisos();
    }, []); // Solo se ejecuta una vez cuando el componente se monta
  
    return { permisos, loading, showError, showInfo };
  };
  
  export default useGetPermiosos;
