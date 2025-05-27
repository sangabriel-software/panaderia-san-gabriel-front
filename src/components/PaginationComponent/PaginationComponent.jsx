import React from "react";
import { Pagination } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import "./PaginationComponent.css";

const PaginationComponent = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  if (totalPages <= 1) return null;

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
      
      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    // Botón Primera página (solo si no está visible)
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => onPageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
      }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => onPageChange(i)}
          className={`custom-pagination-item ${i === currentPage ? "custom-pagination-active" : ""}`}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Botón Última página (solo si no está visible)
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
      }
      items.push(
        <Pagination.Item key={totalPages} onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <div className="d-flex justify-content-center mt-3">
      <Pagination className="custom-pagination">
        <Pagination.Prev
          className="custom-pagination-prev"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        
        {getPaginationItems()}

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