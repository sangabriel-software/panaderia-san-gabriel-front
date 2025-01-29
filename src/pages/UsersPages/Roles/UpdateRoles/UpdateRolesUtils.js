import { useEffect, useState } from "react";
import { decryptId } from "../../../../utils/CryptoParams";

export const getDecrytedRolId = (idRol) => {
    try {
        const decryptedId = decryptId(decodeURIComponent(idRol)); 
        
        // Intentar convertir a número
        const numericId = Number(decryptedId);
        
        // Validar si es un número válido
        if (isNaN(numericId)) {
            throw new Error("El ID descifrado no es un número válido.");
        }

        return numericId;
    } catch (error) {
        console.error("Error al descifrar el ID del rol:", error);
        return null; // O lanza un error si prefieres manejarlo en otro lugar
    }
};


export const createDeletePermisosPayload = (idRol, permisosEliminados) => {
    if (!Array.isArray(permisosEliminados) || permisosEliminados.length === 0) {
        throw new Error("El parámetro permisos debe ser un array no vacío.");
      }
    
      // Asegurarse de que idRol sea un número
      const rolId = Number(idRol); // Convertir idRol a número si es necesario
    
      // Crear el payload para los roles y permisos
      const permisosRolPayload = permisosEliminados.map((idPermiso) => ({
        idRol: rolId, // El idRol se pasa de entrada y se asegura de ser número
        idPermiso, // Cada permiso es un número del array
      }));
    
      return { dataRolesPermisos: permisosRolPayload }; // Retornar el formato esperado por Postman

}

export const createPermisosRolPayload = (idRol, nuevoPermisoAsignado) => {
    if (!Array.isArray(nuevoPermisoAsignado) || nuevoPermisoAsignado.length === 0) {
      throw new Error("El parámetro permisos debe ser un array no vacío.");
    }
  
    // Asegurarse de que idRol sea un número
    const rolId = Number(idRol); // Convertir idRol a número si es necesario
  
    // Crear el payload para los roles y permisos
    const permisosRolPayload = nuevoPermisoAsignado.map((idPermiso) => ({
      idRol: rolId, // El idRol se pasa de entrada y se asegura de ser número
      idPermiso, // Cada permiso es un número del array
    }));
  
    return { dataRolesPermisos: permisosRolPayload }; // Retornar el formato esperado por Postman
  };


  export const createModifyRolInfo = (idRol, dataRol) => {

    const paloadRol = {
        idRol: idRol,
        ...dataRol
    }

    return paloadRol;
  }



export const useInitializeRoles = ({ rolesyPermisos, reset, setSelectedPermisos, setInitialSelectedPermisos, }) => {
  useEffect(() => {
    if (rolesyPermisos) {
      // Rellenar el formulario con los datos del rol
      reset({
        nombreRol: rolesyPermisos?.nombreRol,
        descripcionRol: rolesyPermisos?.descripcionRol,
      });

      // Guardar los permisos iniciales
      const permisosIds = rolesyPermisos?.permisos?.map((permiso) => permiso);
      setSelectedPermisos(permisosIds);
      setInitialSelectedPermisos(permisosIds);
    }
  }, [rolesyPermisos, reset, setSelectedPermisos, setInitialSelectedPermisos]);
};

export const handleToggleChange = (idPermiso, selectedPermisos) => {
  return selectedPermisos.includes(idPermiso)
    ? selectedPermisos.filter((id) => id !== idPermiso)
    : [...selectedPermisos, idPermiso];

  return updatedSelectedPermisos;
};


export const useOnToggleChange = (clearErrors, setError) => {
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [activatedPermisos, setActivatedPermisos] = useState([]);
  const [deactivatedPermisos, setDeactivatedPermisos] = useState([]);
    const [initialSelectedPermisos, setInitialSelectedPermisos] = useState([]);
  const [isModified, setIsModified] = useState(false);


  const onToggleChange = (idPermiso) => {
      const updatedSelectedPermisos = handleToggleChange(idPermiso,selectedPermisos);
  
      if (
        updatedSelectedPermisos.includes(idPermiso) &&
        !selectedPermisos.includes(idPermiso)
      ) {
        setActivatedPermisos((prev) => [...prev, idPermiso]);
        setDeactivatedPermisos((prev) => prev.filter((id) => id !== idPermiso));
      } else if (
        !updatedSelectedPermisos.includes(idPermiso) &&
        selectedPermisos.includes(idPermiso)
      ) {
        setDeactivatedPermisos((prev) => [...prev, idPermiso]);
        setActivatedPermisos((prev) => prev.filter((id) => id !== idPermiso));
      }
  
      setSelectedPermisos(updatedSelectedPermisos);
  
      const isStateModified =
        JSON.stringify(updatedSelectedPermisos.sort()) !==
        JSON.stringify(initialSelectedPermisos.sort());
      setIsModified(isStateModified);
  
      if (updatedSelectedPermisos.length > 0) {
        clearErrors("permisos");
      } else {
        setError("permisos", {
          type: "manual",
          message: "Debe seleccionar al menos un permiso.",
        });
      }
    };

    return {setSelectedPermisos, selectedPermisos, setActivatedPermisos, activatedPermisos, setDeactivatedPermisos, deactivatedPermisos, setIsModified, isModified, setInitialSelectedPermisos, initialSelectedPermisos, onToggleChange}
}
