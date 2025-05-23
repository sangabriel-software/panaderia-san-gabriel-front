import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import logo from "../../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { handleLogin } from "./loginUtils";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Efecto para mostrar mensaje de cierre de sesión exitoso
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('logout') === 'success') {
      toast.success("Sesión cerrada correctamente", {
        autoClose: 2000,
        toastId: 'logout-success'
      });
      
      // Limpiar la URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <section className="contenedorLados vh-100">
      <div className="container-fluid">
        <div className="row">
          {/* Columna izquierda - Solo visible en desktop (lg+) */}
          <div className="izquierdo col-lg-6 px-0 d-none d-lg-block">
            <img
              src="https://i.pinimg.com/originals/d3/a2/9d/d3a29d4e0fa8e004b274880ec979b1e2.jpg"
              alt="San Miguel Dueñas"
              className="w-100 vh-100"
              style={{ objectFit: "cover", objectPosition: "center" }}
              draggable="false"
            />
          </div>

          {/* Columna derecha - Siempre visible */}
          <div className="derecho col-12 col-lg-6 text-black">
            <div className="divlogo px-5 ms-xl-4">
              <img
                className="logo-login"
                src={logo}
                alt="Logo"
                draggable="false"
              />
            </div>
            <div className="d-flex align-items-center h-custom-2 px-5 ms-xl-4 mt-4 pt-2 pt-xl-0 mt-xl-n5 py-3">
              <form style={{ width: "23rem" }} onSubmit={handleSubmit((data) => handleLogin(data, navigate, setIsLoading))}>
                <h3 className="fw-bold mb-3 pb- text-center" style={{ letterSpacing: 1 }}>
                  Inicio de sesión
                </h3>
                <div className="form-floating mb-4">
                  <input
                    type="text"
                    id="usuario"
                    className={`form-control form-control-lg ${errors.usuario ? "is-invalid" : ""}`}
                    placeholder="Usuario"
                    autoCapitalize="none"
                    autoComplete="username"
                    {...register("usuario", { required: "El usuario es obligatorio" })}
                  />
                  <label htmlFor="usuario">Usuario</label>
                  {errors.usuario && <div className="invalid-feedback">{errors.usuario.message}</div>}
                </div>
                <div className="form-floating mb-4 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="contrasena"
                    className={`form-control form-control-lg ${errors.contrasena ? "is-invalid" : ""}`}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    {...register("contrasena", { required: "La contraseña es obligatoria" })}
                  />
                  <label htmlFor="contrasena">Contraseña</label>
                  <span className="position-absolute top-50 end-0 translate-middle-y me-3" style={{ cursor: "pointer" }} onClick={togglePasswordVisibility}>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-dark" />
                  </span>
                  {errors.contrasena && <div className="invalid-feedback">{errors.contrasena.message}</div>}
                </div>
                <div className="d-flex justify-content-center align-items-center pt-1 mb-4">
                  <button className="loginbtn btn btn-success btn-lg fw-bold" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{" "}
                        Cargando...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;