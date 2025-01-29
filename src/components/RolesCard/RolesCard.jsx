import React from "react";
import "./RolesCard.css"; // Archivo CSS separado

const RoleCard = ({ title, description, icon, onView, onDelete }) => {
  return (
    <div className="card custom-card mx-auto w-100">
      <div className="icon-container">
        <div className="icon" >
          <i className={`${icon}`}></i>
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        <div className="btn-container">
          <button className="btn btn-icon btn-view" onClick={onView}>
          <i className="fa-solid fa-eye" />
          </button>
          <button className="btn btn-icon btn-delete" onClick={onDelete}>
          <i className="fa-solid fa-trash-can" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
