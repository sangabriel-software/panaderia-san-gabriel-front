import React, { useState } from "react";
import { BsExclamationTriangleFill, BsFillInfoCircleFill } from "react-icons/bs";
import Alert from "../../../../components/Alerts/Alert";
import { useNavigate } from "react-router-dom";
import ConfirmPopUp from "../../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../../components/Popup/ErrorPopUp";
import UsersCard from "../../../../components/UsersCard/UsersCard";
import useOptionsMenu from "../../../../hooks/usuarioshook/useOptionsMenu";
import { useGetUsers } from "../../../../hooks/usuarioshook/useGetUsers";
import { handleBloqueoDesbloqueo, handleConfirmDelete, handleDelele, useUsersSerch } from "./ManageUsersUtils";
import "./ManageUsersStyle.css";
import OrderCardSkeleton from "../../../../components/OrderCardSkeleton/OrderCardSkeleton";

function ManageUsers() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    usuario: "",
    nombreRol: "",
    estadoUsuario: "A"
  });
  const navigate = useNavigate();

  /* ------------------- Usuarios -------------------- */
  const { activeOptionsId, handleOptionsClick } = useOptionsMenu();
  const { usuarios, loadingUsers, showErrorUsers, showInfoUsers, setUsuarios } = useGetUsers();
  const { filteredUsers, searchQuery, showNoResults, handleSearch } = useUsersSerch(usuarios);
  const [userToDelete, setUserToDelete] = useState(null);

  // Abre el modal de modificación y carga los datos del usuario
  const handleModify = (userId) => {
    const user = usuarios.find(u => u.idUsuario === userId);
    if (user) {
      setSelectedUser(user);
      setFormData({
        nombreUsuario: user.nombreUsuario || "",
        usuario: user.usuario || "",
        nombreRol: user.nombreRol || "",
        estadoUsuario: user.estadoUsuario || "A"
      });
      setIsModifyModalOpen(true);
    }
  };

  // Maneja cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guarda los cambios del usuario
  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar los cambios en el backend
    console.log("Guardando cambios:", formData);
    
    // Actualiza el usuario en el estado local (esto es temporal, luego debería venir de la API)
    if (selectedUser) {
      setUsuarios(prev => prev.map(u => 
        u.idUsuario === selectedUser.idUsuario ? { ...u, ...formData } : u
      ));
    }
    
    // Cierra el modal
    setIsModifyModalOpen(false);
    setSelectedUser(null);
  };

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
            className="form-control input-data"
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
          {loadingUsers ? (
            <div className="row">
              {[...Array(6)].map((_, index) => (
                <div className="col-12 col-md-6 mb-4" key={index}>
                  <OrderCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            filteredUsers.map((user) => (
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
                  onModify={() => handleModify(user.idUsuario)}
                  onDelete={() => handleDelele(user.idUsuario, setUserToDelete, setIsPopupOpen)}
                  onBlock={() => {handleBloqueoDesbloqueo(user.idUsuario, user.estadoUsuario, setUsuarios, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen)}}
                />
              </div>
            ))
          )}
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
        onClose={() => setIsPopupOpen(false)}
        title="Confirmar Eliminación"
        message="¿Estás seguro que quieres eliminar el usuario?"
        onConfirm={() => handleConfirmDelete(userToDelete, setUsuarios, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen)}
        onCancel={() => setIsPopupOpen(false)}
      />

      {/* Componente error PopUp */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />

      {/* Modal para modificar usuario */}
      {isModifyModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modificar Usuario</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setIsModifyModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="nombreUsuario" className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreUsuario"
                    name="nombreUsuario"
                    value={formData.nombreUsuario}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="usuario" className="form-label">Nombre de Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    id="usuario"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="nombreRol" className="form-label">Rol</label>
                  <select
                    className="form-select"
                    id="nombreRol"
                    name="nombreRol"
                    value={formData.nombreRol}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione un rol</option>
                    <option value="Admin">Administrador</option>
                    <option value="Usuario">Usuario</option>
                    {/* Agrega más roles según necesites */}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="estadoUsuario" className="form-label">Estado</label>
                  <select
                    className="form-select"
                    id="estadoUsuario"
                    name="estadoUsuario"
                    value={formData.estadoUsuario}
                    onChange={handleInputChange}
                  >
                    <option value="A">Activo</option>
                    <option value="B">Bloqueado</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModifyModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveChanges}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;