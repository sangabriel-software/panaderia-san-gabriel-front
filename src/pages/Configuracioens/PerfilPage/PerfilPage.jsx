import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { BsArrowLeft, BsPencil, BsCheck, BsPerson, BsEnvelope, BsPersonBadge, BsLock, BsEye, BsEyeSlash } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { getUserData } from "../../../utils/Auth/decodedata";
import { getLocalStorage } from "../../../utils/Auth/localstorage";
import successGif from "../../../assets/success.gif";
import "./PerfilPage.css";
import { guardarCambiosCredenciales, handleChange, handleChangePassword, handleEdit, handleSave, handleSavePersonalData, validatePasswords } from "./Permfil.utils";
import { useNavigate } from "react-router";

const PerfilPage = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(getLocalStorage("userData")) || getUserData();

  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({
    nombreUsuario: userData.nombreUsuario || userData.nombre,
    apellidoUsuario: userData.apellidoUsuario || userData.apellido,
    correoUsuario: userData.correoUsuario || userData.correo,
    usuario: userData.usuario,
    contrasena: "",
    confirmarContrasena: "",
    idUsuario: userData.idUsuario,
  });
  const [isChanged, setIsChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCredenciales, setShowCredenciales] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                      onChange={(e) => handleChange(e, "nombreUsuario", formData, setFormData, setIsChanged)}
                      className="form-control-custom"
                    />
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() =>
                        editField === "nombreUsuario"
                          ? handleSave("nombreUsuario", setEditField, setIsEditing)
                          : handleEdit("nombreUsuario", setEditField, setIsEditing)
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
                      onChange={(e) => handleChange(e, "apellidoUsuario", formData, setFormData, setIsChanged)}
                      className="form-control-custom"
                    />
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() =>
                        editField === "apellidoUsuario"
                          ? handleSave("apellidoUsuario", setEditField, setIsEditing)
                          : handleEdit("apellidoUsuario", setEditField, setIsEditing)
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
                      onChange={(e) => handleChange(e, "correoUsuario", formData, setFormData, setIsChanged)}
                      className="form-control-custom"
                    />
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() =>
                        editField === "correoUsuario"
                          ? handleSave("correoUsuario", setEditField, setIsEditing)
                          : handleEdit("correoUsuario", setEditField, setIsEditing)
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
                  onClick={() =>
                    handleSavePersonalData(
                      formData,
                      userData,
                      setIsSaving,
                      setShowSuccess,
                      setIsChanged,
                      guardarCambiosCredenciales
                    )
                  }
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
                  <div className="d-flex align-items-center position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={formData.contrasena}
                      onChange={(e) => handleChange(e, "contrasena", formData, setFormData, setIsChanged)}
                      className="form-control-custom"
                    />
                    <button 
                      type="button" 
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ zIndex: 10, padding: '0.375rem' }}
                    >
                      {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                    </button>
                  </div>
                </Form.Group>

                {/* Confirmar Contraseña */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <BsLock className="me-2" style={{ color: "#27ae60" }} /> Confirmar Contraseña
                  </Form.Label>
                  <div className="d-flex align-items-center position-relative">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmarContrasena}
                      onChange={(e) => handleChange(e, "confirmarContrasena", formData, setFormData, setIsChanged)}
                      onKeyUp={() => validatePasswords(formData, setPasswordError)}
                      className="form-control-custom"
                    />
                    <button 
                      type="button" 
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ zIndex: 10, padding: '0.375rem' }}
                    >
                      {showConfirmPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                    </button>
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
                  onClick={() =>
                    handleChangePassword(
                      formData,
                      userData,
                      setIsSaving,
                      setChangePasswordError,
                      setChangePasswordSuccess,
                      setShowSuccess,
                      setFormData,
                      setPasswordError
                    )
                  }
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