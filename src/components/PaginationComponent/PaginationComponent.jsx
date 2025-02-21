import React from "react";
import { Pagination } from "react-bootstrap";
import "./PaginationComponent.css"; // Importa el CSS personalizado

const PaginationComponent = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null; // No mostrar paginación si solo hay una página

  return (
    <div className="d-flex justify-content-center mt-3">
      <Pagination className="custom-pagination">
        <Pagination.Prev
          className="custom-pagination-prev"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            className={`custom-pagination-item ${index + 1 === currentPage ? "custom-pagination-active" : ""}`}
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}

        <Pagination.Next
          className="custom-pagination-next"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </Pagination>
    </div>
  );
};

export default PaginationComponent;