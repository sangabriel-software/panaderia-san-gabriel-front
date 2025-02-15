import React from "react";
import { useCreateRolFormLogic } from "./rolesUtils";
import SuccessPopup from "../../../../components/Popup/SuccessPopup";
import ErrorPopup from "../../../../components/Popup/ErrorPopUp";
import WarningPopup from "../../../../components/Popup/WarningPopUp";
import "./CreateRolForm.css";
import { BsArrowLeft } from "react-icons/bs";

function CreateRolForm() {
  const {
    register,
    handleSubmit,
    errors,
    permisos,
    loading,
    showError,
    selectedPermisos,
    isPopupOpen,
    isPopupErrorOpen,
    isPopupWarOpen,
    errorPopupMessage,
    resetForm,
    onToggleChange,
    onSubmit,
    setIsPopupOpen,
    setIsPopupErrorOpen,
    setIsPopupWarOpen,
    navigate,
  } = useCreateRolFormLogic();

  if (loading) return <p>Cargando permisos...</p>;
  if (showError) return <p>Error al cargar permisos.</p>;

  return (
    <div className="container justify-content-center">
      {/* Titulo del formulari */}
      <div className="text-center mb-4">
        <div className="row">
          <div className="col-2">
            {/* Botón de volver */}
            <button
              className="btn bt-return  rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/users/roles")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <h1 className="fw-bold rolText">Ingresar Rol</h1>
            <p className="text-muted">
              Ingresa los permisos del rol seleccionado.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="row justify-content-center"
      >
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="mb-3">
            <label htmlFor="nombreRol" className="form-label">
              Nombre del Rol
            </label>
            <input
              type="text"
              id="nombreRol"
              className={`textRol form-control ${
                errors.nombreRol ? "is-invalid" : ""
              }`}
              placeholder="Ingrese el nombre del rol"
              {...register("nombreRol", {
                required: "El nombre del rol es obligatorio.",
              })}
            />
            {errors.nombreRol && (
              <div className="invalid-feedback">{errors.nombreRol.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="descripcionRol" className="form-label">
              Descripción del Rol
            </label>
            <input
              type="text"
              id="descripcionRol"
              className={`textRol form-control ${
                errors.descripcionRol ? "is-invalid" : ""
              }`}
              placeholder="Ingrese la descripción del rol"
              {...register("descripcionRol", {
                required: "La descripción del rol es obligatoria.",
              })}
            />
            {errors.descripcionRol && (
              <div className="invalid-feedback">
                {errors.descripcionRol.message}
              </div>
            )}
          </div>

          <div className="card custom-permisos-card p-4 mb-4">
            <h5 className="title-permisos text-center mb-3 fw-bold">
              Permisos del Usuario
            </h5>
            <div className="row">
              {permisos.map(({ idPermiso, nombrePermiso }) => (
                <div
                  className="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 col-xxl-6 d-flex form-switch align-items-center mb-2"
                  key={idPermiso}
                >
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={selectedPermisos.includes(idPermiso)}
                    onChange={() => onToggleChange(idPermiso)}
                  />
                  <label className="form-check-label">{nombrePermiso}</label>
                </div>
              ))}
            </div>
            {errors.permisos && (
              <div className="text-danger text-center mt-2">
                {errors.permisos.message}
              </div>
            )}
          </div>

          <div className="text-center">
            <button type="submit" className="btnGuardarRol btn">
              Guardar
            </button>
          </div>
        </div>
      </form>

      {/* Componente SuccessPopup */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)} // Cierra el popup
        title="¡Rol creado con éxito!"
        message="El rol y sus permisos han sido asignados correctamente."
        onView={()=> navigate("/users/roles")} // Redirige a Ver Roles
        onNew={() => {
          setIsPopupOpen(false); // Cierra el popup
          resetForm(); // Limpia el formulario
        }}
      />

      {/* Componente error PopUp */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)} // Cierra el popup
        title="¡Error!"
        message={errorPopupMessage}
        onViews={() => navigate("/users/roles")} // Redirige a Ver Roles
        onNew={() => {
          setIsPopupOpen(false); // Cierra el popup
          resetForm(); // Limpia el formulario
        }}
      />

      {/* Componente Warning PopUp */}
      <WarningPopup
        isOpen={isPopupWarOpen}
        onClose={() => setIsPopupWarOpen(false)} // Cierra el popup
        title="!Alerta!"
        message={errorPopupMessage}
        onViews={() => navigate("/users/roles")} // Redirige a Ver Roles
        onNew={() => {
          setIsPopupWarOpen(false); // Cierra el popup
          resetForm(); // Limpia el formulario
        }}
      />
    </div>
  );
}

export default CreateRolForm;
