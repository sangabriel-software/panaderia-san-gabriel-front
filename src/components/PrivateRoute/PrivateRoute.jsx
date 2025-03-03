import React, { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { removeLocalStorage } from "../../utils/Auth/localstorage";
import { getTokenExpiration, getUserPermissions } from "../../utils/Auth/decodedata";

const PrivateRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const TokenExpired = getTokenExpiration();
  const permisosUsuario = getUserPermissions(); // Obtener los permisos del usuario

  // Función para verificar si el token ha expirado
  const isTokenExpired = () => {
    if (!TokenExpired) return true;

    try {
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime > TokenExpired;
    } catch (error) {
      return true;
    }
  };

  // Función para verificar si el usuario tiene acceso a la ruta actual
  const hasPermission = () => {
    const rutaActual = location.pathname; // Obtener la ruta actual

    // Verificar si la ruta actual comienza con alguna de las rutas permitidas
    return permisosUsuario.some((permiso) =>
      rutaActual.startsWith(permiso.rutaAcceso)
    );
  };

  useEffect(() => {
    if (!TokenExpired) {
      toast.error("Necesitas iniciar sesión para acceder.", {
        autoClose: 5000,
      });
      // Reemplazar la entrada actual en el historial
      navigate("/login", { state: { from: "unauthorized" }, replace: true });
    } else if (isTokenExpired(TokenExpired)) {
      toast.error("Tu sesión ha expirado.", {
        autoClose: 5000,
      });
      removeLocalStorage("token");
      // Reemplazar la entrada actual en el historial
      navigate("/login", { state: { from: "expired" }, replace: true });
    } else if (!hasPermission()) {
      // Si el usuario no tiene permisos, redirigir a la página de acceso denegado
      // Reemplazar la entrada actual en el historial
      navigate("/acceso-denegado", { replace: true });
    }
  }, [TokenExpired, navigate, location, permisosUsuario]);

  // Renderizar Outlet solo si el token es válido y el usuario tiene permisos
  return TokenExpired && !isTokenExpired(TokenExpired) && hasPermission() ? (
    <Outlet />
  ) : null;
};

export default PrivateRoute;