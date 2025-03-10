import React, { useState, useEffect, useCallback } from "react";
import { Nav, Collapse } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaCalendar,
  FaFolder,
  FaUserPlus,
  FaUsersCog,
  FaChevronRight,
  FaCog,
  FaSun,
  FaMoon,
  FaShoppingBag,
  FaPlus,
  FaStore,
  FaUtensils,
} from "react-icons/fa";
import { MdDashboard, MdOutlineBakeryDining } from "react-icons/md";
import * as DarkReader from "darkreader";
import "./Sidebar.css";
import { getUserData, getUserPermissions } from "../../utils/Auth/decodedata";

function Sidebar({ show, onClose }) {
  const [usersOpen, setUsersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const permisosUsuario = getUserPermissions();
  const userData = getUserData();

  // Convertir los permisos en un objeto para facilitar la búsqueda
  const permissionsMap = permisosUsuario.reduce((acc, perm) => {
    acc[perm.rutaAcceso] = true;
    return acc;
  }, {});

  // Función para verificar si una ruta está permitida
  const isRouteAllowed = (route) => {
    return permissionsMap[route];
  };

  // Función para generar un color basado en el nombre del usuario
  const getColorFromName = (name) => {
    const colors = [
      "#FF6633",
      "#FFB399",
      "#FF33FF",
      "#FFFF99",
      "#00B3E6",
      "#E6B333",
      "#3366E6",
      "#999966",
      "#99FF99",
      "#B34D4D",
      "#80B300",
      "#809900",
      "#E6B3B3",
      "#6680B3",
      "#66991A",
      "#FF99E6",
      "#CCFF1A",
      "#FF1A66",
      "#E6331A",
      "#33FFCC",
      "#66994D",
      "#B366CC",
      "#4D8000",
      "#B33300",
      "#CC80CC",
      "#66664D",
      "#991AFF",
      "#E666FF",
      "#4DB3FF",
      "#1AB399",
      "#E666B3",
      "#33991A",
      "#CC9999",
      "#B3B31A",
      "#00E680",
      "#4D8066",
      "#809980",
      "#E6FF80",
      "#1AFF33",
      "#999933",
      "#FF3380",
      "#CCCC00",
      "#66E64D",
      "#4D80CC",
      "#9900B3",
      "#E64D66",
      "#4DB380",
      "#FF4D4D",
      "#99E6E6",
      "#6666FF",
    ];
    const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  // Efecto para aplicar el tema al cargar el componente
  useEffect(() => {
    if (theme === "dark") {
      DarkReader.enable({
        brightness: 100,
        contrast: 100,
        sepia: 0,
      });
    } else {
      DarkReader.disable();
    }
  }, [theme]);

  // Función para cambiar el tema
  const toggleTheme = useCallback(() => {
    if (isChangingTheme) return; // Evitar múltiples clics
    setIsChangingTheme(true);

    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Usar requestIdleCallback para diferir la ejecución de DarkReader
    const applyDarkReader = () => {
      if (newTheme === "dark") {
        DarkReader.enable({
          brightness: 99,
          contrast: 90,
          sepia: 10,
        });
      } else {
        DarkReader.disable();
      }
      setIsChangingTheme(false); // Habilitar el interruptor después de aplicar el tema
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(applyDarkReader);
    } else {
      setTimeout(applyDarkReader, 0); // Fallback para navegadores que no soportan requestIdleCallback
    }
  }, [theme, isChangingTheme]);

  const handleNavLinkClick = useCallback(() => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  }, [onClose]);

  return (
    <div
      className={`sidebar bg-dark ${show ? "show" : "hide"} ${
        isChangingTheme ? "disable-selection" : ""
      }`}
    >
      {/* Avatar y nombre de usuario */}
      <div className="user-panel mt-3 pb-3 mb-3 d-flex align-items-center">
        <div className="image">
          {userData?.avatar ? (
            <img
              src={userData.avatar}
              className="img-circle elevation-2"
              alt="User Image"
            />
          ) : (
            <div
              className="avatar-circle"
              style={{
                backgroundColor: getColorFromName(userData?.nombre || "A"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {userData?.nombre?.charAt(0).toUpperCase() || "A"}
            </div>
          )}
        </div>
        <div className="info">
          <a href="#" className="d-block text-light">
            {`${userData?.nombre} ${userData.apellido}`} {/* Nombre de usuario dinámico */}
          </a>
        </div>
      </div>

      <Nav className="flex-column">
        {isRouteAllowed("/dashboard") && (
          <Nav.Link
            as={NavLink}
            to="/dashboard"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FaHome size={25} className="me-2" /> Dashboard
          </Nav.Link>
        )}

        {isRouteAllowed("/ordenes-produccion") && (
          <Nav.Link
            as={NavLink}
            to="/ordenes-produccion"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FaCalendar size={25} className="me-2" /> Ordenes de producción
          </Nav.Link>
        )}

        {isRouteAllowed("/pedido-especial") && (
          <Nav.Link
            as={NavLink}
            to="/pedido-especial"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FaShoppingBag size={25} className="me-2" /> Pedido Especial
          </Nav.Link>
        )}

        {isRouteAllowed("/ventas") && (
          <Nav.Link
            as={NavLink}
            to="/ventas"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FaFolder size={25} className="me-2" /> Ventas
          </Nav.Link>
        )}

        {isRouteAllowed("/sucursales") && (
          <Nav.Link
            as={NavLink}
            to="/sucursales"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FaStore size={25} className="me-2" /> Sucursales
          </Nav.Link>
        )}

        {isRouteAllowed("/productos") && (
          <Nav.Link
            as={NavLink}
            to="/productos"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <MdOutlineBakeryDining size={25} className="me-2" /> Productos
          </Nav.Link>
        )}

        {/* Users Dropdown */}
        {(isRouteAllowed("/users") || isRouteAllowed("/users/roles")) && (
          <>
            <Nav.Link
              className="text-light d-flex justify-content-between align-items-center"
              onClick={() => setUsersOpen(!usersOpen)}
              style={{ cursor: "pointer" }}
            >
              <span>
                <FaUsers size={25} className="me-2" /> Usuarios
              </span>
              <FaChevronRight
                className={`dropdown-arrow ${usersOpen ? "open" : ""}`}
              />
            </Nav.Link>

            <Collapse in={usersOpen}>
              <div>
                {isRouteAllowed("/users") && (
                  <Nav.Link
                    as={NavLink}
                    to="/users"
                    className="text-light ps-4 submenu-item"
                    onClick={handleNavLinkClick}
                  >
                    <FaUserPlus className="me-2" /> Gestión de usuarios
                  </Nav.Link>
                )}
                {isRouteAllowed("/users/roles") && (
                  <Nav.Link
                    as={NavLink}
                    to="/users/roles"
                    className="text-light ps-4 submenu-item"
                    onClick={handleNavLinkClick}
                  >
                    <FaUsersCog className="me-2" /> Control de Roles
                  </Nav.Link>
                )}
              </div>
            </Collapse>
          </>
        )}

        {/* Configuraciones Dropdown */}
        {isRouteAllowed("/config/control-panel") && (
          <>
            <Nav.Link
              className="text-light d-flex justify-content-between align-items-center"
              onClick={() => setConfigOpen(!configOpen)}
              style={{ cursor: "pointer" }}
            >
              <span>
                <FaCog size={25} className="me-2" /> Configuraciones
              </span>
              <FaChevronRight
                className={`dropdown-arrow ${configOpen ? "open" : ""}`}
              />
            </Nav.Link>

            <Collapse in={configOpen}>
              <div>
                {isRouteAllowed("/config/control-panel") && (
                  <Nav.Link
                    as={NavLink}
                    to="/config/control-panel"
                    className="text-light ps-4 submenu-item"
                    onClick={handleNavLinkClick}
                  >
                    <MdDashboard className="me-2" /> Panel de control
                  </Nav.Link>
                )}
              </div>
            </Collapse>
          </>
        )}
      </Nav>

      {/* Toggle Switch para el tema */}
      <div className="theme-toggle-container">
        <label className="theme-switch">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
            disabled={isChangingTheme} // Deshabilitar durante el cambio
          />
          <span className="slider round">
            {isChangingTheme ? (
              <div
                className="spinner-border spinner-border-sm text-light"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : theme === "dark" ? (
              <FaMoon size={14} />
            ) : (
              <FaSun size={14} />
            )}
          </span>
        </label>
      </div>
    </div>
  );
}

export default React.memo(Sidebar);