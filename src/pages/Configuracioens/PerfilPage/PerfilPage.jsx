import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { BsArrowLeft, BsPencil, BsCheck, BsPerson, BsEnvelope, BsPersonBadge, BsLock } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { getUserData } from "../../../utils/Auth/decodedata";
import { getLocalStorage } from "../../../utils/Auth/localstorage";
import successGif from "../../../assets/success.gif"; // Importa un GIF de éxito
import "./PerfilPage.css"; // Archivo CSS para estilos personalizados
import { cambiarPassSErvice, actualizarDatosUsuario } from "../../../services/userServices/usersservices/users.service";

const PerfilPage = () => {
  const userData = JSON.parse(getLocalStorage("userData")) || getUserData();
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({
    nombreUsuario: userData.nombreUsuario || userData.nombre,
    apellidoUsuario: userData.apellidoUsuario || userData.apellido,
    correoUsuario: userData.correoUsuario || userData.correo,
    usuario: userData.usuario,
    contrasena: "",
    confirmarContrasena: "",
    idRol: userData.idRol,
    fechaCreacion: "2025-01-25",
    idUsuario: userData.idUsuario,
  });
  const [isChanged, setIsChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado para el spinner
  const [showSuccess, setShowSuccess] = useState(false); // Estado para mostrar el GIF de éxito
  const [showCredenciales, setShowCredenciales] = useState(false); // Estado para mostrar/ocultar credenciales
  const [passwordError, setPasswordError] = useState(""); // Estado para el mensaje de error de contraseña
  const [changePasswordError, setChangePasswordError] = useState(""); // Estado para el mensaje de error al cambiar la contraseña
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(""); // Estado para el mensaje de éxito al cambiar la contraseña

  const updateLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error al actualizar el localStorage:", error);
    }
  };

  const handleEdit = (field) => {
    setEditField(field);
    setIsEditing(true);
  };

  const handleSave = async (field) => {
    setEditField(null);
    setIsChanged(true);
  };

  const handleChange = (e, field) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      [field]: value,
    });
    setIsChanged(true);
  };

  const validatePasswords = () => {
    // Solo validar si el campo de confirmación de contraseña no está vacío
    if (formData.confirmarContrasena.trim() !== "") {
      if (formData.contrasena !== formData.confirmarContrasena) {
        setPasswordError("Las contraseñas no coinciden");
        return false; // Retorna false si no coinciden
      } else {
        setPasswordError(""); // Limpia el mensaje de error
        return true; // Retorna true si coinciden
      }
    } else {
      setPasswordError(""); // Limpia el mensaje de error si el campo está vacío
      return false; // Retorna false si el campo está vacío
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) {
      return; // Detiene la ejecución si las contraseñas no coinciden
    }

    setIsSaving(true); // Activar el spinner
    setChangePasswordError(""); // Limpiar mensajes de error anteriores
    setChangePasswordSuccess(""); // Limpiar mensajes de éxito anteriores

    try {
      const payload = {
        contrasena: formData.contrasena, // Nueva contraseña
        usuario: userData.usuario, // Usuario autenticado
      };

      const response = await cambiarPassSErvice(payload); // Consumir el servicio
      console.log("Contraseña cambiada:", response);

      setChangePasswordSuccess("Contraseña cambiada exitosamente"); // Mostrar mensaje de éxito
      setShowSuccess(true); // Mostrar el GIF de éxito

      // Limpiar el formulario después de un cambio exitoso
      setFormData({
        ...formData,
        contrasena: "",
        confirmarContrasena: "",
      });
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      setChangePasswordError("Error al cambiar la contraseña. Inténtalo de nuevo."); // Mostrar mensaje de error
    } finally {
      setIsSaving(false); // Desactivar el spinner
      setTimeout(() => {
        setShowSuccess(false); // Ocultar el GIF de éxito después de 1.1 segundos
      }, 1650);
    }
  };

  const handleSavePersonalData = async () => {
    setIsSaving(true); // Activar el spinner
    try {
      const payload = {
        nombreUsuario: formData.nombreUsuario,
        apellidoUsuario: formData.apellidoUsuario,
        correoUsuario: formData.correoUsuario,
        usuario: userData.usuario,
        idUsuario: formData.idUsuario,
      };

      const response = await actualizarDatosUsuario(payload); // Consumir el servicio
      console.log("Datos actualizados:", response);

      setShowSuccess(true); // Mostrar el GIF de éxito
      setIsChanged(false); // Desactivar el estado de cambios
      updateLocalStorage("userData", { ...userData, ...payload }); // Actualizar localStorage
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    } finally {
      setIsSaving(false); // Desactivar el spinner
      setTimeout(() => {
        setShowSuccess(false); // Ocultar el GIF de éxito después de 1.1 segundos
      }, 1650);
    }
  };

  return (
    <Container className="perfil-container">
      {/* ---------------- Titulo ----------------- */}
      <div className="text-center mb-3">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/config")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title
              title="Datos personales"
              description="Configura tus datos personales y tus credenciales."
            />
          </div>
        </div>
      </div>

      {/* ---------------- Opciones de navegación ----------------- */}
      <Row className="justify-content-center mb-4">
        <Col lg={6} sm={12}>
          <div className="d-flex justify-content-between">
            <Button
              variant="primary"
              className="w-50 me-2"
              onClick={() => setShowCredenciales(false)}
              active={!showCredenciales}
            >
              Datos Personales
            </Button>
            <Button
              variant="primary"
              className="w-50"
              onClick={() => setShowCredenciales(true)}
              active={showCredenciales}
            >
              Credenciales
            </Button>
          </div>
        </Col>
      </Row>

      {/* ---------------- Formulario de datos ----------------- */}
      <Row className="justify-content-center">
        <Col lg={6} sm={12}>
          <Form className="perfil-form">
            {/* Sección 1: Datos Personales */}
            {!showCredenciales && (
              <div className="mb-4">
                <h5 className="mb-3" style={{ color: "#2c3e50" }}>Datos Personales</h5>
                {/* Nombre */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <BsPerson className="me-2" style={{ color: "#3498db" }} /> Nombre
                  </Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      value={formData.nombreUsuario}
                      disabled={!isEditing || editField !== "nombreUsuario"}
                      onChange={(e) => handleChange(e, "nombreUsuario")}
                      className="form-control-custom"
                    />
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() =>
                        editField === "nombreUsuario"
                          ? handleSave("nombreUsuario")
                          : handleEdit("nombreUsuario")
                      }
                    >
                      {editField === "nombreUsuario" ? (
                        <BsCheck size={20} className="text-success" />
                      ) : (
                        <BsPencil size={20} className={isEditing ? "text-primary" : "text-secondary"} />
                      )}
                    </button>
                  </div>
                </Form.Group>

                {/* Apellido */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <BsPersonBadge className="me-2" style={{ color: "#8e44ad" }} /> Apellido
                  </Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      value={formData.apellidoUsuario}
                      disabled={!isEditing || editField !== "apellidoUsuario"}
                      onChange={(e) => handleChange(e, "apellidoUsuario")}
                      className="form-control-custom"
                    />
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() =>
                        editField === "apellidoUsuario"
                          ? handleSave("apellidoUsuario")
                          : handleEdit("apellidoUsuario")
                      }
                    >
                      {editField === "apellidoUsuario" ? (
                        <BsCheck size={20} className="text-success" />
                      ) : (
                        <BsPencil size={20} className={isEditing ? "text-primary" : "text-secondary"} />
                      )}
                    </button>
                  </div>
                </Form.Group>

                {/* Correo */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <BsEnvelope className="me-2" style={{ color: "#e74c3c" }} /> Correo
                  </Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="email"
                      value={formData.correoUsuario}
                      disabled={!isEditing || editField !== "correoUsuario"}
                      onChange={(e) => handleChange(e, "correoUsuario")}
                      className="form-control-custom"
                    />
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() =>
                        editField === "correoUsuario"
                          ? handleSave("correoUsuario")
                          : handleEdit("correoUsuario")
                      }
                    >
                      {editField === "correoUsuario" ? (
                        <BsCheck size={20} className="text-success" />
                      ) : (
                        <BsPencil size={20} className={isEditing ? "text-primary" : "text-secondary"} />
                      )}
                    </button>
                  </div>
                </Form.Group>

                {/* Botón para guardar cambios en datos personales */}
                <Button
                  variant="primary"
                  onClick={handleSavePersonalData}
                  disabled={!isChanged || isSaving}
                  className="save-button"
                >
                  {isSaving ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                  ) : null}
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            )}

            {/* Sección 2: Credenciales */}
            {showCredenciales && (
              <div className="mb-4">
                <h5 className="mb-3" style={{ color: "#2c3e50" }}>Credenciales</h5>
                {/* Usuario */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <BsPerson className="me-2" style={{ color: "#3498db" }} /> Usuario
                  </Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      value={formData.usuario}
                      disabled
                      className="form-control-custom"
                    />
                  </div>
                </Form.Group>

                {/* Contraseña */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <BsLock className="me-2" style={{ color: "#27ae60" }} /> Nueva Contraseña
                  </Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="password"
                      value={formData.contrasena}
                      onChange={(e) => handleChange(e, "contrasena")}
                      className="form-control-custom"
                    />
                    {/* Espacio para mantener el mismo tamaño */}
                    <div style={{ width: "50px" }}></div>
                  </div>
                </Form.Group>

                {/* Confirmar Contraseña */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <BsLock className="me-2" style={{ color: "#27ae60" }} /> Confirmar Contraseña
                  </Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="password"
                      value={formData.confirmarContrasena}
                      onChange={(e) => handleChange(e, "confirmarContrasena")}
                      onKeyUp={validatePasswords} // Validar mientras el usuario escribe
                      className="form-control-custom"
                    />
                    {/* Espacio para mantener el mismo tamaño */}
                    <div style={{ width: "50px" }}></div>
                  </div>
                  {passwordError && (
                    <div className="text-danger mt-2">{passwordError}</div>
                  )}
                </Form.Group>

                {/* Mensajes de éxito o error al cambiar la contraseña */}
                {changePasswordSuccess && (
                  <Alert variant="success" className="mt-3">
                    {changePasswordSuccess}
                  </Alert>
                )}
                {changePasswordError && (
                  <Alert variant="danger" className="mt-3">
                    {changePasswordError}
                  </Alert>
                )}

                {/* Botón para cambiar la contraseña */}
                <Button
                  variant="primary"
                  onClick={handleChangePassword}
                  disabled={!isChanged || isSaving || passwordError}
                  className="save-button"
                >
                  {isSaving ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                  ) : null}
                  {isSaving ? "Guardando..." : "Cambiar contraseña"}
                </Button>
              </div>
            )}
          </Form>
        </Col>
      </Row>

      {/* Feedback de éxito (superpuesto) */}
      {showSuccess && (
        <div className="success-overlay">
          <div>
            <img src={successGif} alt="Éxito" className="success-gif" />
          </div>
        </div>
      )}
    </Container>
  );
};

export default PerfilPage;