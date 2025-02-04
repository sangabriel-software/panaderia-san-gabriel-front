import React from "react";

const CreateButton = ({ onClick }) => {
  return (
    <button className="btn-crear btn w-100" onClick={onClick}>
      <i className="fa-solid fa-plus"></i> Crear Producto
    </button>
  );
};

export default CreateButton;