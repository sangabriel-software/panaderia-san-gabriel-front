import { useEffect, useState } from "react";
import { consultarUsuarios } from "../../services/userServices/usersservices/users.service";



/* Consulta a BD los permisoso */
export const useGetUsers = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loadingUsers, setloadingUsers] = useState(true);
    const [showErrorUsers, setShowErrorUsers] = useState(false);
    const [showInfoUsers, setShowInfoUsers] = useState(false);
  
    useEffect(() => {
      const fetchUsuarios = async () => {
        try {
          const response = await consultarUsuarios();
          const data = response;  
          if (data.status === 200) {
            setUsuarios(data.usuarios);
          } else {
            setShowInfoUsers(true);
          }

        } catch (error) {
          setShowErrorUsers(true);
        } finally {
          setloadingUsers(false);
        }
      };
  
      fetchUsuarios();
    }, []); // Solo se ejecuta una vez cuando el componente se monta
  
    return { usuarios, loadingUsers, showErrorUsers, showInfoUsers, setUsuarios };
  };
  
  export default useGetUsers;
