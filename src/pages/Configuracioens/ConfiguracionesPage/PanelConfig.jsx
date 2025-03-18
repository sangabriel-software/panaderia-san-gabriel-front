import React from "react";
import { useNavigate } from "react-router-dom";
import { MdStorage, MdKitchen, MdSettings } from "react-icons/md"; // Iconos modernos
import "./PanelConfig.css"; // Archivo CSS para estilos
import { Container, Row, Col } from "react-bootstrap"; // Componentes de Bootstrap
import Title from "../../../components/Title/Title";
import { getUserData } from "../../../utils/Auth/decodedata";

const PanelConfig = () => {
  const navigate = useNavigate();
  const userData = getUserData();

  console.log(userData)

  // Función para redirigir a la página correspondiente
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Container className="panel-config-container">
      <Title title="Panel de configuraciones" />

      <Row className="my-4">
        {/* Sección: Materia Prima */}
        <Col xs={12} md={6} className="config-col">
          <div
            className="config-section clickable"
            onClick={() => handleNavigate("/config/gestionar-materia-prima")}
          >
            <h2 className="section-title">
              <MdStorage className="section-icon icon-materia-prima" />{" "}
              Gestionar Materia Prima
            </h2>
            <p className="section-description">
              Gestiona la cantidad de materia prima por producto producido.
            </p>
          </div>
        </Col>

        {/* Sección: Recetas (Deshabilitada) */}
        <Col xs={12} md={6} className="config-col">
          <div className="config-section">
            <h2 className="section-title">
              <MdKitchen className="section-icon icon-recetas" /> 
              Configuracion del perfil
            </h2>
            <p className="section-description">
              Gestioa tus credenciales de acceso y nombre de usuario
            </p>
          </div>
        </Col>

        {/* Sección: Otras Configuraciones (Deshabilitada) */}
        <Col xs={12} md={6} className="config-col">
          <div className="config-section disabled">
            <h2 className="section-title">
              <MdSettings className="section-icon icon-otras-config" /> Otras
              Configuraciones
            </h2>
            <p className="section-description">
              Configuración adicional del sistema y ajustes generales.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PanelConfig;