import React from "react";
import { Pagination } from "react-bootstrap";

const PaginationComponent = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null; // No mostrar paginación si solo hay una página

  return (
    <div className="d-flex justify-content-center mt-3">
      <Pagination>
        <Pagination.Prev disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} />
        
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}

        <Pagination.Next disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} />
      </Pagination>
    </div>
  );
};

export default PaginationComponent;
