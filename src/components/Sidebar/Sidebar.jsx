import React, { useState } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers,
  FaChartBar, 
  FaCalendar, 
  FaFolder,
  FaUserPlus,
  FaUsersCog,
  FaKey,
  FaChevronRight,
  FaCog
} from 'react-icons/fa';

function Sidebar({ show }) {
  const [usersOpen, setUsersOpen] = useState(false);

  return (
    <div className={`sidebar bg-dark ${show ? 'show' : 'hide'}`}>
      <Nav className="flex-column pt-3">
        <Nav.Link as={NavLink} to="/dashboard" className="text-light">
          <FaHome className="me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link as={NavLink} to="/schedule" className="text-light">
          <FaCalendar className="me-2" /> Pedidos
        </Nav.Link>
        <Nav.Link as={NavLink} to="/projects" className="text-light">
          <FaFolder className="me-2" /> Ventas
        </Nav.Link>
        <Nav.Link as={NavLink} to="/reports" className="text-light">
          <FaChartBar className="me-2" /> Reportes
        </Nav.Link>
        
        {/* Users Dropdown */}
        <Nav.Link 
          className="text-light d-flex justify-content-between align-items-center"
          onClick={() => setUsersOpen(!usersOpen)}
          style={{ cursor: 'pointer' }}
        >
          <span>
            <FaUsers className="me-2" /> Usuarios
          </span>
          <FaChevronRight className={`dropdown-arrow ${usersOpen ? 'open' : ''}`} />
        </Nav.Link>
        
        <Collapse in={usersOpen}>
          <div>
            <Nav.Link 
              as={NavLink} 
              to="/users/users" 
              className="text-light ps-4 submenu-item"
            >
              <FaUserPlus className="me-2" /> Gestion de usuarios
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/users/roles" 
              className="text-light ps-4 submenu-item"
            >
              <FaUsersCog className="me-2" /> Control de Roles
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/users/reset-password" 
              className="text-light ps-4 submenu-item"
            >
              <FaKey className="me-2" /> Reiniciar Contraseñas
            </Nav.Link>
          </div>
        </Collapse>

        <Nav.Link as={NavLink} to="/profile" className="text-light">
          <FaCog className="me-2" /> Configuraciones
        </Nav.Link>
      </Nav>
    </div>
  );
}

export default Sidebar;