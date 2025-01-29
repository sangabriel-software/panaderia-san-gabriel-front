import { useEffect, useState } from "react";
import { bloquearUsuario, desbloquearUsuario, elminarUsuario } from "../../../../services/userServices/usersservices/users.service";


/* Consulta interna par la pagina de roles Busqueda de usuarios*/
export const useUsersSerch = (usuarios) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNoResults, setShowNoResults] = useState(false);

  // Sincroniza los roles iniciales
  useEffect(() => {
    setFilteredUsers(usuarios);
  }, [usuarios]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = usuarios.filter((usuario) =>
        usuario.nombreUsuario.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);

    setShowNoResults(filtered.length === 0 && query.length > 0);
  };

  return {
    filteredUsers,
    searchQuery,
    showNoResults,
    handleSearch,
  };
};

/* Elminacion de usaurios*/
export const handleDelele = (id, setUserToDelete, setIsPopupOpen) => {
  setUserToDelete(id);
  setIsPopupOpen(true);
}

export const handleConfirmDelete = async (userToDelete, setUsers, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen ) => {
  try{

      if (userToDelete) {
        const resDelete = await elminarUsuario(userToDelete);

        if (resDelete.status === 200) {
          setUsers((prevUsers) => prevUsers.filter(user => user.idUsuario !== userToDelete));
          setIsPopupOpen(false); 
        }
      }else{

      }
    }catch(error){
      if(error.status === 409 && error.data.error.code === 402){
        setIsPopupOpen(false); 
        setErrorPopupMessage(`Para elminar el rol debe elminar los usuarios al que esta relacionado`);
        setIsPopupErrorOpen(true);
      }

    }
  };



  export const handleBloqueoDesbloqueo = async (idUsuarioToModify, statusUsuario, setUsers, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen ) => {
    try {
      let resModify;
  
      if (idUsuarioToModify) {
        if (statusUsuario === "A") {
          resModify = await bloquearUsuario(idUsuarioToModify);
        } else {
          resModify = await desbloquearUsuario(idUsuarioToModify);
        }
  
        if (resModify.status === 200) {
          // Actualiza el usuario directamente en el estado
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.idUsuario === idUsuarioToModify
                ? { ...user, estadoUsuario: statusUsuario === "A" ? "B" : "A" }
                : user
            )
          );
  
          setIsPopupOpen(false);
        }
      }
    } catch (error) {
      setIsPopupOpen(false);
      setErrorPopupMessage(
        `No se pudo ${
          statusUsuario === "A" ? "Bloquear" : "Desbloquear"
        } el usuario. Intenta nuevamente.`
      );
      setIsPopupErrorOpen(true);
    }
  };
  