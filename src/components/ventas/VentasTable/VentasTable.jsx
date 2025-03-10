import React, { useState, useRef, useEffect } from "react";
import { Table, Button, Badge, Container, Spinner } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import PaginationComponent from "../../PaginationComponent/PaginationComponent";
import "./VentasTable.css"; // Importa el CSS personalizado
import { handleViewDetalleVenta } from "../../../pages/VentasPage/DetalleVenta/DetalleVenta.utils";
import { BsFileEarmarkPdf } from "react-icons/bs";

const ITEMS_PER_PAGE = 5;

const getColorByName = (name) => {
  const COLORS = ["success", "primary", "info"];
  if (!name) return "warning";
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

const VentasTable = ({ sales, onDelete, onViewPdf, loadingViewPdf }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSales = sales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleRowClick = (idVenta) => {
    handleViewDetalleVenta(idVenta, navigate)
  };

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [currentPage]);

  return (
    <Container className="p-4 ventas-table-container" ref={containerRef}>
      <Table hover responsive className="ventas-table">
        <thead className="ventas-table-header">
          <tr>
            <th className="text-center">#</th>
            <th className="text-center">No. de venta</th>
            <th className="text-center">Sucursal</th>
            <th className="text-center">Usuario</th>
            <th className="text-center">Total Venta</th>
            <th className="text-center">Fecha venta</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSales.map((sale, index) => (
            <tr
              key={sale.idVenta}
              className="ventas-table-row"
              onDoubleClick={() => handleRowClick(sale.idVenta)}
              style={{ cursor: "pointer" }}
            >
              <td
                className="text-center ventas-serial-number"
                title="Doble clic para ver detalles"
              >
                #{startIndex + index + 1}
              </td>
              <td
                className="text-center ventas-sale-number"
                title="Doble clic para ver detalles"
              >
                VNT-{sale.idVenta}{" "}
                {/* Aquí se muestra "VNT-" seguido del número de venta */}
              </td>
              <td className="text-center" title="Doble clic para ver detalles">
                <Badge
                  pill
                  className="ventas-branch-badge text-light"
                  bg={getColorByName(sale.nombreSucursal)}
                >
                  {sale.nombreSucursal}
                </Badge>
              </td>
              <td
                className="text-center ventas-user-cell"
                title="Doble clic para ver detalles"
              >
                {sale.nombreUsuario}
              </td>
              <td className="text-center" title="Doble clic para ver detalles">
                <Badge
                  className={`ventas-status-badge ${
                    sale.estadoVenta === "C"
                      ? "ventas-status-completed"
                      : "ventas-status-pending"
                  }`}
                >
                  {`Q.${sale.totalVenta ? Number(sale.totalVenta).toFixed(2) : '0.00'}`}
                </Badge>
              </td>
              <td
                className="text-center ventas-sale-date"
                title="Doble clic para ver detalles"
              >
                {formatDateToDisplay(sale.fechaVenta)}
              </td>
              <td
                className="text-center ventas-actions-cell"
                onDoubleClick={(e) => e.stopPropagation()}
              >
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="link"
                    className="ventas-action-btn ventas-pdf-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewPdf(sale.idVenta);
                    }}
                    onDoubleClick={(e) => e.stopPropagation()}
                    disabled={loadingViewPdf === sale.idVenta} // Deshabilita el botón mientras se carga
                  >
                    {loadingViewPdf === sale.idVenta ? (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      <BsFileEarmarkPdf className="action-icon text-primary" />
                    )}
                  </Button>
                  <Button
                    variant="link"
                    className="ventas-action-btn ventas-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(sale.idVenta);
                    }}
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <FaTrashAlt className="ventas-action-icon" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <PaginationComponent
        totalItems={sales.length}
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </Container>
  );
};

export default VentasTable;
