import React from "react";
import { useNavigate } from "react-router-dom";
import { MdStorage, MdKitchen, MdSettings } from "react-icons/md";
import "./PanelConfig.css";
import { Container, Row, Col } from "react-bootstrap";
import Title from "../../../components/Title/Title";
import useValidarPermisos from "../../../hooks/configuraciones/useValidarPermisos";
import { rutas } from "./config.routes";
import { handleNavigate } from "./PanelConfig.utils";


const PanelConfig = () => {
  const navigate = useNavigate();

  // Usar el custom hook para obtener los permisos
  const permisos = useValidarPermisos(rutas);

  return (
    <Container className="panel-config-container">
      <Title title="Panel de configuraciones" />

      <Row className="my-4">
        {/* Sección: Materia Prima */}
        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.gestionarMateriaPrima ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.gestionarMateriaPrima &&
              handleNavigate("/config/gestionar-materia-prima", navigate)
            }
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

        {/* Sección: Configuración del Perfil */}
        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.configuracionPerfil ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.configuracionPerfil &&
              handleNavigate("/config/configuracion-perfil", navigate)
            }
          >
            <h2 className="section-title">
              <MdKitchen className="section-icon icon-recetas" /> 
              Configuración del Perfil
            </h2>
            <p className="section-description">
              Gestiona tus credenciales de acceso y nombre de usuario.
            </p>
          </div>
        </Col>

        {/* Sección: Otras Configuraciones */}
        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.otrasConfiguraciones ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.otrasConfiguraciones &&
              handleNavigate("/config/otras-configuraciones", navigate)
            }
          >
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