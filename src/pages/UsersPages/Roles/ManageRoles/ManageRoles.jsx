import React, { useState } from "react";
import RoleCard from "../../../../components/RolesCard/RolesCard";
import { BsExclamationTriangleFill, BsFillInfoCircleFill } from "react-icons/bs";
import Alert from "../../../../components/Alerts/Alert";
import { useRoles, useRoleSearch } from "../../../../hooks/roleshooks/roles.hooks";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import ConfirmPopUp from "../../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../../components/Popup/ErrorPopUp";
import { handleConfirmDelete, handleDelele, handleEditRole } from "./ManageRolesUtils";
import "./ManageRoles.css";
import { FaShieldAlt } from "react-icons/fa";

function ManageRoles() {
  const { roles, loading, showError, showInfo, setRoles } = useRoles(); 
  const { filteredRoles, searchQuery, showNoResults, handleSearch } = useRoleSearch(roles);

  const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para el popup de confirmacion
  const [roleToDelete, setRoleToDelete] = useState(null);// Setea el id a elinar;
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);// Estado para el popup de errores
  const [errorPopupMessage, setErrorPopupMessage] = useState(false);// Setea el mensaja mostrar
  const navigate = useNavigate();


  if (loading) {
    return <div className="loading">Cargando roles...</div>;
  }

  return (
    <div className="container">
      <div className="text-center">
        <h1 className="fw-bold rolText">Roles</h1>
        <p className="text-muted">Administra los roles del sistema</p>
      </div>

      <div className="row mb-4">
        <div className="col-12 col-md-3 mb-2 mb-md-0">
          <button
            className="btnAgregarRol btn w-100"
            onClick={() => {navigate("/users/createRol")}}
          >
            <i className="fa-solid fa-plus"></i> Agregar Rol
          </button>
        </div>
        <div className="col-12 col-md-9">
          <input
            type="search"
            className="form-control"
            placeholder={showError || showInfo ? "No se pueden realizar busquedas" : "Buscar Rol"}
            value={searchQuery}
            onChange={handleSearch}
            readOnly={showError || showInfo}
          />
        </div>
      </div>

      {filteredRoles.length === 0 && !loading && !showError && showInfo && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No existen roles ingresados."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}

      {showNoResults && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se encontraron roles que coincidan con la búsqueda."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}

      <div className="row">
        {filteredRoles.map((role) => (
          <div
            className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
            key={role.idRol}
          >
            <RoleCard
              icon={<FaShieldAlt />}
              title={role.nombreRol}
              description={role.descripcionRol}
              onView={() => {handleEditRole(role.idRol, navigate)}}
              onDelete={() => handleDelele(role.idRol, setRoleToDelete, setIsPopupOpen)}
            />
          </div>
        ))}
      </div>

      {showError && !showInfo && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar los roles. Intenta mas tarde..."
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}

      {/* Confirmación personalizada */}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)} // Cierra el popup
        title="Confirmar Eliminacion"
        message="¿Estas seguro que quiers eliminar este rol?"
        onConfirm={() => handleConfirmDelete(roleToDelete, setRoles, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen )}
        onCancel={() => setIsPopupOpen(false)} // cierra el popup
      />

      {/* Componente error PopUp */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)} // Cierra el popup
        title="!Error!"
        message={errorPopupMessage}
        onViewRoles={() => navigate("/users/roles")} // Redirige a Ver Roles
        onNewRole={() => {
          setIsPopupOpen(false); // Cierra el popup
          resetForm(); // Limpia el formulario
        }}
      />
    </div>
  );
}

export default ManageRoles;
