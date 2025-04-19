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
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (showErrorOrdenEspecial) {
    return (
      <div className="error-message">
        Error al cargar las órdenes especiales
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <Title
          title="Órdenes Especiales"
          description="Gestión de las ordenes especiales"
        />
        <button 
          className="new-order-button"
          onClick={handleNewOrder}
        >
          <FiPlusCircle className="icon" /> Ingresar Orden Especial
        </button>
      </div>

      {/* Versión Desktop */}
      {!isMobile && !isTablet && (
        <div className="orders-table">
          <table>
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
                <tr key={orden.idOrdenEspecial}>
                  <td data-label="ID">{orden.idOrdenEspecial}</td>
                  <td data-label="Cliente">{orden.nombreCliente}</td>
                  <td data-label="Teléfono">{orden.telefonoCliente}</td>
                  <td data-label="Sucursal">{orden.sucursalEntrega}</td>
                  <td data-label="Fecha Entrega">{new Date(orden.fechaEntrega).toLocaleDateString()}</td>
                  <td data-label="Estado">
                    <span className={`status-badge ${orden.estado === 'A' ? 'active' : 'inactive'}`}>
                      {orden.estado === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className="actions">
                      <button className="action-button view" title="Ver detalles">
                        <FiEye className="icon" />
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDeleteClick(orden)}
                        title="Eliminar orden"
                      >
                        <FiTrash2 className="icon" />
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
        <div className="orders-grid">
          {ordenesEspeciales.map((orden) => (
            <div key={orden.idOrdenEspecial} className="order-card">
              <div className="card-header">
                <div className="client-info">
                  <FiUser className="icon" />
                  <h3>{orden.nombreCliente}</h3>
                </div>
                <span className={`status-badge ${orden.estado === 'A' ? 'active' : 'inactive'}`}>
                  {orden.estado === 'A' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="card-details">
                <div className="detail">
                  <FiPhone className="icon" />
                  <span>{orden.telefonoCliente}</span>
                </div>
                <div className="detail">
                  <FiShoppingBag className="icon" />
                  <span>{orden.sucursalEntrega}</span>
                </div>
                <div className="detail">
                  <FiCalendar className="icon" />
                  <span>{new Date(orden.fechaEntrega).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="action-button view" title="Ver detalles">
                  <FiEye className="icon" /> Ver
                </button>
                <button 
                  className="action-button delete"
                  onClick={() => handleDeleteClick(orden)}
                  title="Eliminar orden"
                >
                  <FiTrash2 className="icon" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Versión Mobile */}
      {isMobile && (
        <div className="orders-list-mobile">
          {ordenesEspeciales.map((orden) => (
            <div key={orden.idOrdenEspecial} className="mobile-order-card">
              <div className="mobile-card-header">
                <div className="client-info">
                  <FiUser className="icon profile-icon" />
                  <div>
                    <h4>{orden.nombreCliente}</h4>
                    <div className="client-meta">
                      <span className={`status-badge ${orden.estado === 'A' ? 'active' : 'inactive'}`}>
                        {orden.estado === 'A' ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className="order-id">#{orden.idOrdenEspecial}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mobile-card-details">
                <div className="detail-row">
                  <FiPhone className="icon" />
                  <span>{orden.telefonoCliente}</span>
                </div>
                <div className="detail-row">
                  <FiShoppingBag className="icon" />
                  <span>{orden.sucursalEntrega}</span>
                </div>
                <div className="detail-row">
                  <FiCalendar className="icon" />
                  <span>{new Date(orden.fechaEntrega).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mobile-card-actions">
                <button className="mobile-action-button view" title="Ver detalles">
                  <FiEye className="icon" />
                  <span>Ver</span>
                </button>
                <button 
                  className="mobile-action-button delete"
                  onClick={() => handleDeleteClick(orden)}
                  title="Eliminar orden"
                >
                  <FiTrash2 className="icon" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      {openDeleteDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirmar eliminación</h3>
              <button 
                className="modal-close"
                onClick={handleDeleteCancel}
              >
                <FiX className="icon" />
              </button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro que deseas eliminar la orden especial #{selectedOrder?.idOrdenEspecial} de {selectedOrder?.nombreCliente}?</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button cancel"
                onClick={handleDeleteCancel}
              >
                Cancelar
              </button>
              <button 
                className="modal-button confirm"
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