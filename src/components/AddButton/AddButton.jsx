import React from 'react';
import { FaPlus } from 'react-icons/fa';

const AddButton = ({ onRedirect, buttonText }) => {
  return (
    <div className="col-12 col-md-3 mb-2 mb-md-3">
      <button
        className="btnAgregarUsuario btn w-100"
        onClick={onRedirect}
      >
        <FaPlus /> {buttonText}
      </button>
    </div>
  );
};

export default AddButton;
