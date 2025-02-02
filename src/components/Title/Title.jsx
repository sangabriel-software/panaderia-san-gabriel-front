import React from "react"; // Asegúrate de importar React

const Title = ({ title, description }) => {
  return (
    <div className="text-center">
      <h1 className="fw-bold rolText">{title}</h1>
      <p className="text-muted">{description}</p>
    </div>
  );
};

export default Title; 