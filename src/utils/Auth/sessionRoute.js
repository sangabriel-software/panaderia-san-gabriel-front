// src/utils/Auth/sessionRoute.js
import { getTokenExpiration } from "./decodedata";
import { isTokenExpired } from "./validacionpermisos";

export const hasValidSession = () => {
  const exp = getTokenExpiration();
  return Boolean(exp) && !isTokenExpired(exp);
};

export const getStartRoute = () => localStorage.getItem("lastRoute") || "/home";