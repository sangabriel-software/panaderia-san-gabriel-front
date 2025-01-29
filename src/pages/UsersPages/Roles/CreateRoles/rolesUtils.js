import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useGetPermiosos } from "../../../../hooks/permisoshooks/useGetPermisos";
import { ingresarNuevoRol } from "../../../../services/userServices/rolesservices/roles.service";
import { AsignarPermisosARol } from "../../../../services/userServices/permisosservices/permisos.service";
import { currentDate } from "../../../../utils/dateUtils";
import { capitalizeFirstLetter } from "../../../../utils/utils";

const handleToggleChange = (idPermiso, selectedPermisos) => {
  const updatedSelectedPermisos = selectedPermisos.includes(idPermiso)
    ? selectedPermisos.filter((id) => id !== idPermiso)
    : [...selectedPermisos, idPermiso];

  return updatedSelectedPermisos;
};

const createRolPayload = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("El parámetro data debe ser un objeto válido.");
  }



  const newRol = {
    nombreRol: capitalizeFirstLetter(data.nombreRol.trim()),
    descripcionRol: capitalizeFirstLetter(data.descripcionRol.trim()),
    fechaCreacion: currentDate(),
  };

  return newRol;
};

const createPermisosRolPayload = (idRol, permisosAsignados) => {
  if (!Array.isArray(permisosAsignados) || permisosAsignados.length === 0) {
    throw new Error("El parámetro permisos debe ser un array no vacío.");
  }

  // Asegurarse de que idRol sea un número
  const rolId = Number(idRol); // Convertir idRol a número si es necesario

  // Crear el payload para los roles y permisos
  const permisosRolPayload = permisosAsignados.map((idPermiso) => ({
    idRol: rolId, // El idRol se pasa de entrada y se asegura de ser número
    idPermiso, // Cada permiso es un número del array
  }));

  return { dataRolesPermisos: permisosRolPayload }; // Retornar el formato esperado por Postman
};

const handleError = (
  error,
  resCreateRol,
  setErrorPopupMessage,
  setIsPopupErrorOpen,
  setIsPopupWarOpen
) => {
  if (error.status === 409) {
    setErrorPopupMessage("Rol ingresado ya existe.");
    setIsPopupErrorOpen(true);
    return;
  }

  if (resCreateRol?.status === 201 && error.status === 500) {
    setErrorPopupMessage("Rol Creado, Permisos no asignados");
    setIsPopupWarOpen(true);
    return;
  }

  setErrorPopupMessage("Ha ocurrido un error intenta más tarde.");
  setIsPopupErrorOpen(true);
};

const usePermisosLogic = (setError, clearErrors) => {
  const [selectedPermisos, setSelectedPermisos] = useState([]);

  const onToggleChange = (idPermiso) => {
    const updatedSelectedPermisos = handleToggleChange(
      idPermiso,
      selectedPermisos
    );
    setSelectedPermisos(updatedSelectedPermisos);

    if (updatedSelectedPermisos.length > 0) {
      clearErrors("permisos");
    } else {
      setError("permisos", {
        type: "manual",
        message: "Debe seleccionar al menos un permiso.",
      });
    }
  };

  return {
    selectedPermisos,
    onToggleChange,
    setSelectedPermisos,
  };
};

const usePopupLogic = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [isPopupWarOpen, setIsPopupWarOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  return {
    isPopupOpen,
    setIsPopupOpen,
    isPopupErrorOpen,
    setIsPopupErrorOpen,
    isPopupWarOpen,
    setIsPopupWarOpen,
    errorPopupMessage,
    setErrorPopupMessage,
  };
};

const submitRolData = async (data, selectedPermisos, callbacks) => {
  const {
    setError,
    setIsPopupOpen,
    setErrorPopupMessage,
    setIsPopupErrorOpen,
    setIsPopupWarOpen,
  } = callbacks;

  if (selectedPermisos.length === 0) {
    setError("permisos", {
      type: "manual",
      message: "Debe seleccionar al menos un permiso.",
    });
    return;
  }

  let resCreateRol;

  const newRol = createRolPayload(data);

  try {
    resCreateRol = await ingresarNuevoRol(newRol);

    if (resCreateRol.status !== 201) throw new Error("Error al crear rol");

    const newPermisosRol = createPermisosRolPayload(
      resCreateRol.idRol,
      selectedPermisos
    );
    const resAsigPermisosRol = await AsignarPermisosARol(newPermisosRol);

    if (resAsigPermisosRol.status === 201) {
      setIsPopupOpen(true);
    } else {
      throw new Error("Error al asignar permisos");
    }
  } catch (error) {
    handleError(
      error,
      resCreateRol,
      setErrorPopupMessage,
      setIsPopupErrorOpen,
      setIsPopupWarOpen
    );
  }
};

export const useCreateRolFormLogic = () => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm();
  const { permisos, loading, showError } = useGetPermiosos();
  const permisosLogic = usePermisosLogic(setError, clearErrors);
  const popupLogic = usePopupLogic();
  const navigate = useNavigate();

  const resetForm = () => {
    reset({
      nombreRol: "",
      descripcionRol: "",
    });
    permisosLogic.setSelectedPermisos([]);
    clearErrors();
  };

  const onSubmit = (data) => {
    submitRolData(data, permisosLogic.selectedPermisos, {
      setError,
      setIsPopupOpen: popupLogic.setIsPopupOpen,
      setErrorPopupMessage: popupLogic.setErrorPopupMessage,
      setIsPopupErrorOpen: popupLogic.setIsPopupErrorOpen,
      setIsPopupWarOpen: popupLogic.setIsPopupWarOpen,
    });
  };

  return {
    register,
    handleSubmit,
    errors,
    permisos,
    loading,
    showError,
    ...permisosLogic,
    ...popupLogic,
    resetForm,
    onSubmit,
    navigate,
  };
};
