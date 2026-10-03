import { identifyUser } from "../../observability/betterStack";
import { iniciarSesion } from "../../services/authServices/auth.service";
import { getUserData } from "../../utils/Auth/decodedata";
import { setLocalStorage } from "../../utils/Auth/localstorage";

/**
 * Convierte el error del inicio de sesión en un aviso para el componente Alert.
 * `credenciales: true` indica que los campos usuario y contraseña deben marcarse en rojo.
 */
export const getLoginErrorAviso = (error) => {
  const status = error?.response?.status;

  if (status === 401 || status === 404) {
    return {
      type: "danger",
      title: "Usuario o contraseña incorrectos",
      message: "Revisa tus datos e inténtalo de nuevo.",
      credenciales: true,
    };
  }

  if (status === 403) {
    return {
      type: "danger",
      title: "Usuario bloqueado",
      message: "Comunícate con el administrador.",
    };
  }

  // Sin respuesta del servidor: sin conexión o servicio caído
  if (!error?.response) {
    return {
      type: "danger",
      title: "Servicio no disponible",
      message: "Intenta de nuevo más tarde.",
    };
  }

  // Cualquier otro código (500, etc.): antes no se mostraba nada
  return {
    type: "danger",
    title: "No se pudo iniciar sesión",
    message: "Ocurrió un error inesperado. Inténtalo de nuevo.",
  };
};

/**
 * Maneja el proceso de inicio de sesión.
 * @param {Object} data - Datos del formulario de inicio de sesión.
 * @param {Function} navigate - Función para redirigir al usuario.
 * @param {Function} setIsLoading - Función para manejar el estado de carga.
 * @param {Function} setAviso - Recibe el aviso de error a mostrar con <Alert />.
 */
export const handleLogin = async (data, navigate, setIsLoading, setAviso) => {
  setIsLoading(true);

  try {
    const response = await iniciarSesion(data);

    if (response.status === 200) {
      setLocalStorage("token", response.authUser);
      // Obtener información del usuario desde el token
      const userData = getUserData();

      setTimeout(() => {
        // Identificar usuario en Better Stack (no-op si está deshabilitado)
        if (userData?.idUsuario) {
          identifyUser({
            userId: userData.idUsuario,
            name:
              userData.usuario && userData.apellido
                ? `${userData.usuario} ${userData.apellido}`
                : undefined,
            userName: userData.usuario || undefined,
            email: userData.correo || undefined,
          });
        }

        if (userData?.cambioContrasenia === 1) {
          navigate("/cambiar-password");
        } else {
          navigate("/home");
        }
      }, 500);
    }
  } catch (error) {
    // `id` hace que un mismo error repetido vuelva a animarse y a leerse por lectores de pantalla
    setAviso({ ...getLoginErrorAviso(error), id: Date.now() });
  } finally {
    setIsLoading(false);
  }
};