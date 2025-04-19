import useGetOrdenEHeader from "../../../hooks/orenesEspeciales/useGetOrdenEHeader";
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import './OrdenesEspecialesList.styles.css';
import Title from "../../../components/Title/Title";
import { 
  FiPlusCircle, 
  FiEye, 
  FiTrash2,
  FiUser,
  FiPhone,
  FiCalendar,
  FiShoppingBag,
  FiX
} from 'react-icons/fi';
import { formatDateToDisplay } from "../../../utils/dateUtils";

const OrdenesEspecialesList = () => {
  const { ordenesEspeciales, loadingOrdenEspecial, showErrorOrdenEspecial, setOrdenesEspeciales } = useGetOrdenEHeader();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  
  // Definición de breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Eliminando orden:', selectedOrder.idOrdenEspecial);
    setOrdenesEspeciales(ordenesEspeciales.filter(o => o.idOrdenEspecial !== selectedOrder.idOrdenEspecial));
    setOpenDeleteDialog(false);
    setSelectedOrder(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setSelectedOrder(null);
  };

  const handleNewOrder = () => {
    navigate('/pedido-especial/ingresar-orden-especial');
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
      <div className="oel-error-message">
        Error al cargar las órdenes especiales
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

      {/* Versión Desktop */}
      {!isMobile && !isTablet && (
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
              {ordenesEspeciales.map((orden) => (
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
                      <button className="oel-action-button oel-view" title="Ver detalles">
                        <FiEye className="oel-icon" />
                      </button>
                      <button 
                        className="oel-action-button oel-delete"
                        onClick={() => handleDeleteClick(orden)}
                        title="Eliminar orden"
                      >
                        <FiTrash2 className="oel-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Versión Tablet */}
      {isTablet && (
        <div className="oel-grid-container">
          {ordenesEspeciales.map((orden) => (
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
                <button className="oel-card-action-button oel-view" title="Ver detalles">
                  <FiEye className="oel-icon" /> Ver
                </button>
                <button 
                  className="oel-card-action-button oel-delete"
                  onClick={() => handleDeleteClick(orden)}
                  title="Eliminar orden"
                >
                  <FiTrash2 className="oel-icon" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Versión Mobile */}
      {isMobile && (
        <div className="oel-mobile-container">
          {ordenesEspeciales.map((orden) => (
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
                <button className="oel-mobile-action-button oel-view" title="Ver detalles">
                  <FiEye className="oel-icon" />
                  <span>Ver</span>
                </button>
                <button 
                  className="oel-mobile-action-button oel-delete"
                  onClick={() => handleDeleteClick(orden)}
                  title="Eliminar orden"
                >
                  <FiTrash2 className="oel-icon" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
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
              >
                <FiX className="oel-icon" />
              </button>
            </div>
            <div className="oel-modal-body">
              <p>¿Estás seguro que deseas eliminar la orden especial #{selectedOrder?.idOrdenEspecial} de {selectedOrder?.nombreCliente}?</p>
            </div>
            <div className="oel-modal-footer">
              <button 
                className="oel-modal-button oel-cancel"
                onClick={handleDeleteCancel}
              >
                Cancelar
              </button>
              <button 
                className="oel-modal-button oel-confirm"
                onClick={handleDeleteConfirm}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesEspecialesList;