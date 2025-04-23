import { BsArrowLeft } from "react-icons/bs";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import useRoles from "../../../../hooks/roleshooks/roles.hooks";
import "./CreateUsersStyles.css";
import { handleCreateUserSubmit, resetForm } from "./CreateUsersUtils";
import SuccessPopup from "../../../../components/Popup/SuccessPopup";
import { useState } from "react";
import ErrorPopup from "../../../../components/Popup/ErrorPopUp";
import { Spinner } from "react-bootstrap"; // Importamos el Spinner de react-bootstrap

function CreateUsers() {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Abrir popup de éxito
  const [selectedOption, setSelectedOption] = useState(null); // Estado del select
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false); // Manejo del popup de errores
  const [errorPopupMessage, setErrorPopupMessage] = useState(""); // Manejo del mensaje para el popup de errores
  const { register, handleSubmit, reset, formState: { errors }, setValue, clearErrors, } = useForm(); // Configuración de react-hook-form
  const { roles, loading } = useRoles(); // Roles para asignar al usuario
  const [isLoadingSave, setIsloadingSave] = useState(false); //Ingreso de usuaros loading
  const navigate = useNavigate(); // Hook para la navegaciónlo

  const onSubmit = (data) => {
    // Función para guardar usuario
    handleCreateUserSubmit( data, reset, setIsPopupOpen, setIsPopupErrorOpen, setErrorPopupMessage, setIsloadingSave );
  };

  return (
    <div className="container justify-content-center">
      {/* Título del formulario */}
      <div className="text-center mb-3">
        <div className="row">
          <div className="col-2">
            {/* Botón de volver */}
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/users")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <h1 className="fw-bold rolText">Crear Usuario</h1>
            <p className="text-muted">
              Crea un usuario para ingreso al sistema.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="row justify-content-center"
      >
        <div className="col-lg-6 col-md-8 col-sm-10">
          {/* Selección del Rol con un select normal */}
          <div className="mb-3">
            <label htmlFor="idRol" className="label-title form-label">
              Rol del Usuario
            </label>
            {loading ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Cargando Roles...</span>
              </div>
            ) : (
              <div>
                <select
                  id="idRol"
                  className={`input-data form-select ${
                    errors.idRol ? "is-invalid" : ""
                  }`}
                  // Mantenemos el value sincronizado con nuestro estado local:
                  value={selectedOption ? selectedOption.value : ""}
                  onChange={(e) => {
                    // Si idRol es numérico en tu backend, usamos == o parseInt para comparar
                    const selectedRole = roles.find(
                      (role) => role.idRol == e.target.value
                    );

                    // Guardamos en el estado local la información del rol seleccionado
                    setSelectedOption(
                      selectedRole
                        ? {
                            value: selectedRole.idRol,
                            label: selectedRole.nombreRol,
                          }
                        : null
                    );

                    // Sincronizamos con React Hook Form
                    setValue("idRol", e.target.value);

                    // Si se ha seleccionado un rol válido, limpiamos el error de validación
                    if (e.target.value) {
                      clearErrors("idRol");
                    }
                  }}
                >
                  <option value="">Selecciona un rol...</option>
                  {roles.map((role) => (
                    <option key={role.idRol} value={role.idRol}>
                      {role.nombreRol}
                    </option>
                  ))}
                </select>

                {/* Campo hidden para que React Hook Form lo valide internamente */}
                <input
                  type="hidden"
                  {...register("idRol", {
                    required: "El rol del usuario es obligatorio.",
                  })}
                />
              </div>
            )}
            {errors.idRol && (
              <div className="invalid-feedback d-block">
                {errors.idRol.message}
              </div>
            )}
          </div>

          {/* Nombre del usuario */}
          <div className="mb-3">
            <label htmlFor="nombreUsuario" className="label-title form-label">
              Nombre del Usuario
            </label>
            <input
              type="text"
              id="nombreUsuario"
              className={`input-data form-control ${
                errors.nombreUsuario ? "is-invalid" : ""
              }`}
              placeholder="Ingrese el nombre del usuario"
              {...register("nombreUsuario", {
                required: "El nombre del usuario es obligatorio.",
              })}
            />
            {errors.nombreUsuario && (
              <div className="invalid-feedback">
                {errors.nombreUsuario.message}
              </div>
            )}
          </div>

          {/* Apellido del usuario */}
          <div className="mb-3">
            <label htmlFor="apellidoUsuario" className="label-title form-label">
              Apellido del Usuario
            </label>
            <input
              type="text"
              id="apellidoUsuario"
              className={`input-data form-control ${
                errors.apellidoUsuario ? "is-invalid" : ""
              }`}
              placeholder="Ingrese el apellido del usuario"
              {...register("apellidoUsuario", {
                required: "El apellido del usuario es obligatorio.",
              })}
            />
            {errors.apellidoUsuario && (
              <div className="invalid-feedback">
                {errors.apellidoUsuario.message}
              </div>
            )}
          </div>

          {/* Correo electrónico */}
          <div className="mb-3">
            <label htmlFor="correoUsuario" className="label-title form-label">
              Correo Electrónico
            </label>
            <input
              type="text"
              id="correoUsuario"
              className={`input-data form-control ${
                errors.correoUsuario ? "is-invalid" : ""
              }`}
              placeholder="Ingrese el correo electrónico"
              {...register("correoUsuario", {
                required: "El correo electrónico es obligatorio.",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Ingrese un correo electrónico válido.",
                },
              })}
            />
            {errors.correoUsuario && (
              <div className="invalid-feedback">
                {errors.correoUsuario.message}
              </div>
            )}
          </div>

          {/* Botón de enviar */}
          <div className="text-center">
            <button
              type="submit"
              className="btn bt-general"
              disabled={isLoadingSave}
            >
              {isLoadingSave ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Procesando...
                </>
              ) : (
                "Crear Usuario"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ---------------------------- Alertas de creación o error ----------------------- */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)} // Cierra el popup
        title="¡Éxito!"
        message={
          <>
            El usuario ha sido creado correctamente
            <br />
            <span className="text-primary">
              (El usuario ha sido enviado al correo ingresado)
            </span>
          </>
        }
        nombreBotonVolver="Ver Usuarios"
        nombreBotonNuevo="Nuevo Usuario"
        onView={() => navigate("/users")} // Redirige a Ver Usuarios
        onNew={() => {
          setIsPopupOpen(false); // Cierra el popup
          resetForm(reset, setValue, clearErrors, setSelectedOption); // Limpia el formulario
        }}
      />

      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)} // Cierra el popup
        title="¡Error!"
        message={errorPopupMessage}
        onViews={() => navigate("/users/roles")} // Redirige a Ver Roles
        onNew={() => {
          setIsPopupOpen(false); // Cierra el popup
          resetForm(reset, setValue, clearErrors, setSelectedOption); // Limpia el formulario
        }}
      />
    </div>
  );
}

export default CreateUsers;
