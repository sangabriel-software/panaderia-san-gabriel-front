import React from "react";
import "./RolesCard.css"; // Archivo CSS separado
import { FaEye, FaTrashAlt } from "react-icons/fa";

const RoleCard = ({ title, description, icon, onView, onDelete }) => {
  return (
    <div className="card custom-card mx-auto w-100">
      <div className="icon-container">
        <div className="icon" >
          {icon}
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        <div className="btn-container">
          <button className="btn btn-icon btn-view" onClick={onView}>
          <FaEye />
          </button>
          <button className="btn btn-icon btn-delete" onClick={onDelete}>
          <FaTrashAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
