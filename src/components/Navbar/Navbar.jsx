import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import MenuToggle from '../MenuToogle/MenuToogle';
import NotificationBadge from '../NotificationBadage/NotificationBadge';
import UserDropdown from '../UserDropdown/UserDropdown';
import { useMediaQuery } from 'react-responsive';

function NavigationBar({ onMenuClick }) {
  
  // Consulta para determinar si el ancho máximo es de 360px
  const isMax360 = useMediaQuery({ query: '(max-width: 360px)' });
  // Consulta para determinar si el ancho máximo es de 768px
  const isMax768 = useMediaQuery({ query: '(max-width: 768px)' });

  // Definimos un tamaño de fuente base para pantallas grandes
  let fontSize = '20px';

  if (isMax360) {
    fontSize = '17px';
  } else if (isMax768) {
    fontSize = '16px';
  }

  return (
    <Navbar className="topbar" bg="danger" variant="dark" expand="lg" fixed="top">
      <Container fluid>
        <div className="d-flex align-items-center w-100">
          <MenuToggle onMenuClick={onMenuClick} />
          
          <Navbar.Brand
            href="/dashboard"
            className="me-auto ms-2 text-truncate"
            style={{ maxWidth: '200px', fontSize }}
          >
            Panaderia San Gabriel
          </Navbar.Brand>

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
