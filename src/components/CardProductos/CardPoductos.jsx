import React, { useRef, useState, useEffect } from "react";
import "./CardProductos.css"; // Asegúrate de que este archivo CSS tenga los estilos necesarios
import { FaEllipsisH, FaTrash, FaEdit } from "react-icons/fa";

const CardProductos = ({
  id,
  nombreProducto,
  cantidad,
  precio,
  image,
  showOptions,
  onOptionsClick,
  onModify,
  onDelete,
}) => {
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  const [position, setPosition] = useState("bottom");
  const [isOptionsVisible, setIsOptionsVisible] = useState(showOptions);

  useEffect(() => {
    setIsOptionsVisible(showOptions);
  }, [showOptions]);

  useEffect(() => {
    if (isOptionsVisible && modalRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (buttonRect.bottom + 200 > viewportHeight) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [isOptionsVisible]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isOptionsVisible &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOptionsVisible(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isOptionsVisible]);

  const getInitial = (name) => name.charAt(0).toUpperCase();

  const getRandomColor = (name) => {
    const colors = [
      "#F44336", "#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#3F51B5",
      "#E91E63", "#00BCD4", "#8BC34A", "#FFC107", "#673AB7", "#607D8B",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const AvatarContent = () => {
    const avatarSize = 80;

    if (image) {
      return (
        <img
          src={image}
          alt={nombreProducto}
          className="rounded-circle flex-shrink-0 me-3"
          style={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            objectFit: "cover",
          }}
        />
      );
    }

    return (
      <div
        className="me-3 d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: `${avatarSize}px`,
          height: `${avatarSize}px`,
          backgroundColor: getRandomColor(nombreProducto),
          color: "white",
          fontSize: "1.5rem",
          fontWeight: "bold",
          borderRadius: "10px",
        }}
      >
        {getInitial(nombreProducto)}
      </div>
    );
  };

  const handleOptionClick = (action, event) => {
    event.stopPropagation();

    switch (action) {
      case "modify":
        if (onModify) onModify(id);
        break;
      case "delete":
        if (onDelete) onDelete(id);
        break;
      default:
        break;
    }

    // Cierra el modal después de realizar una acción
    setIsOptionsVisible(false);
  };

  return (
    <div className="card-users friend-card d-flex justify-content-between align-items-center p-3 mb-2">
      <div className="d-flex align-items-center flex-grow-1">
        <AvatarContent />
        <div>
          <h6 className="mb-0">{nombreProducto}</h6>
          <small className="text-muted d-block fw-bold">{`Cantidad: ${cantidad}`}</small>
          <span
            className="d-block mt-1 fw-bold"
            style={{
              color: getRandomColor(nombreProducto),
              fontSize: "0.85rem",
              fontWeight: "500",
            }}
          >
            Precio: Q.{parseFloat(precio).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="position-relative ms-4 options-container">
        <button
          ref={buttonRef}
          className="btn-modal btn rounded-circle p-2"
          onClick={() => setIsOptionsVisible(!isOptionsVisible)}
        >
          <FaEllipsisH />
        </button>
        {isOptionsVisible && (
          <div
            ref={modalRef}
            className="options-modal position-absolute bg-white shadow rounded p-2"
            style={{
              zIndex: 1000,
              minWidth: "200px",
              [position === "top" ? "bottom" : "top"]: "100%",
              right: 0,
              transform:
                position === "top" ? "translateY(-10px)" : "translateY(10px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-light w-100 text-start mb-1"
              onClick={(e) => handleOptionClick("modify", e)}
            >
              <FaEdit className="me-2" />
              Modificar
            </button>
            <button
              className="btn btn-light w-100 text-start"
              onClick={(e) => handleOptionClick("delete", e)}
              style={{ color: "#dc3545" }}
            >
              <FaTrash className="me-2" />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardProductos;