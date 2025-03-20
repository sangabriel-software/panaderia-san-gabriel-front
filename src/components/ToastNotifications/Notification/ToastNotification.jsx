import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import "./ToastNotification.css";

const ToastNotification = ({
  show,
  onClose,
  delay,
  title,
  message,
  position,
  className,
  headerClassName,
  bodyClassName,
}) => {
  return (
    <ToastContainer position={position} className="p-3" style={{ marginTop: "80px" }}>
      <Toast
        show={show}
        onClose={onClose}
        delay={delay}
        autohide
        className={`custom-toast ${className}`}
      >
        <Toast.Header className={`custom-toast-header ${headerClassName}`}>
          <strong className="me-auto">{title}</strong>
          <small>Ahora</small>
        </Toast.Header>
        <Toast.Body className={`custom-toast-body ${bodyClassName}`}>
          {message}
        </Toast.Body>
        {/* Barra de progreso */}
        <div className="toast-progress-bar" style={{ width: "100%" }}></div>
      </Toast>
    </ToastContainer>
  );
};

export default ToastNotification;