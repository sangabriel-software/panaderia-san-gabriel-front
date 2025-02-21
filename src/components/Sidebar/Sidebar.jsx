import React, { useState, useEffect, useCallback } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaCalendar, FaFolder, FaUserPlus, 
  FaUsersCog, FaChevronRight, FaCog, FaSun, FaMoon 
} from 'react-icons/fa';
import { MdOutlineBakeryDining } from 'react-icons/md';
import * as DarkReader from 'darkreader';
import "./Sidebar.css";

function Sidebar({ show, onClose }) {
  const [usersOpen, setUsersOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isChangingTheme, setIsChangingTheme] = useState(false);

  // Efecto para aplicar el tema al cargar el componente
  useEffect(() => {
    if (theme === 'dark') {
      DarkReader.enable({
        brightness: 95,
        contrast: 90,
        sepia: 10
      });
    } else {
      DarkReader.disable();
    }
  }, [theme]);

  // Función para cambiar el tema
  const toggleTheme = useCallback(() => {
    if (isChangingTheme) return; // Evitar múltiples clics
    setIsChangingTheme(true);

    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Usar requestIdleCallback para diferir la ejecución de DarkReader
    const applyDarkReader = () => {
      if (newTheme === 'dark') {
        DarkReader.enable({
          brightness: 99,
          contrast: 90,
          sepia: 10
        });
      } else {
        DarkReader.disable();
      }
      setIsChangingTheme(false); // Habilitar el interruptor después de aplicar el tema
    };

    if ('requestIdleCallback' in window) {
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
    <div className={`sidebar bg-dark ${show ? 'show' : 'hide'} ${isChangingTheme ? 'disable-selection' : ''}`}>
      <Nav className="flex-column pt-3">
        <Nav.Link as={NavLink} to="/dashboard" className="text-light" onClick={handleNavLinkClick}>
          <FaHome size={25} className="me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link as={NavLink} to="/ordenes-produccion" className="text-light" onClick={handleNavLinkClick}>
          <FaCalendar size={25} className="me-2" /> Ordenes de producción
        </Nav.Link>
        <Nav.Link as={NavLink} to="/ventas" className="text-light" onClick={handleNavLinkClick}>
          <FaFolder size={25} className="me-2" /> Ventas
        </Nav.Link>
        <Nav.Link as={NavLink} to="/productos" className="text-light" onClick={handleNavLinkClick}>
          <MdOutlineBakeryDining size={25} className="me-2" /> Productos
        </Nav.Link>

        {/* Users Dropdown */}
        <Nav.Link 
          className="text-light d-flex justify-content-between align-items-center"
          onClick={() => setUsersOpen(!usersOpen)}
          style={{ cursor: 'pointer' }}
        >
          <span>
            <FaUsers size={25} className="me-2"  /> Usuarios
          </span>
          <FaChevronRight className={`dropdown-arrow ${usersOpen ? 'open' : ''}`} />
        </Nav.Link>
        
        <Collapse in={usersOpen}>
          <div>
            <Nav.Link 
              as={NavLink} 
              to="/users/users" 
              className="text-light ps-4 submenu-item"
              onClick={handleNavLinkClick}
            >
              <FaUserPlus className="me-2" /> Gestión de usuarios
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/users/roles" 
              className="text-light ps-4 submenu-item"
              onClick={handleNavLinkClick}
            >
              <FaUsersCog className="me-2" /> Control de Roles
            </Nav.Link>
          </div>
        </Collapse>

        <Nav.Link as={NavLink} to="/config" className="text-light" onClick={handleNavLinkClick}>
          <FaCog className="me-2" size={25} /> Configuraciones
        </Nav.Link>
      </Nav>

      {/* Toggle Switch para el tema */}
      <div className="theme-toggle-container">
        <label className="theme-switch">
          <input 
            type="checkbox" 
            checked={theme === 'dark'} 
            onChange={toggleTheme} 
            disabled={isChangingTheme} // Deshabilitar durante el cambio
          />
          <span className="slider round">
            {isChangingTheme ? (
              <div className="spinner-border spinner-border-sm text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : theme === 'dark' ? (
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