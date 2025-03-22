import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { BsArrowLeft, BsPencil, BsCheck, BsPerson, BsEnvelope, BsPersonBadge } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { getUserData } from "../../../utils/Auth/decodedata";
import { actualizarDatosUsuario } from "../../../services/userServices/usersservices/users.service";
import { getLocalStorage } from "../../../utils/Auth/localstorage";
import successGif from "../../../assets/success.gif"; // Importa un GIF de éxito
import "./PerfilPage.css"; // Archivo CSS para estilos personalizados

const PerfilPage = () => {
  const userData = JSON.parse(getLocalStorage("userData")) || getUserData();
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({
    nombreUsuario: userData.nombreUsuario || userData.nombre,
    apellidoUsuario: userData.apellidoUsuario || userData.apellido,
    usuario: userData.usuario,
    correoUsuario: userData.correoUsuario || userData.correo,
    idRol: userData.idRol,
    fechaCreacion: "2025-01-25",
    idUsuario: userData.idUsuario,
  });
  const [isChanged, setIsChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado para el spinner
  const [showSuccess, setShowSuccess] = useState(false); // Estado para mostrar el GIF de éxito

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

  const handleSubmit = async () => {
    setIsSaving(true); // Activar el spinner
    try {
      const response = await actualizarDatosUsuario(formData);
      console.log("Datos actualizados:", response);

      updateLocalStorage("userData", formData);

      setIsEditing(false);
      setIsChanged(false);
      setEditField(false);
      setShowSuccess(true); // Mostrar el GIF de éxito

      // Ocultar el GIF después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 1100);
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    } finally {
      setIsSaving(false); // Desactivar el spinner
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

      {/* ---------------- Formulario de datos ----------------- */}
      <Row className="justify-content-center">
        <Col lg={6} sm={12}>
          <Form className="perfil-form">
            {/* Nombre */}
            <Form.Group className="mb-3">
              <Form.Label>
                <BsPerson className="me-2" /> Nombre
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
                <BsPersonBadge className="me-2" /> Apellido
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

            {/* Usuario */}
            <Form.Group className="mb-3">
              <Form.Label>
                <BsPersonBadge className="me-2" /> Usuario
              </Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="text"
                  value={formData.usuario}
                  disabled={!isEditing || editField !== "usuario"}
                  onChange={(e) => handleChange(e, "usuario")}
                  className="form-control-custom"
                />
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() =>
                    editField === "usuario" ? handleSave("usuario") : handleEdit("usuario")
                  }
                >
                  {editField === "usuario" ? (
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
                <BsEnvelope className="me-2" /> Correo
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

            {/* Botón de guardar cambios */}
            <Button
              variant="primary"
              onClick={handleSubmit}
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