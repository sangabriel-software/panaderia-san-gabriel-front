import React from "react";

function Alert({ type, message, icon }) {
  const alertClass = `alert alert-${type} d-flex align-items-center text-center justi justify-content-center`;

  return (
    <div className={alertClass} role="alert">
      {icon && (
        <span className="me-2">
          {React.isValidElement(icon) ? (
            icon
          ) : (
            <span className="icon-placeholder">{icon}</span>
          )}
        </span>
      )}
      <div>{message}</div>
    </div>
  );
}


export default Alert;
