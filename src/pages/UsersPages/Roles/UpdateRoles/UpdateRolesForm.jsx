import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsArrowLeft, BsFillInfoCircleFill } from "react-icons/bs";
import ErrorPopup from "../../../../components/Popup/ErrorPopUp";
import WarningPopup from "../../../../components/Popup/WarningPopUp";
import "./UpdateRolesStyle.css";
import useGetPermiosos from "../../../../hooks/permisoshooks/useGetPermisos";
import { useGetRolesYPermisos } from "../../../../hooks/permisoshooks/useGetRolYPermisos";
import { useNavigate, useParams } from "react-router";
import { createDeletePermisosPayload, createModifyRolInfo, createPermisosRolPayload, getDecrytedRolId, handleToggleChange, useInitializeRoles, useOnToggleChange, } from "./UpdateRolesUtils";
import { AsignarPermisosARol, eliminarPermisosARol, } from "../../../../services/userServices/permisosservices/permisos.service";
import { actualizarRol } from "../../../../services/userServices/rolesservices/roles.service";
import UpdatePopUp from "../../../../components/Popup/UpdatePupup";
import Alert from "../../../../components/Alerts/Alert";

function UpdateRolesForm() {
  const { register, handleSubmit, setError, clearErrors, reset, formState: { errors }, } = useForm();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [isPopupWarOpen, setIsPopupWarOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  const {setSelectedPermisos, selectedPermisos, setActivatedPermisos, activatedPermisos, setDeactivatedPermisos, 
         deactivatedPermisos, setIsModified, isModified, setInitialSelectedPermisos, initialSelectedPermisos, onToggleChange } = useOnToggleChange(clearErrors, setError)
  /* ------------------------------------------------------------- */

  const { idRol } = useParams();
  const decryptedIdRol = getDecrytedRolId(idRol);
  const { permisos, loading, showError } = useGetPermiosos();//Hook - obtener permisos
  const { rolesyPermisos, loadingPR, showErrorPR } = useGetRolesYPermisos(decryptedIdRol);//Hook - consulta de roles y permiso
  useInitializeRoles({ rolesyPermisos, reset, setSelectedPermisos, setInitialSelectedPermisos, }); 
  const navigate = useNavigate();

  const onInputChange = () => {
    setIsModified(true);
  };

  const onSubmit = async (data) => {
    let resPermisosEliminados;
    let resInsertNewPermisos;
    let resUpdateRolData;

    try {
      if (deactivatedPermisos.length !== 0) {
        const permisosElimnados = createDeletePermisosPayload(
          decryptedIdRol,
          deactivatedPermisos
        );
        resPermisosEliminados = await eliminarPermisosARol(permisosElimnados);
      }

      if (activatedPermisos.length !== 0) {
        const nuevosPermisosAsignados = createPermisosRolPayload(
          decryptedIdRol,
          activatedPermisos
        );
        resInsertNewPermisos = await AsignarPermisosARol(
          nuevosPermisosAsignados
        );
      }

      const datosRolModificados = createModifyRolInfo(decryptedIdRol, data);
      resUpdateRolData = await actualizarRol(datosRolModificados);

      setIsPopupOpen(true);
    } catch (error) {
      if (error.status === 409) {
        setErrorPopupMessage("Ya existe un rol con el nombre ingresado.");
        setIsPopupErrorOpen(true);
        return;
      }

      setErrorPopupMessage("Ha ocurrido un error intenta más tarde.");
      setIsPopupErrorOpen(true);
    }
  };

  if (loading || loadingPR) return <p>Cargando permisos...</p>;
  if (showError || showErrorPR) return <p>Error al cargar permisos.</p>;

  return (
    <div className="container justify-content-center">
      {/* Titulo del fofmulario */}
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
            <h1 className="fw-bold rolText">Editar Rol</h1>
            <p className="text-muted">
              Modifica los permisos del rol seleccionado.
            </p>
          </div>
        </div>

        {/* Mensaje de advertencia */}
        {!isModified && (
          <div className="row justify-content-center">
            <div className="col-md-4 text-center">
              <Alert
                type="primary"
                message="Realice modificaciones para guardar."
                icon={<BsFillInfoCircleFill />}
              />
            </div>
          </div>
        )}
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
              readOnly
              type="text"
              id="nombreRol"
              className={`textRol form-control ${
                errors.nombreRol ? "is-invalid" : ""
              }`}
              placeholder="Ingrese el nombre del rol"
              {...register("nombreRol", {
                required: "El nombre del rol es obligatorio.",
                onChange: onInputChange,
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
              readOnly
              type="text"
              id="descripcionRol"
              className={`textRol form-control ${
                errors.descripcionRol ? "is-invalid" : ""
              }`}
              placeholder="Ingrese la descripción del rol"
              {...register("descripcionRol", {
                required: "La descripción del rol es obligatoria.",
                onChange: onInputChange,
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
                    checked={selectedPermisos?.includes(idPermiso)}
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
          <div className="text-center d-flex flex-column align-items-center gap-4">
            {/* Botones */}
            <div className="d-flex justify-content-center gap-4">
              <button
                type="button"
                className="bt-cancelar btn"
                onClick={() => {
                  navigate("/users/roles");
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`bt-general btn ${isModified ? "" : "disabled"}`}
                disabled={!isModified}
              >
                Modificar
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Popups */}
      <UpdatePopUp
        isOpen={isPopupOpen}
        onClose={() => navigate("/users/roles")}
        title="¡Rol Modificado con éxito!"
        message="El rol y/o sus permisos han sido modificados correctamente."
        onAccept={() => navigate("/users/roles")}
      />

      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
        onView={ ()=> navigate("/users/roles")}
        onNew={() => {
          setIsPopupOpen(false);
          resetForm();
        }}
      />

      <WarningPopup
        isOpen={isPopupWarOpen}
        onClose={() => setIsPopupWarOpen(false)}
        title="¡Alerta!"
        message={errorPopupMessage}
        onView={()=> navigate("/users/roles")}
        onNew={() => {
          setIsPopupWarOpen(false);
          resetForm();
        }}
      />
    </div>
  );
}

export default UpdateRolesForm;
