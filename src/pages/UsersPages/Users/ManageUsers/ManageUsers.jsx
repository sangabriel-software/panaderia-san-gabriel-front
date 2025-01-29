import React, { useState } from "react";
import { BsExclamationTriangleFill, BsFillInfoCircleFill } from "react-icons/bs";
import Alert from "../../../../components/Alerts/Alert";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import ConfirmPopUp from "../../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../../components/Popup/ErrorPopUp";
import UsersCard from "../../../../components/UsersCard/UsersCard";
import useOptionsMenu from "../../../../hooks/usuarioshook/useOptionsMenu";
import { useGetUsers } from "../../../../hooks/usuarioshook/useGetUsers";
import { handleBloqueoDesbloqueo, handleConfirmDelete, handleDelele, useUsersSerch } from "./ManageUsersUtils";
import "./ManageUsersStyle.css"

function ManageUsers() {

  const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para el popup de confirmacion
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false); // Estado para el popup de errores
  const [errorPopupMessage, setErrorPopupMessage] = useState(false); // Setea el mensaje a mostrar
  const navigate = useNavigate();

  /* ------------------- Usuarios -------------------- */
  const { activeOptionsId, handleOptionsClick } = useOptionsMenu();
  const { usuarios, loadingUsers, showErrorUsers, showInfoUsers, setUsuarios } = useGetUsers();
  const { filteredUsers, searchQuery, showNoResults, handleSearch } = useUsersSerch(usuarios);
  const [ userToDelete, setUserToDelete] = useState(null); // Setea el id a eliminar


  if (loadingUsers) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div className="container">
      <div className="text-center">
        <h1 className="fw-bold rolText">Usuarios</h1>
        <p className="text-muted">Administra los usuarios del sistema</p>
      </div>

      <div className="row mb-4">
        <div className="col-12 col-md-3 mb-2 mb-md-0">
          <button
            className="btnAgregarUsuario btn w-100"
            onClick={() => {
              navigate("/users/create-user");
            }}
          >
            <i className="fa-solid fa-plus"></i> Crear Usuario
          </button>
        </div>
        <div className="col-12 col-md-9">
          <input
            type="search"
            className="form-control"
            placeholder={
              showErrorUsers || showInfoUsers
                ? "No se pueden realizar búsquedas"
                : "Buscar Usuario"
            }
            value={searchQuery}
            onChange={handleSearch}
            readOnly={showErrorUsers || showInfoUsers}
          />
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          {filteredUsers.map((user) => (
            <div key={user.idUsuario} className="col-xs-12 col-12 col-lg-6 mb-4">
              <UsersCard
                id={user.idUsuario}
                name={`${user.nombreUsuario}`}
                username={user.usuario}
                role={user.nombreRol}
                status={user.estadoUsuario === "A" ? "Activo" : "Bloqueado"}
                image=""
                showOptions={activeOptionsId === user.idUsuario}
                onOptionsClick={(e) => handleOptionsClick(user.idUsuario, e)}
                onModify={()=> {navigate("/users/createUser")}}
                onDelete={() => handleDelele(user.idUsuario, setUserToDelete, setIsPopupOpen)}
                onBlock={() => {handleBloqueoDesbloqueo(user.idUsuario, user.estadoUsuario, setUsuarios, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen)}}
              />
            </div>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 && !loadingUsers && !showErrorUsers && showInfoUsers && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No hay usuarios ingresados."
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
              message="No se encontraron usuarios que coincidan con la búsqueda."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}

      {showErrorUsers && !showInfoUsers && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar los usuarios. Intenta más tarde..."
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}

      {/* Confirmación personalizada */}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)} // Cierra el popup
        title="Confirmar Eliminación"
        message="¿Estás seguro que quieres eliminar el usuario?"
        onConfirm={() => handleConfirmDelete(userToDelete, setUsuarios, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen)}
        onCancel={() => setIsPopupOpen(false)} // cierra el popup
      />

      {/* Componente error PopUp */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)} // Cierra el popup
        title="¡Error!"
        message={errorPopupMessage}
      />
    </div>
  );
}

export default ManageUsers;
