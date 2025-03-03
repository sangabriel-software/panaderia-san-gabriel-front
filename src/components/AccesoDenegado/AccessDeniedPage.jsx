import React from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate para la redirección

const AccessDeniedPage = () => {
  const navigate = useNavigate(); // Hook para la navegación

  // Función para redirigir al dashboard
  const handleRedirectToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container mt-5">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Acceso denegado</h4>
        <p>No tienes permisos para acceder a esta página.</p>
        <hr />
        <p className="mb-0">
          <button
            className="btn btn-primary"
            onClick={handleRedirectToDashboard}
          >
            Regresar al Inicio
          </button>
        </p>
      </div>
    </div>
  );
};

export default AccessDeniedPage;