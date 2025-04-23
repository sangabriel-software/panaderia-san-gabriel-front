import useGetOrdenEHeader from "../../../hooks/orenesEspeciales/useGetOrdenEHeader";
import { useState, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import './OrdenesEspecialesList.styles.css';
import Title from "../../../components/Title/Title";
import { FiPlusCircle, FiEye, FiTrash2, FiUser, FiPhone, FiCalendar, FiShoppingBag, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { eliminarOrdenEspecialService } from "../../../services/ordenesEspeciales/ordenesEspeciales.service";
import Alert from "../../../components/Alerts/Alert";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import { Spinner, Form } from "react-bootstrap";
import { BsExclamationTriangleFill, BsInfoCircleFill } from 'react-icons/bs';
import { formatDateToDisplay } from "../../../utils/dateUtils";

const OrdenesEspecialesList = () => {
  const { ordenesEspeciales, loadingOrdenEspecial, showErrorOrdenEspecial, setOrdenesEspeciales } = useGetOrdenEHeader();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  
  
  // Filtros
  const [sucursalFilter, setSucursalFilter] = useState("");
  const [fechaFilter, setFechaFilter] = useState("");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  
  const navigate = useNavigate();
  
  // Definición de breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

  // Obtener lista única de sucursales para el filtro
  const sucursalesUnicas = useMemo(() => {
    const sucursales = ordenesEspeciales.map(o => o.sucursalEntrega);
    return [...new Set(sucursales)].sort();
  }, [ordenesEspeciales]);

  // Filtrar órdenes
  const filteredOrdenes = useMemo(() => {
    return ordenesEspeciales.filter(orden => {
      // Filtro por sucursal
      const matchesSucursal = sucursalFilter === "" || 
        orden.sucursalEntrega.toLowerCase().includes(sucursalFilter.toLowerCase());
      
      // Filtro por fecha
      const matchesFecha = fechaFilter === "" || 
        orden.fechaEntrega === fechaFilter;
      
      return matchesSucursal && matchesFecha;
    });
  }, [ordenesEspeciales, sucursalFilter, fechaFilter]);

  // Lógica de paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredOrdenes.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredOrdenes.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await eliminarOrdenEspecialService(selectedOrder.idOrdenEspecial);
      setOrdenesEspeciales(ordenesEspeciales.filter(o => o.idOrdenEspecial !== selectedOrder.idOrdenEspecial));
      setIsPopupOpen(true);
      // Resetear a la primera página si quedan pocos registros
      if (currentRecords.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      setErrorPopupMessage(error.message || "Error al eliminar la orden especial");
      setIsPopupErrorOpen(true);
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
      setSelectedOrder(null);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setSelectedOrder(null);
  };

  const handleNewOrder = () => {
    navigate('/pedido-especial/ingresar-orden-especial');
  };

  // En el componente OrdenesEspecialesList, modificar los botones de "Ver detalles"
const handleViewDetails = (idOrdenEspecial) => {
  navigate(`/pedido-especial/detalle-orden-especial/${idOrdenEspecial}`);
};

  const clearFilters = () => {
    setSucursalFilter("");
    setFechaFilter("");
    setCurrentPage(1); // Resetear a la primera página al limpiar filtros
  };

  if (loadingOrdenEspecial) {
    return (
      <div className="oel-loading-container">
        <div className="oel-spinner"></div>
      </div>
    );
  }

  if (showErrorOrdenEspecial) {
    return (
      <div className="row">
        <div className="col-lg-3"></div>
        <div className="col-lg-6">
          <Alert
            type="danger"
            message="Error al cargar las órdenes especiales"
            icon={<BsExclamationTriangleFill />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="oel-container">
      <div className="oel-header">
        <Title
          title="Órdenes Especiales"
          description="Gestión de las ordenes especiales"
        />
        <button 
          className="oel-new-order-button"
          onClick={handleNewOrder}
        >
          <FiPlusCircle className="oel-icon" /> Ingresar Orden Especial
        </button>
      </div>

      {/* Filtros */}
      <div className="oel-filters-container">
        <div className="oel-filters-row">
          <div className="oel-filter-group">
            <Form.Label>Sucursal:</Form.Label>
            <Form.Select
              value={sucursalFilter}
              onChange={(e) => {
                setSucursalFilter(e.target.value);
                setCurrentPage(1); // Resetear a la primera página al cambiar filtro
              }}
              className="oel-filter-select"
            >
              <option value="">Todas las sucursales</option>
              {sucursalesUnicas.map((sucursal) => (
                <option key={sucursal} value={sucursal}>
                  {sucursal}
                </option>
              ))}
            </Form.Select>
          </div>
          
          <div className="oel-filter-group">
            <Form.Label>Fecha de Entrega:</Form.Label>
            <Form.Control
              type="date"
              value={fechaFilter}
              onChange={(e) => {
                setFechaFilter(e.target.value);
                setCurrentPage(1); // Resetear a la primera página al cambiar filtro
              }}
              className="oel-filter-input"
            />
          </div>
          
          <button 
            className="oel-clear-filters"
            onClick={clearFilters}
            disabled={!sucursalFilter && !fechaFilter}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Mostrar alerta si no hay órdenes */}
      {filteredOrdenes.length === 0 && !loadingOrdenEspecial && !showErrorOrdenEspecial && (
        <div className="row justify-content-center my-4">
          <div className="col-md-8">
            <Alert
              type="info"
              message={
                sucursalFilter || fechaFilter 
                  ? "No hay órdenes que coincidan con los filtros aplicados"
                  : "No hay órdenes especiales registradas."
              }
              icon={<BsInfoCircleFill />}
            />
          </div>
        </div>
      )}

      {/* Versión Desktop */}
      {!isMobile && !isTablet && currentRecords.length > 0 && (
        <>
          <div className="oel-table-container">
            <table className="oel-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Sucursal</th>
                  <th>Fecha Entrega</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((orden) => (
                  <tr key={orden.idOrdenEspecial} className="oel-table-row">
                    <td data-label="ID">{orden.idOrdenEspecial}</td>
                    <td data-label="Cliente">{orden.nombreCliente}</td>
                    <td data-label="Teléfono">{orden.telefonoCliente}</td>
                    <td data-label="Sucursal">{orden.sucursalEntrega}</td>
                    <td data-label="Fecha Entrega">{formatDateToDisplay(orden.fechaEntrega)}</td>
                    <td data-label="Estado">
                      <span className={`oel-status-badge ${orden.estado === 'A' ? 'oel-active' : 'oel-inactive'}`}>
                        {orden.estado === 'A' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td data-label="Acciones">
                      <div className="oel-actions">
                        <button className="oel-action-button oel-view" title="Ver detalles" onClick={() => handleViewDetails(orden.idOrdenEspecial)}>
                          <FiEye className="oel-icon" />
                        </button>
                        <button 
                          className="oel-action-button oel-delete"
                          onClick={() => handleDeleteClick(orden)}
                          title="Eliminar orden"
                          disabled={isDeleting}
                        >
                          {isDeleting && selectedOrder?.idOrdenEspecial === orden.idOrdenEspecial ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FiTrash2 className="oel-icon" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación Desktop */}
          <div className="oel-pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="oel-pagination-button"
            >
              <FiChevronLeft className="oel-icon" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`oel-pagination-button ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="oel-pagination-button"
            >
              <FiChevronRight className="oel-icon" />
            </button>
          </div>
        </>
      )}

      {/* Versión Tablet */}
      {isTablet && currentRecords.length > 0 && (
        <>
          <div className="oel-grid-container">
            {currentRecords.map((orden) => (
              <div key={orden.idOrdenEspecial} className="oel-card">
                <div className="oel-card-header">
                  <div className="oel-client-info">
                    <FiUser className="oel-icon" />
                    <h3 className="oel-client-name">{orden.nombreCliente}</h3>
                  </div>
                  <span className={`oel-status-badge ${orden.estado === 'A' ? 'oel-active' : 'oel-inactive'}`}>
                    {orden.estado === 'A' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="oel-card-details">
                  <div className="oel-detail">
                    <FiPhone className="oel-icon" />
                    <span>{orden.telefonoCliente}</span>
                  </div>
                  <div className="oel-detail">
                    <FiShoppingBag className="oel-icon" />
                    <span>{orden.sucursalEntrega}</span>
                  </div>
                  <div className="oel-detail">
                    <FiCalendar className="oel-icon" />
                    <span>{formatDateToDisplay(orden.fechaEntrega)}</span>
                  </div>
                </div>
                <div className="oel-card-actions">
                  <button className="oel-card-action-button oel-view" title="Ver detalles" onClick={() => handleViewDetails(orden.idOrdenEspecial)}>
                    <FiEye className="oel-icon" /> Ver
                  </button>
                  <button 
                    className="oel-card-action-button oel-delete"
                    onClick={() => handleDeleteClick(orden)}
                    title="Eliminar orden"
                    disabled={isDeleting}
                  >
                    {isDeleting && selectedOrder?.idOrdenEspecial === orden.idOrdenEspecial ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <FiTrash2 className="oel-icon" /> Eliminar
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Paginación Tablet */}
          <div className="oel-pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="oel-pagination-button"
            >
              <FiChevronLeft className="oel-icon" />
            </button>
            
            <span className="oel-pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="oel-pagination-button"
            >
              <FiChevronRight className="oel-icon" />
            </button>
          </div>
        </>
      )}

      {/* Versión Mobile */}
      {isMobile && currentRecords.length > 0 && (
        <>
          <div className="oel-mobile-container">
            {currentRecords.map((orden) => (
              <div key={orden.idOrdenEspecial} className="oel-mobile-card">
                <div className="oel-mobile-header">
                  <div className="oel-client-info">
                    <FiUser className="oel-icon oel-profile-icon" />
                    <div>
                      <h4 className="oel-client-name">{orden.nombreCliente}</h4>
                      <div className="oel-client-meta">
                        <span className={`oel-status-badge ${orden.estado === 'A' ? 'oel-active' : 'oel-inactive'}`}>
                          {orden.estado === 'A' ? 'Activo' : 'Inactivo'}
                        </span>
                        <span className="oel-order-id">#{orden.idOrdenEspecial}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="oel-mobile-details">
                  <div className="oel-detail-row">
                    <FiPhone className="oel-icon" />
                    <span>{orden.telefonoCliente}</span>
                  </div>
                  <div className="oel-detail-row">
                    <FiShoppingBag className="oel-icon" />
                    <span>{orden.sucursalEntrega}</span>
                  </div>
                  <div className="oel-detail-row">
                    <FiCalendar className="oel-icon" />
                    <span>{formatDateToDisplay(orden.fechaEntrega)}</span>
                  </div>
                </div>
                
                <div className="oel-mobile-actions">
                  <button className="oel-mobile-action-button oel-view" title="Ver detalles" onClick={() => handleViewDetails(orden.idOrdenEspecial)}>
                    <FiEye className="oel-icon" />
                    <span>Ver</span>
                  </button>
                  <button 
                    className="oel-mobile-action-button oel-delete"
                    onClick={() => handleDeleteClick(orden)}
                    title="Eliminar orden"
                    disabled={isDeleting}
                  >
                    {isDeleting && selectedOrder?.idOrdenEspecial === orden.idOrdenEspecial ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <FiTrash2 className="oel-icon" />
                        <span>Eliminar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Paginación Mobile */}
          <div className="oel-pagination-mobile">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="oel-pagination-button"
            >
              <FiChevronLeft className="oel-icon" /> Anterior
            </button>
            
            <span className="oel-pagination-info">
              {currentPage}/{totalPages}
            </span>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="oel-pagination-button"
            >
              Siguiente <FiChevronRight className="oel-icon" />
            </button>
          </div>
        </>
      )}

      {/* Modal de confirmación */}
      {openDeleteDialog && (
        <div className="oel-modal-overlay">
          <div className="oel-modal-content">
            <div className="oel-modal-header">
              <h3>Confirmar eliminación</h3>
              <button 
                className="oel-modal-close"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                <FiX className="oel-icon" />
              </button>
            </div>
            <div className="oel-modal-body">
              <p>¿Estás seguro que deseas eliminar la orden especial #{selectedOrder?.idOrdenEspecial} a nombre de {selectedOrder?.nombreCliente}?</p>
            </div>
            <div className="oel-modal-footer">
              <button 
                className="oel-modal-button oel-cancel"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="oel-modal-button oel-confirm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup errores */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </div>
  );
};

export default OrdenesEspecialesList;