import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  const handleRedirectToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
      <div className="bg-white p-5 rounded-4 shadow-lg text-center" style={{ maxWidth: "500px", width: "100%" }}>
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            fill="currentColor"
            className="bi bi-exclamation-triangle-fill text-danger"
            viewBox="0 0 16 16"
          >
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
          </svg>
        </div>
        <h2 className="h3 fw-bold text-dark mb-3">Acceso Denegado</h2>
        <p className="text-muted mb-4">
          Lo sentimos, no tienes permisos para acceder a esta página.
        </p>
        <button
          onClick={handleRedirectToDashboard}
          className="btn btn-primary btn-lg w-100"
        >
          Regresar al Inicio
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedPage;