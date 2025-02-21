import React, { useState, useEffect } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaCalendar, FaFolder, FaUserPlus, 
  FaUsersCog, FaChevronRight, FaCog, FaSun, FaMoon 
} from 'react-icons/fa';
import { MdOutlineBakeryDining } from 'react-icons/md';
import "./Sidebar.css";

function Sidebar({ show, onClose }) {
  const [usersOpen, setUsersOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Efecto para aplicar el tema al cargar el componente
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Función para cambiar el tema
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleNavLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <div className={`sidebar bg-dark ${show ? 'show' : 'hide'}`}>
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

      {/* Toggle Switch para el tema
      <div className="theme-toggle-container">
        <label className="theme-switch">
          <input 
            type="checkbox" 
            checked={theme === 'dark'} 
            onChange={toggleTheme} 
          />
          <span className="slider round">
            {theme === 'dark' ? <FaMoon size={14} /> : <FaSun size={14} />}
          </span>
        </label>
      </div> */}

    </div>
  );
}

export default Sidebar;