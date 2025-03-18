import React from 'react';
import { Dropdown, Image } from 'react-bootstrap';
import { FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Importa Link
import useLogout from '../../services/session/logout';

function UserDropdown() {
  const { handleLogout } = useLogout();

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" className="nav-link p-0 text-light custom-dropdown-toggle">
        <Image
          src="https://i.pinimg.com/originals/d3/a2/9d/d3a29d4e0fa8e004b274880ec979b1e2.jpg"
          roundedCircle
          width={40}
          height={40}
          className="border border-2 border-light custom-image-dropdown"
        />
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow">
        <Dropdown.Item href="#profile">
          <FaUser className="me-2" />
          Perfil
        </Dropdown.Item>
        {/* Reemplaza el Dropdown.Item con Link */}
        <Link to="/config/control-panel" className="dropdown-item">
          <FaCog className="me-2" />
          Configuraciones
        </Link>
        <Dropdown.Divider />
        <Dropdown.Item onClick={handleLogout}>
          <FaSignOutAlt className="me-2" />
          Cerrar Sesión
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default UserDropdown;