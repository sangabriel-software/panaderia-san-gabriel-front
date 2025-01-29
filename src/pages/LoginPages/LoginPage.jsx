import React, { useState } from "react"; // Importamos useState
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { iniciarSesion } from "../../services/authServices/auth.service";
import { setLocalStorage } from "../../utils/Auth/localstorage";
import { toast, ToastContainer } from "react-toastify"; // Importamos toast de react-toastify
import "react-toastify/dist/ReactToastify.css"; // Importamos los estilos de react-toastify

function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Estado para manejar si la contraseña es visible o no
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
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
      console.log(error.code);

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
        toast.error("No hubo conexion con el servidor, intenta mas tarde", {
          autoClose: 5000,
        });
      }
    }
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="contenedorLados vh-100">
      <div className="container-fluid">
        <div className="row">
          {/* Lado Izquierdo */}
          <div className="izquierdo col-sm-6 px-0 d-none d-sm-block">
            <img
              src="https://i.pinimg.com/originals/d3/a2/9d/d3a29d4e0fa8e004b274880ec979b1e2.jpg"
              alt="San Miguel Dueñas"
              className="w-100 vh-100"
              style={{ objectFit: "cover", objectPosition: "center" }}
              draggable="false"
            />
          </div>

          {/* Lado derecho */}
          <div className="derecho col-sm-6 text-black">
            <div className="divlogo px-5 ms-xl-4">
              <img
                className="logo-login"
                src="https://png.pngtree.com/png-vector/20221122/ourmid/pngtree-bread-logo-illustration-png-image_6458295.png"
                alt="Logo"
                draggable="false"
              />
            </div>
            <div className="d-flex align-items-center h-custom-2 px-5 ms-xl-4 mt-4 pt-2 pt-xl-0 mt-xl-n5 py-3">
              <form style={{ width: "23rem" }} onSubmit={handleSubmit(onSubmit)}>
                <h3
                  className="fw-bold mb-3 pb- text-center"
                  style={{ letterSpacing: 1 }}
                >
                  Inicio de sesión
                </h3>
                {/* Input Usuario */}
                <div className="form-floating mb-4">
                  <input
                    type="text"
                    id="usuario"
                    className={`form-control form-control-lg ${
                      errors.usuario ? "is-invalid" : ""
                    }`}
                    placeholder="Usuario"
                    autoCapitalize="none"
                    autoComplete="username"
                    {...register("usuario", {
                      required: "El usuario es obligatorio",
                    })}
                  />
                  <label htmlFor="usuario">Usuario</label>
                  {errors.usuario && (
                    <div className="invalid-feedback">{errors.usuario.message}</div>
                  )}
                </div>
                {/* Input Contraseña con ícono de ojo */}
                <div className="form-floating mb-4 position-relative">
                  <input
                    type={showPassword ? "text" : "password"} // Alternar entre "text" y "password"
                    id="contrasena"
                    className={`form-control form-control-lg ${
                      errors.contrasena ? "is-invalid" : ""
                    }`}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    {...register("contrasena", {
                      required: "La contraseña es obligatoria",
                    })}
                  />
                  <label htmlFor="contrasena">Contraseña</label>
                  {/* Ícono de ojo para mostrar/ocultar contraseña */}
                  <span
                    className="position-absolute top-50 end-0 translate-middle-y me-3"
                    style={{ cursor: "pointer" }}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <i className="fas fa-eye-slash"></i> // Ícono de ojo tachado (contraseña visible)
                    ) : (
                      <i className="fas fa-eye"></i> // Ícono de ojo (contraseña oculta)
                    )}
                  </span>
                  {errors.contrasena && (
                    <div className="invalid-feedback">{errors.contrasena.message}</div>
                  )}
                </div>
                <div className="d-flex justify-content-center align-items-center pt-1 mb-4">
                  <button
                    className="loginbtn btn btn-success btn-lg fw-bold"
                    type="submit"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Contenedor de notificaciones */}
      <ToastContainer />
    </section>
  );
}

export default LoginPage;