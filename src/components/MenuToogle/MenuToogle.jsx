import React from 'react';
import { Button } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';

function MenuToggle({ onMenuClick }) {
  return (
    <Button
      variant="link"
      className="menutoggle me-2 text-light"
      onClick={onMenuClick}
      aria-label="Toggle sidebar"
    >
      <FaBars size={20} />
    </Button>
  );
}

export default MenuToggle;