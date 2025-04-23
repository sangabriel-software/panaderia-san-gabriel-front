import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import MenuToggle from '../MenuToogle/MenuToogle';
import NotificationBadge from '../NotificationBadage/NotificationBadge';
import UserDropdown from '../UserDropdown/UserDropdown';

function NavigationBar({ onMenuClick }) {
  return (
    <Navbar className="topbar" bg="danger" variant="dark" expand="lg" fixed="top">
      <Container fluid>
        <div className="d-flex align-items-center w-100">
          {/* Botón de hamburguesa (siempre visible) */}
          <MenuToggle onMenuClick={onMenuClick} />
          
          {/* Título de la aplicación */}
          <Navbar.Brand
            href="/home"
            className="me-auto ms-2 text-truncate"
            style={{ maxWidth: '200px', fontSize: '20px' }}
          >
            Panaderia San Gabriel
          </Navbar.Brand>

          {/* Notificaciones y menú de usuario */}
          <div className="d-flex align-items-center">
            <NotificationBadge />
            <UserDropdown />
          </div>
        </div>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;