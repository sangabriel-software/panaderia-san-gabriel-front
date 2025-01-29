import { useEffect, useState } from "react";
import { consultarRolYPermisosPorId } from "../../services/userServices/permisosservices/permisos.service";



/* Consulta a BD los permisoso */
export const useGetRolesYPermisos = (idRol) => {
    const [rolesyPermisos, setRolesyPermisos] = useState(null);
    const [loadingPR, setLoadingPR] = useState(true);
    const [showErrorPR, setShowErrorPR] = useState(false);
    const [showInfoPR, setShowInfoPR] = useState(false);
  
    useEffect(() => {

        if (!idRol) return; // No ejecuta el hook si el parámetro no tiene datos

      const fetchRolYPermisos = async () => {
        try {
          const response = await consultarRolYPermisosPorId(idRol);
          const data = response;  
          if (data.status === 200) {
            setRolesyPermisos(data.rolesPermisos);
          } else {
            setShowErrorPR(true);
          }
        } catch (error) {
          if (error.status === 404) {
            setShowInfoPR(true);
            setShowErrorPR(false);
          }
          setShowErrorPR(true);
        } finally {
          setLoadingPR(false);
        }

      };
  
      fetchRolYPermisos();
    }, []); // Solo se ejecuta una vez cuando el componente se monta
  
    return { rolesyPermisos, loadingPR, showErrorPR, showInfoPR };
  };

