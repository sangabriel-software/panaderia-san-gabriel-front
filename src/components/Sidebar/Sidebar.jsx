import React, { useState, useEffect, useCallback } from "react";
import { Nav, Collapse } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FaHome, FaUsers, FaCalendar, FaFolder, FaUserPlus, FaUsersCog, FaChevronRight, FaCog, FaSun, FaMoon, FaShoppingBag, FaStore, FaLayerGroup, FaThLarge, } from "react-icons/fa";
import { MdDashboard, MdOutlineBakeryDining } from "react-icons/md";
import * as DarkReader from "darkreader";
import "./Sidebar.css";
import { getUserData, getUserPermissions } from "../../utils/Auth/decodedata";
import { getColorFromName } from "./Sidebar.uitils";
import { FiAlertCircle, FiBox, FiCalendar, FiClipboard, FiHome, FiMapPin, FiPackage, FiPieChart, FiSettings, FiShoppingBag, FiShoppingCart, FiTruck, FiUsers } from "react-icons/fi";

function Sidebar({ show, onClose }) {
  const [usersOpen, setUsersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [inventarioOpen, setInvetarioOpen] = useState(false);
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
            {`${userData?.nombre} ${userData.apellido}`}{" "}
            {/* Nombre de usuario dinámico */}
          </a>
        </div>
      </div>

       <Nav className="flex-column">
          <Nav.Link
            as={NavLink}
            to="/home"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FiHome size={25} className="me-2" /> Inicio
          </Nav.Link>
        {isRouteAllowed("/dashboard") && (
          <Nav.Link
            as={NavLink}
            to="/dashboard"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FiPieChart size={25} className="me-2" /> Dashboard
          </Nav.Link>
        )}

          {/* Inventadio Dropdown */}
          <>
            <Nav.Link
              className="text-light d-flex justify-content-between align-items-center"
              onClick={() => setInvetarioOpen(!inventarioOpen)}
              style={{ cursor: "pointer" }}
            >
              <span>
                <FiBox size={25} className="me-2" /> Inventario
              </span>
              <FaChevronRight
                className={`dropdown-arrow ${inventarioOpen ? "open" : ""}`}
              />
            </Nav.Link>

            <Collapse in={inventarioOpen}>
              <div>
              {isRouteAllowed("/stock-productos") && (
                  <Nav.Link
                    as={NavLink}
                    to="/stock-productos"
                    className="text-light ps-4 submenu-item"
                    onClick={handleNavLinkClick}
                  >
                    <FiClipboard className="me-2" /> Control de stock
                  </Nav.Link>
                )}
              </div>
            </Collapse>
            <Collapse in={inventarioOpen}>
              <div>
              {isRouteAllowed("/descuento-stock") && (
                  <Nav.Link
                    as={NavLink}
                    to="/descuento-stock"
                    className="text-light ps-4 submenu-item"
                    onClick={handleNavLinkClick}
                  >
                    <FiAlertCircle className="me-2" /> Descontar Stock
                  </Nav.Link>
                )}
              </div>
            </Collapse>
          </>

        {/* {isRouteAllowed("/stock-productos") && (
          <Nav.Link
            as={NavLink}
            to="/stock-productos"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FiBox size={25} className="me-2" /> Inventario
          </Nav.Link>
        )} */}

        {isRouteAllowed("/ordenes-produccion") && (
          <Nav.Link
            as={NavLink}
            to="/ordenes-produccion"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FiCalendar size={25} className="me-2" /> Ordenes de producción
          </Nav.Link>
        )}

        {isRouteAllowed("/pedido-especial") && (
          <Nav.Link
            as={NavLink}
            to="/pedido-especial"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FiShoppingBag size={25} className="me-2" /> Pedido Especial
          </Nav.Link>
        )}

        {isRouteAllowed("/ventas") && (
          <Nav.Link
            as={NavLink}
            to="/ventas"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FiShoppingCart size={25} className="me-2" /> Ventas
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
                <FiUsers size={25} className="me-2" /> Usuarios
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

        {isRouteAllowed("/sucursales") && (
          <Nav.Link
            as={NavLink}
            to="/sucursales"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FiMapPin size={25} className="me-2" /> Sucursales
          </Nav.Link>
        )}

        {isRouteAllowed("/traslados-productos") && (
          <Nav.Link
            as={NavLink}
            to="/traslados-productos"
            className="text-light"
            onClick={handleNavLinkClick}
          >
            <FiTruck size={25} className="me-2" /> Traslados
          </Nav.Link>
        )}

        {/* Configuraciones Dropdown */}
          <>
            <Nav.Link
              className="text-light d-flex justify-content-between align-items-center"
              onClick={() => setConfigOpen(!configOpen)}
              style={{ cursor: "pointer" }}
            >
              <span>
                <FiSettings size={25} className="me-2" /> Configuraciones
              </span>
              <FaChevronRight
                className={`dropdown-arrow ${configOpen ? "open" : ""}`}
              />
            </Nav.Link>

            <Collapse in={configOpen}>
              <div>
                  <Nav.Link
                    as={NavLink}
                    to="/config"
                    className="text-light ps-4 submenu-item"
                    onClick={handleNavLinkClick}
                  >
                    <MdDashboard className="me-2" /> Panel de control
                  </Nav.Link>
              </div>
            </Collapse>
          </>
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
