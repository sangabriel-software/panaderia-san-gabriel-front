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
import useRoles from "../../../../hooks/roleshooks/roles.hooks";
import { actualizardatosUsuarioServices } from "../../../../services/userServices/usersservices/users.service";

function ManageUsers() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombreUsuario: "", 
    apellidoUsuario: "",
    usuario: "", 
    correoUsuario: "",
    idRol: ""
  }); 
  const navigate = useNavigate();
  const { roles, loading: loadingRoles, showError: showErrorRoles } = useRoles();

  /* ------------------- Usuarios -------------------- */
  const { activeOptionsId, handleOptionsClick } = useOptionsMenu();
  const { usuarios, loadingUsers, showErrorUsers, showInfoUsers, setUsuarios } = useGetUsers();
  const { filteredUsers, searchQuery, showNoResults, handleSearch } = useUsersSerch(usuarios);
  const [userToDelete, setUserToDelete] = useState(null);

  // Función para separar nombre y apellido de manera inteligente
  const splitName = (fullName) => {
    if (!fullName) return { nombre: "", apellido: "" };
    
    const parts = fullName.trim().split(/\s+/);
    
    // Casos especiales para 1, 2 o 3 partes
    if (parts.length === 1) {
      return { nombre: parts[0], apellido: "" };
    }
    if (parts.length === 2) {
      return { nombre: parts[0], apellido: parts[1] };
    }
    if (parts.length === 3) {
      return { nombre: `${parts[0]} ${parts[1]}`, apellido: parts[2] };
    }
    
    // Para 4 o más partes, dividimos a la mitad
    const mitad = Math.floor(parts.length / 2);
    return {
      nombre: parts.slice(0, mitad).join(" "),
      apellido: parts.slice(mitad).join(" ")
    };
  };

  // Abre el modal de modificación y carga los datos del usuario
  const handleModify = (userId) => {
    const user = usuarios.find(u => u.idUsuario === userId);
    if (user) {
      const { nombre, apellido } = splitName(user.nombreUsuario);
      
      setSelectedUser(user);
      setFormData({
        nombreUsuario: nombre,
        apellidoUsuario: apellido,
        usuario: user.usuario || "",
        correoUsuario: user.correoUsuario || "",
        idRol: user.idRol || ""
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
  const handleSaveChanges = async () => {
    try {
      // Validación básica de campos requeridos
      if (!formData.nombreUsuario.trim() || !formData.correoUsuario.trim() || !formData.idRol) {
        setErrorPopupMessage("Nombre, correo y rol son campos obligatorios");
        setIsPopupErrorOpen(true);
        return;
      }

      // Crear el payload para enviar al backend
      const payload = {
        idUsuario: selectedUser.idUsuario,
        nombreUsuario: formData.nombreUsuario.trim(),
        apellidoUsuario: formData.apellidoUsuario.trim(),
        usuario: formData.usuario.trim(),
        correoUsuario: formData.correoUsuario.trim(),
        idRol: formData.idRol
      };

      // Llamada al servicio de actualización
      await actualizardatosUsuarioServices(payload);
      
      // Actualiza el usuario en el estado local
      setUsuarios(prev => prev.map(u => 
        u.idUsuario === selectedUser.idUsuario ? { 
          ...u, 
          nombreUsuario: `${payload.nombreUsuario} ${payload.apellidoUsuario}`.trim(),
          correoUsuario: payload.correoUsuario,
          idRol: payload.idRol,
          nombreRol: roles.find(r => r.idRol === payload.idRol)?.nombreRol || u.nombreRol
        } : u
      ));
      
      // Cierra el modal
      setIsModifyModalOpen(false);
      setSelectedUser(null);
      
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setErrorPopupMessage(error.response?.data?.message || "Error al actualizar el usuario. Por favor, intente nuevamente.");
      setIsPopupErrorOpen(true);
    }
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
            onClick={() => navigate("/users/create-user")}
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
                  onBlock={() => handleBloqueoDesbloqueo(
                    user.idUsuario, 
                    user.estadoUsuario, 
                    setUsuarios, 
                    setIsPopupOpen, 
                    setErrorPopupMessage, 
                    setIsPopupErrorOpen
                  )}
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

      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Confirmar Eliminación"
        message="¿Estás seguro que quieres eliminar el usuario?"
        onConfirm={() => handleConfirmDelete(
          userToDelete, 
          setUsuarios, 
          setIsPopupOpen, 
          setErrorPopupMessage, 
          setIsPopupErrorOpen
        )}
        onCancel={() => setIsPopupOpen(false)}
      />

      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />

      {isModifyModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg user-modal-container">
            <div className="modal-content user-modal-content">
              <div className="modal-header user-modal-header">
                <h5 className="modal-title user-modal-title">Modificar Usuario</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setIsModifyModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body user-modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="nombreUsuario" className="user-modal-label required">Nombre(s)</label>
                    <input
                      type="text"
                      className="form-control user-modal-input"
                      id="nombreUsuario"
                      name="nombreUsuario"
                      value={formData.nombreUsuario}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="apellidoUsuario" className="user-modal-label">Apellido(s)</label>
                    <input
                      type="text"
                      className="form-control user-modal-input"
                      id="apellidoUsuario"
                      name="apellidoUsuario"
                      value={formData.apellidoUsuario}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="usuario" className="user-modal-label">Nombre de Usuario</label>
                    <input
                      type="text"
                      className="form-control user-modal-input"
                      id="usuario"
                      name="usuario"
                      value={formData.usuario}
                      readOnly
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="correoUsuario" className="user-modal-label required">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control user-modal-input"
                      id="correoUsuario"
                      name="correoUsuario"
                      value={formData.correoUsuario}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label htmlFor="idRol" className="user-modal-label required">Rol</label>
                    <select
                      className="form-select user-modal-select"
                      id="idRol"
                      name="idRol"
                      value={formData.idRol}
                      onChange={handleInputChange}
                      disabled={loadingRoles}
                      required
                    >
                      <option value="">Seleccione un rol</option>
                      {roles.map(rol => (
                        <option key={rol.idRol} value={rol.idRol}>
                          {rol.nombreRol}
                        </option>
                      ))}
                    </select>
                    {loadingRoles && <small className="user-modal-loading-text">Cargando roles...</small>}
                    {showErrorRoles && <small className="user-modal-error-text">Error al cargar roles</small>}
                  </div>
                </div>
              </div>
              <div className="modal-footer user-modal-footer">
                <button
                  type="button"
                  className="user-modal-btn user-modal-btn-cancel"
                  onClick={() => setIsModifyModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="user-modal-btn user-modal-btn-save"
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