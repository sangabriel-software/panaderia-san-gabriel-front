import { crearUsuario } from "../../../../services/userServices/usersservices/users.service";
import { currentDate } from "../../../../utils/dateUtils";

 export const resetForm = (reset, setValue, clearErrors, setSelectedOption) => {
    reset({
      nombreUsuario: "",
      apellidoUsuario: "",
      idRol: "",
      telefonoUsuario: "",
    });
    setValue("idRol", ""); // Resetear el valor en React Hook Form
    clearErrors();
    setSelectedOption(null); // Limpiar el estado del select
  };


// roleUtils.js (o el nombre que prefieras)
export const convertirRolesAOpciones = (roles) => {
  return (
    roles?.map((rol) => ({
      value: rol.idRol,
      label: rol.nombreRol,
    })) || []
  ); // Retorna un array vacío si roles es undefined o null
};

export const payloadCreacionDeUsuario = (data) => {

    const dataUsuario = {
        ...data,
        fechaCreacion: currentDate()
    }
    
    return dataUsuario;
}



// Función para manejar el envío del formulario
export const handleCreateUserSubmit = async (data, reset, setIsPopupOpen, setIsPopupErrorOpen, setErrorPopupMessage) => {
  try {
    const dataUsuario = payloadCreacionDeUsuario(data);
    const resCrearUsuario = await crearUsuario(dataUsuario);
    if (resCrearUsuario.status === 200) {
      setIsPopupOpen(true);
    }
  } catch (error) {
    setErrorPopupMessage(
      "Hubo un error al crear el usuario. Intente más tarde."
    );
    setIsPopupErrorOpen(true);
  }
};
