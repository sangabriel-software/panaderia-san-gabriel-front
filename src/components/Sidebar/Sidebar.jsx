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
import { getUserPermissions } from "../../utils/Auth/decodedata";

function Sidebar({ show, onClose }) {
  const [usersOpen, setUsersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const permisosUsuario = getUserPermissions();

  // Convertir los permisos en un objeto para facilitar la búsqueda
  const permissionsMap = permisosUsuario.reduce((acc, perm) => {
    acc[perm.rutaAcceso] = true;
    return acc;
  }, {});

  // Función para verificar si una ruta está permitida
  const isRouteAllowed = (route) => {
    return permissionsMap[route];
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
      <Nav className="flex-column pt-3">
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
