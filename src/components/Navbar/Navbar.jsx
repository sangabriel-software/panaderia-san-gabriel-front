import React from "react";
import { Navbar, Container } from "react-bootstrap";
import MenuToggle from "../MenuToogle/MenuToogle";
import NotificationBadge from "../NotificationBadage/NotificationBadge";
import UserDropdown from "../UserDropdown/UserDropdown";
import logo from "../../assets/logo.png"; // Asegúrate de que el logo sea horizontal

function NavigationBar({ onMenuClick }) {
  return (
    <Navbar
      className="topbar"
      bg="danger"
      variant="dark"
      expand="lg"
      fixed="top"
    >
      <Container fluid>
        <div className="d-flex align-items-center w-100">
          {/* Botón de hamburguesa (siempre visible) */}
          <MenuToggle onMenuClick={onMenuClick} />

          {/* Título de la aplicación */}
          <Navbar.Brand
            href="/dashboard"
            className="me-auto ms-2 text-truncate"
            style={{ maxWidth: "200px", fontSize: "20px" }}
          >
            <img
              className="logo-login"
              src={logo}
              alt="Logo"
              draggable="false"
              style={{ width: "10px", height: "1px" }} // Ajusta el tamaño del logo
            />
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