import React from 'react';
import { Button } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';

function MenuToggle({ onMenuClick }) {
  return (
    <Button 

      className="menutoggle me-2 d-lg-none"
      onClick={onMenuClick}
    >
      <FaBars />
    </Button>
  );
}

export default MenuToggle;