import React from 'react';
import { Nav, Badge } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';

function NotificationBadge() {
  return (
    <Nav.Link href="#notifications" className="text-light me-3 position-relative">
      <FaBell size={20} />
      <Badge 
        bg="danger" 
        className="position-absolute" 
        style={{ top: '-5px', right: '-5px' }}
      >
        3
      </Badge>
    </Nav.Link>
  );
}

export default NotificationBadge;