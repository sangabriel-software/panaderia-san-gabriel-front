import React, { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getLocalStorage, removeLocalStorage } from "../../utils/Auth/localstorage";
import { getTokenExpiration } from "../../utils/Auth/decodedata";

const PrivateRoute = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Usamos useLocation para obtener la ubicación actual
  const TokenExpired = getTokenExpiration();//timepo de expiracion del token

  // Función para verificar si el token ha expirado
  const isTokenExpired = () => {
    if (!TokenExpired) return true; // Si no hay token, asumimos que ha expirado

    try {
      const currentTime = Math.floor(Date.now() / 1000); // Timestamp actual en segundos
      return currentTime > TokenExpired; // True si el token ha expirado
    } catch (error) {
      return true; // Si hay un error, asumimos que el token es inválido
    }
  };

  useEffect(() => {
    if (!TokenExpired) {
      // Si no hay token, mostrar un mensaje y redirigir al login
      toast.error("Necesitas iniciar sesión para acceder.", {
        autoClose: 5000,
      });

      // Reemplaza la entrada actual en el historial para evitar que el usuario regrese
      navigate("/login", { state: { from: "unauthorized" }, replace: true });
    } else if (isTokenExpired(TokenExpired)) {
      // Si el token existe pero ha expirado, mostrar un mensaje y redirigir al login
      toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", {
        autoClose: 5000,
      });
      removeLocalStorage("token"); // Elimina el token expirado

      // Reemplaza la entrada actual en el historial para evitar que el usuario regrese
      navigate("/login", { state: { from: "expired" }, replace: true });
    }
  }, [TokenExpired, navigate, location]); // Agregamos location como dependencia

  // Si el token es válido, renderiza las rutas hijas
  return TokenExpired && !isTokenExpired(TokenExpired) ? <Outlet /> : null;
};

export default PrivateRoute;