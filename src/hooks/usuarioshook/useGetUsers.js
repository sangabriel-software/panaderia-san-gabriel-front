import { useEffect, useState, useCallback } from "react";
import { consultarUsuarios } from "../../services/userServices/usersservices/users.service";

/* Consulta a BD los usuarios */
export const useGetUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setloadingUsers] = useState(true);
  const [showErrorUsers, setShowErrorUsers] = useState(false);
  const [showInfoUsers, setShowInfoUsers] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setloadingUsers(true);
    setShowErrorUsers(false);
    setShowInfoUsers(false);
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
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]); // Se ejecuta al montar, y de nuevo cada vez que se llame manualmente

  return {
    usuarios,
    loadingUsers,
    showErrorUsers,
    showInfoUsers,
    setUsuarios,
    refetchUsuarios: fetchUsuarios, // 👈 nuevo: permite re-consultar bajo demanda
  };
};

export default useGetUsers;