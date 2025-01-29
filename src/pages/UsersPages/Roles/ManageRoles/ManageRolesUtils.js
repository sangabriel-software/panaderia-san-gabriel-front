import { useNavigate } from "react-router";
import { eliminarRol } from "../../../../services/userServices/rolesservices/roles.service";
import { encryptId } from "../../../../utils/CryptoParams";

export const handleDelele = (id, setRoleToDelete, setIsPopupOpen) => {
    setRoleToDelete(id);
    setIsPopupOpen(true);
  }

export const handleConfirmDelete = async (roleToDelete, setRoles, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen ) => {
    try{
      if (roleToDelete) {
        const resDelete = await eliminarRol(roleToDelete);

        if (resDelete.status === 200) {
          setRoles((prevRoles) => prevRoles.filter(role => role.idRol !== roleToDelete));
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


export const handleEditRole = (idRol, navigate) => {
    const encryptedId = encryptId(idRol.toString()); 
    navigate(`/users/editRol/${encodeURIComponent(encryptedId)}`); 
  };