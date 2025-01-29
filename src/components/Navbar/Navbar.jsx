import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import MenuToggle from '../MenuToogle/MenuToogle';
import NotificationBadge from '../NotificationBadage/NotificationBadge';
import UserDropdown from '../UserDropdown/UserDropdown';


function NavigationBar({ onMenuClick }) {
  return (
    <Navbar className='topbar' bg="danger" variant="dark" expand={false} fixed="top">
      <Container fluid>
        <div className="d-flex align-items-center">
          <MenuToggle onMenuClick={onMenuClick} />
          <Navbar.Brand href="/dashboard">Panaderia San Gabriel</Navbar.Brand>
        </div>
        
        <div className="d-flex align-items-center">
          <NotificationBadge />
          <UserDropdown />
        </div>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;