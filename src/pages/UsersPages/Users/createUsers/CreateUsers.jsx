import { BsArrowLeft } from "react-icons/bs";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import useRoles from "../../../../hooks/roleshooks/roles.hooks";
import "./CreateUsersStyles.css";
import { handleCreateUserSubmit, resetForm } from "./CreateUsersUtils";
import SuccessPopup from "../../../../components/Popup/SuccessPopup";
import { useState } from "react";
import ErrorPopup from "../../../../components/Popup/ErrorPopUp";
import { Spinner } from "react-bootstrap";
import useGetSucursales from "../../../../hooks/sucursales/useGetSucursales";

function CreateUsers() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const { register, handleSubmit, reset, formState: { errors }, setValue, clearErrors } = useForm();
  const { roles, loading } = useRoles();
  const [isLoadingSave, setIsloadingSave] = useState(false);
  const navigate = useNavigate();
  const { sucursales, loadingSucursales } = useGetSucursales();

  const onSubmit = (data) => {
    handleCreateUserSubmit(data, reset, setIsPopupOpen, setIsPopupErrorOpen, setErrorPopupMessage, setIsloadingSave);
  };

  return (
    <div className="container justify-content-center">
      {/* Título del formulario */}
      <div className="text-center mb-3">
        <div className="row">
          <div className="col-2">
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
          {/* Selección del Rol */}
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
                  value={selectedOption ? selectedOption.value : ""}
                  onChange={(e) => {
                    const selectedRole = roles.find(
                      (role) => role.idRol == e.target.value
                    );

                    setSelectedOption(
                      selectedRole
                        ? {
                            value: selectedRole.idRol,
                            label: selectedRole.nombreRol,
                          }
                        : null
                    );

                    setValue("idRol", e.target.value);

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

          {/* Selección de Sucursal */}
          <div className="mb-3">
            <label htmlFor="idSucursal" className="label-title form-label">
              Sucursal Asignada
            </label>
            {loadingSucursales ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Cargando Sucursales...</span>
              </div>
            ) : (
              <div>
                <select
                  id="idSucursal"
                  className={`input-data form-select ${
                    errors.idSucursal ? "is-invalid" : ""
                  }`}
                  value={selectedSucursal ? selectedSucursal.value : ""}
                  onChange={(e) => {
                    const selectedSucursalItem = sucursales.find(
                      (sucursal) => sucursal.idSucursal == e.target.value
                    );

                    setSelectedSucursal(
                      selectedSucursalItem
                        ? {
                            value: selectedSucursalItem.idSucursal,
                            label: selectedSucursalItem.nombreSucursal,
                          }
                        : null
                    );

                    setValue("idSucursal", e.target.value);

                    if (e.target.value) {
                      clearErrors("idSucursal");
                    }
                  }}
                >
                  <option value="">Selecciona una sucursal...</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                      {sucursal.nombreSucursal} - {sucursal.municipioSucursal}
                    </option>
                  ))}
                </select>

                <input
                  type="hidden"
                  {...register("idSucursal", {
                    required: "La sucursal del usuario es obligatoria.",
                  })}
                />
              </div>
            )}
            {errors.idSucursal && (
              <div className="invalid-feedback d-block">
                {errors.idSucursal.message}
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

      {/* Alertas de creación o error */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
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
        onView={() => navigate("/users")}
        onNew={() => {
          setIsPopupOpen(false);
          resetForm(reset, setValue, clearErrors, setSelectedOption, setSelectedSucursal);
        }}
      />

      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
        onViews={() => navigate("/users/roles")}
        onNew={() => {
          setIsPopupOpen(false);
          resetForm(reset, setValue, clearErrors, setSelectedOption, setSelectedSucursal);
        }}
      />
    </div>
  );
}

export default CreateUsers;