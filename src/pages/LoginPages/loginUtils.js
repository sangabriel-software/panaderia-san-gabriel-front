
export const handlelogin = async (data, reset, setIsPopupOpen, setIsPopupErrorOpen, setErrorPopupMessage) => {
    setIsLoading(true); // Activa el loading

    try {
      // Llamamos al servicio de inicio de sesión
      const response = await iniciarSesion(data);

      // Guardamos el token en el localStorage
      setLocalStorage("token", response.authUser);

      // Redirigimos al usuario al dashboard
      navigate("/dashboard");

      // Mostrar un mensaje de éxito (opcional)
      toast.success("Inicio de sesión exitoso", {
        autoClose: 3000,
      });
    } catch (error) {
      // Mostrar un mensaje de error según el tipo de error
      if (error.response) {
        // Error de credenciales (por ejemplo, 401 Unauthorized)
        if (error.response.status === 404) {
          toast.error("Credenciales incorrectas. Verifica tu usuario y contraseña.", {
            autoClose: 5000,
          });
        } else {
          // Otros errores del servidor (por ejemplo, 500 Internal Server Error)
          toast.error("Error en el servidor. Por favor, intenta nuevamente más tarde.", {
            autoClose: 5000,
          });
        }
      } else {
        // Error de red o desconocido
        toast.error("No hubo conexión con el servidor, intenta más tarde", {
          autoClose: 5000,
        });
      }
    } finally {
      setIsLoading(false); // Desactiva el loading (tanto en éxito como en error)
    }
};