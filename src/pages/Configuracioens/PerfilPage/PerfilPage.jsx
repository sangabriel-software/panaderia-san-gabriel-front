import React, { useState } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { BsArrowLeft, BsPencil, BsCheck, BsPerson, BsEnvelope, BsPersonBadge } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { getUserData } from "../../../utils/Auth/decodedata";
import { actualizarDatosUsuario } from "../../../services/userServices/usersservices/users.service";

const PerfilPage = () => {
  const userData = getUserData(); // Obtener datos del usuario
  const [editField, setEditField] = useState(null); // Campo en edición
  const [formData, setFormData] = useState({
    nombreUsuario: userData.nombre,
    apellidoUsuario: userData.apellido,
    usuario: userData.usuario,
    correoUsuario: userData.correo,
    idRol: userData.idRol,
    fechaCreacion: "2025-01-25", // Este valor debe venir del backend o localStorage
    idUsuario: userData.idUsuario,
  });
  const [isChanged, setIsChanged] = useState(false); // Estado para habilitar el botón de guardar
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar si se está editando

  // Función para actualizar el localStorage
  const updateLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error al actualizar el localStorage:", error);
    }
  };

  // Función para habilitar la edición de un campo
  const handleEdit = (field) => {
    setEditField(field);
    setIsEditing(true); // Habilitar la edición
  };

  // Función para guardar los cambios de un campo
  const handleSave = async (field) => {
    setEditField(null);
    setIsChanged(true); // Habilitar el botón de guardar cambios
  };

  // Función para manejar cambios en los inputs
  const handleChange = (e, field) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      [field]: value,
    });
    setIsChanged(true); // Habilitar el botón de guardar cambios
  };

  // Función para guardar todos los cambios
  const handleSubmit = async () => {
    try {
      const response = await actualizarDatosUsuario(formData); // Enviar datos al backend
      console.log("Datos actualizados:", response);

      // Actualizar el localStorage con los nuevos datos
      updateLocalStorage("userData", formData);

      // Deshabilitar los inputs y el botón de guardar cambios
      setIsEditing(false);
      setIsChanged(false);
      setEditField(false)
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    }
  };

  return (
    <Container>
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
        <Col lg={6} sm={12}> {/* Formulario ocupa 6 columnas en pantallas grandes y 12 en móviles */}
          <Form>
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
              disabled={!isChanged}
            >
              Guardar cambios
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default PerfilPage;