import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import MenuToggle from '../MenuToogle/MenuToogle';
import NotificationBadge from '../NotificationBadage/NotificationBadge';
import UserDropdown from '../UserDropdown/UserDropdown';
import { useMediaQuery } from 'react-responsive';

function NavigationBar({ onMenuClick }) {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <Navbar className='topbar' bg="danger" variant="dark" expand="lg" fixed="top">
      <Container fluid>
        <div className="d-flex align-items-center w-100">
          <MenuToggle onMenuClick={onMenuClick} />
          <Navbar.Brand href="/dashboard" className="me-auto ms-2 text-truncate" style={{ maxWidth: '200px', fontSize: isSmallScreen ? '14px' : '16px' }}>
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