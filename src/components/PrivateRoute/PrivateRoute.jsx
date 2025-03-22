import React, { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { removeLocalStorage } from "../../utils/Auth/localstorage";
import { getTokenExpiration, getUserPermissions } from "../../utils/Auth/decodedata";
import { hasPermission, isTokenExpired } from "../../utils/Auth/validacionpermisos";

const PrivateRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const TokenExpired = getTokenExpiration();
  const permisosUsuario = getUserPermissions(); // Obtener los permisos del usuario
  const rutaActual = location.pathname; // Obtener la ruta actual

  useEffect(() => {
    if (!TokenExpired) {
      toast.error("Necesitas iniciar sesión para acceder.", {
        autoClose: 5000,
      });
      navigate("/login", { state: { from: "unauthorized" }, replace: true });
    } else if (isTokenExpired(TokenExpired)) {
      toast.error("Tu sesión ha expirado.", {
        autoClose: 5000,
      });
      removeLocalStorage("token");
      navigate("/login", { state: { from: "expired" }, replace: true });
    } else if (!hasPermission(rutaActual) && !Object.values(exclusiones).includes(location.pathname)) {
      // Solo redirigir a "acceso-denegado" si la ruta no está excluida
      navigate("/acceso-denegado", { replace: true });
    }
  }, [TokenExpired, navigate, location, permisosUsuario]);

  // Renderizar Outlet solo si el token es válido y el usuario tiene permisos o la ruta está excluida
  return TokenExpired && !isTokenExpired(TokenExpired) && (hasPermission(rutaActual) || Object.values(exclusiones).includes(location.pathname)) ? (
    <Outlet />
  ) : null;
};

export default PrivateRoute;