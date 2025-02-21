import React, { useState } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaChartBar, FaCalendar, FaFolder, FaUserPlus, FaUsersCog, FaKey, FaChevronRight, FaCog, FaBox } from 'react-icons/fa';
import { MdOutlineBakeryDining } from 'react-icons/md';
import "./Sidebar.css";

function Sidebar({ show, onClose }) {
  const [usersOpen, setUsersOpen] = useState(false);

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
          <FaCalendar size={25} className="me-2" /> Ordens de produccion
        </Nav.Link>
        <Nav.Link as={NavLink} to="/ventas" className="text-light" onClick={handleNavLinkClick}>
          <FaFolder size={25} className="me-2" /> Ventas
        </Nav.Link>
        {/* <Nav.Link as={NavLink} to="/reports" className="text-light" onClick={handleNavLinkClick}>
          <FaChartBar size={25} className="me-2" /> Reportes
        </Nav.Link> */}

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
              <FaUserPlus className="me-2" /> Gestion de usuarios
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
{/* 
        <Nav.Link as={NavLink} to="/config" className="text-light" onClick={handleNavLinkClick}>
          <FaCog className="me-2" size={25} /> Configuraciones
        </Nav.Link> */}
      </Nav>
    </div>
  );
}

export default Sidebar;