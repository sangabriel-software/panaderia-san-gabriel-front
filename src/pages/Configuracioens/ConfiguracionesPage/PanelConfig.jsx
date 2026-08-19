import React from "react";
import { useNavigate } from "react-router-dom";
import { MdStorage, MdKitchen, MdSettings, MdOutlineSettings, MdPoll, MdOutlineCalendarToday, MdNotificationsActive, MdCategory, } from "react-icons/md"; // Importar el ícono
import { Container, Row, Col } from "react-bootstrap";
import Title from "../../../components/Title/Title";
import useValidarPermisos from "../../../hooks/configuraciones/useValidarPermisos";
import { rutas } from "./config.routes";
import { handleNavigate } from "./PanelConfig.utils";
import "./PanelConfig.css";
import { getUserData } from "../../../utils/Auth/decodedata";
import { FiClipboard, FiMapPin, FiUsers } from "react-icons/fi";
import { FaUserPlus } from "react-icons/fa";

const PanelConfig = () => {
  const navigate = useNavigate();
  const permisos = useValidarPermisos(rutas); // Usar el custom hook para obtener los permisos
  const usuario = getUserData();
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
        {/* Sección: Usuarios */}
        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.usuarios ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.usuarios &&
              handleNavigate("/users", navigate)
            }
          >
            <h2 className="section-title">
              <FiUsers className="section-icon icon-usuarios" />{" "}
              Creacion de Usuarios
            </h2>
            <p className="section-description">
              Gestiona la cantidad de materia prima por producto producido.
            </p>
          </div>
        </Col>

        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.usuarios ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.usuarios &&
              handleNavigate("/users/roles", navigate)
            }
          >
            <h2 className="section-title">
              <FaUserPlus className="section-icon icon-roles" />{" "}
              Gestion de Roles y Permisos
            </h2>
            <p className="section-description">
              Gestiona los roles  y permisos para los usuarios.
            </p>
          </div>
        </Col>

        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.sucursales ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.sucursales &&
              handleNavigate("/sucursales", navigate)
            }
          >
            <h2 className="section-title">
              <FiMapPin className="section-icon icon-sucursales" />{" "}
              Sucursales
            </h2>
            <p className="section-description">
              Creacion de nuevas sucursales.
            </p>
          </div>
        </Col>

        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.productos ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.productos &&
              handleNavigate("/productos", navigate)
            }
          >
            <h2 className="section-title">
              <FiClipboard className="section-icon icon-productos" />{" "}
              Productos
            </h2>
            <p className="section-description">
              Creacion de nuevos productos.
            </p>
          </div>
        </Col>

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

        {/* Sección: activacion de fecha de produccion */}
        {(usuario?.usuario === "admin" || usuario?.usuario === "aagarcia") && (
          <Col xs={12} md={6} className="config-col">
            <div
              className={`config-section ${
                permisos.activarFechaProduccion ? "clickable" : "disabled"
              }`}
              onClick={() =>
                permisos.activarFechaProduccion &&
                handleNavigate("/activar-fecha-produccion", navigate)
              }
            >
              <h2 className="section-title">
                <MdOutlineCalendarToday className="section-icon icon-fecha-produc" />
                Activar Fecha en curso
              </h2>
              <p className="section-description">
                Activa dia en curso para ingreso de orden de Produccion.
              </p>
            </div>
          </Col>
        )}

        {/* Sección: activacion de notificaciones especiales */}
        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.notificaciones ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.notificaciones &&
              handleNavigate("/habilitar-notificaciones", navigate)
            }
          >
            <h2 className="section-title">
             <MdNotificationsActive className="section-icon icon-noti-activos" />
              Habilitar Notificaciones
            </h2>
            <p className="section-description">
              Habilita notificaciones especiales para usuarios.
            </p>
          </div>
        </Col>

        {/* Sección: Confirguracion de categorigas */}
        <Col xs={12} md={6} className="config-col">
          <div
            className={`config-section ${
              permisos.categorias ? "clickable" : "disabled"
            }`}
            onClick={() =>
              permisos.categorias &&
              handleNavigate("/categorias", navigate)
            }
          >
            <h2 className="section-title">
             <MdCategory className="section-icon icon-categorias" />
              Categorias
            </h2>
            <p className="section-description">
              Configura las categorias de productos.
            </p>
          </div>
        </Col>

      </Row>
    </Container>
  );
};

export default PanelConfig;
