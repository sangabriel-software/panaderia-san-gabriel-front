import { hasPermission } from "../../../utils/Auth/validacionpermisos";

// Función para redirigir a la página correspondiente
export const handleNavigate = (path, navigate) => {
  if (hasPermission(path)) {
    navigate(path);
  }
};
