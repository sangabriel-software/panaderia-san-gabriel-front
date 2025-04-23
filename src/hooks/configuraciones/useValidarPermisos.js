import { useEffect, useState } from "react";
import { hasPermission } from "../../utils/Auth/validacionpermisos";


const useValidarPermisos = (rutas) => {
  const [permisos, setPermisos] = useState({});

  // Verificar permisos para cada ruta al montar el componente
  useEffect(() => {
    const permisosActualizados = {};
    for (const [key, ruta] of Object.entries(rutas)) {
      permisosActualizados[key] = hasPermission(ruta);
    }
    setPermisos(permisosActualizados);
  }, [rutas]);

  return permisos;
};

export default useValidarPermisos;