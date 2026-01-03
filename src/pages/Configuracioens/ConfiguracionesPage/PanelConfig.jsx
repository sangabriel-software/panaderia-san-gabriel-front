import React from "react";
import { useNavigate } from "react-router-dom";
import { MdStorage, MdKitchen, MdSettings, MdOutlineSettings, MdPoll, } from "react-icons/md"; // Importar el ícono
import { Container, Row, Col } from "react-bootstrap";
import Title from "../../../components/Title/Title";
import useValidarPermisos from "../../../hooks/configuraciones/useValidarPermisos";
import { rutas } from "./config.routes";
import { handleNavigate } from "./PanelConfig.utils";
import "./PanelConfig.css";

const PanelConfig = () => {
  const navigate = useNavigate();
  const permisos = useValidarPermisos(rutas); // Usar el custom hook para obtener los permisos

  return (
    <Container className="panel-config-container">
      {/* Contenedor centrado para el ícono y el título */}
      <div className="config-title-container d-flex justify-content-center align-items-center mb-4">
        <div className="d-flex align-items-center">
          <MdOutlineSettings className="config-title-icon" size={30} />
          <Title title="Configuraciones" />
        </div>
      </div>

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

        {/* Sección: reportes */}
        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.reportes ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.reportes &&
              handleNavigate("/reportes", navigate)
            }
          >
            <h2 className="section-title">
              <MdSettings className="section-icon icon-otras-config" /> 
              Reportes
            </h2>
            <p className="section-description">
              Genera reportes de stock, ventas, etc.
            </p>
          </div>
        </Col>

        {/* Sección: configuracion de encuestas */}
        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.encuestas ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.encuestas &&
              handleNavigate("/encuestas-config", navigate)
            }
          >
            <h2 className="section-title">
             <MdPoll className="section-icon icon-encuestas" />
              Configurar Encuestas
            </h2>
            <p className="section-description">
              Configura encuestas de satisfaccion de servicios.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PanelConfig;
