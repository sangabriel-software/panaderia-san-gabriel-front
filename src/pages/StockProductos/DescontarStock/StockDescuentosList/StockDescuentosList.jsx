import { useParams, useNavigate } from "react-router";
import useGetStockDescontado from "../../../../hooks/DescuentoDeStock/useGetStockDescontado";
import { useState, useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import { 
  FiTag, 
  FiCheck, 
  FiX, 
  FiTrash2,
  FiEye,
  FiXCircle,
  FiFilter,
  FiUser,
  FiMinus,
  FiChevronRight,
  FiClock
} from "react-icons/fi";
import 'bootstrap/dist/css/bootstrap.min.css';
import './StockDescuentosList.styles.css';
import { encryptId } from "../../../../utils/CryptoParams";

const StockDescuentosList = () => {
    const { idSucursal } = useParams();
    const navigate = useNavigate();
    const { 
      stockDescontadoList, 
      loadingStockDescontado, 
      showErrorStockDescontado,
      setStockDescontadoList
    } = useGetStockDescontado(idSucursal);
    
    const [selectedDescuento, setSelectedDescuento] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("TODOS");
    const [showFiltros, setShowFiltros] = useState(false);
    
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

    const descuentosFiltrados = useMemo(() => {
        if (!stockDescontadoList) return [];
        
        if (filtroTipo === "TODOS") {
            return stockDescontadoList;
        }
        
        return stockDescontadoList.filter(
            d => d.tipoDescuento.toUpperCase() === filtroTipo
        );
    }, [stockDescontadoList, filtroTipo]);

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' ·');
    };

    const handleDeleteClick = (descuento) => {
        setSelectedDescuento(descuento);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await eliminarDescuentoService(selectedDescuento.idDescuento);
            setStockDescontadoList(
                stockDescontadoList.filter(d => d.idDescuento !== selectedDescuento.idDescuento)
            );
            setShowDeleteModal(false);
        } catch (error) {
            setErrorMessage(error.message || "Error al eliminar el descuento");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleViewDetails = (idDescuento) => {
        const encryptedId = encryptId(idDescuento.toString());
        navigate(`/descuento-stock/detalle-descuento/${encodeURIComponent(encryptedId)}`);
    };

    const toggleFiltros = () => {
        setShowFiltros(!showFiltros);
    };

    const handleAddDiscount = () => {
        navigate(`/descuento-stock/descontar-stock/${encodeURIComponent(idSucursal)}`);
    };

    if (loadingStockDescontado) {
        return (
            <div className="sdl-loading-screen">
                <div className="sdl-loading-spinner"></div>
                <p>Cargando gestiones de descuento de stock...</p>
            </div>
        );
    }

    if (showErrorStockDescontado) {
        return (
            <div className="sdl-error-screen">
                <div className="sdl-error-icon">!</div>
                <p>Error al cargar las gestiones de descuento de stock</p>
            </div>
        );
    }

    if (!descuentosFiltrados || descuentosFiltrados.length === 0) {
        return (
            <div className="sdl-empty-screen">
                <div className="sdl-empty-icon">
                    <FiTag />
                </div>
                <p>
                    {filtroTipo === "TODOS" 
                        ? "No hay descuentos registrados" 
                        : `No hay descuentos de tipo ${filtroTipo.toLowerCase()}`
                    }
                </p>
                {filtroTipo !== "TODOS" && (
                    <button 
                        className="sdl-clear-filter"
                        onClick={() => setFiltroTipo("TODOS")}
                    >
                        Mostrar todos
                    </button>
                )}
                <button 
                    className="sdl-add-discount-btn sdl-empty-btn"
                    onClick={handleAddDiscount}
                >
                    <FiMinus /> Descontar producto
                </button>
            </div>
        );
    }

    return (
        <div className="sdl-container">
            <header className="sdl-header">
                <div className="sdl-header-top row">
                    <div className="col-12 col-md-6">
                        <h1>Historial de Stock descontado</h1>
                        <p className="d-none d-md-block">Registro histórico de modificaciones al stock</p>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="d-flex flex-column flex-md-row justify-content-md-end gap-2">
                            <button 
                                className="sdl-filter-toggle"
                                onClick={toggleFiltros}
                            >
                                <FiFilter />
                                Filtrar
                            </button>
                            
                            <button 
                                className="sdl-add-discount-btn"
                                onClick={handleAddDiscount}
                            >
                                <FiMinus /> Descontar producto
                            </button>
                        </div>
                    </div>
                </div>
                
                <p className="d-md-none mt-2">Registro histórico de modificaciones al stock</p>
                
                {showFiltros && (
                    <div className="sdl-filtros-container mt-2">
                        <div className="row">
                            <div className="col-12">
                                <div className="sdl-filtro-group">
                                    <label>Tipo de descuento:</label>
                                    <div className="sdl-filtro-options">
                                        <button
                                            className={`sdl-filtro-btn ${filtroTipo === "TODOS" ? "active" : ""}`}
                                            onClick={() => setFiltroTipo("TODOS")}
                                        >
                                            Todos
                                        </button>
                                        <button
                                            className={`sdl-filtro-btn ${filtroTipo === "MAYOREO" ? "active" : ""}`}
                                            onClick={() => setFiltroTipo("MAYOREO")}
                                        >
                                            Mayoreo
                                        </button>
                                        <button
                                            className={`sdl-filtro-btn ${filtroTipo === "MAL ESTADO" ? "active" : ""}`}
                                            onClick={() => setFiltroTipo("MAL ESTADO")}
                                        >
                                            Mal estado
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <div className="sdl-list">
                {descuentosFiltrados.map(descuento => (
                    <div key={descuento.idDescuento} className="sdl-item">
                        <div className="sdl-item-icon">
                            <FiTag />
                        </div>
                        
                        <div className="sdl-item-content">
                            <div className="sdl-item-header">
                                <span className={`sdl-tipo-badge ${descuento.tipoDescuento.toLowerCase().replace(' ', '-')}`}>
                                    {descuento.tipoDescuento}
                                </span>
                                <span className={`sdl-estado ${descuento.estado === 'A' ? 'active' : 'inactive'}`}>
                                    {descuento.estado === 'A' ? <FiCheck /> : <FiX />}
                                </span>
                            </div>
                            
                            <div className="sdl-item-user-info">
                                <div className="sdl-user-badge">
                                    <FiUser className="sdl-user-icon" />
                                    <span className="sdl-username">Usuario: {descuento.nombreUsuario}</span>
                                </div>
                                <div className="sdl-time-info">
                                    <FiClock className="sdl-time-icon" />
                                    <span className="sdl-time-text">{formatFecha(descuento.fechaDescuento)}</span>
                                </div>
                            </div>
                            
                            <div className="sdl-item-details">
                                <span className="sdl-id">ID: #{descuento.idDescuento}</span>
                            </div>
                        </div>
                        
                        <div className="sdl-item-actions">
                            <button 
                                className="sdl-action-btn sdl-view-btn"
                                onClick={() => handleViewDetails(descuento.idDescuento)}
                                title="Ver detalles"
                            >
                                <FiEye />
                            </button>
                            <button 
                                className="sdl-action-btn sdl-delete-btn"
                                onClick={() => handleDeleteClick(descuento)}
                                title="Eliminar descuento"
                            >
                                <FiTrash2 />
                            </button>
                            <div className="sdl-item-arrow">
                                <FiChevronRight />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showDeleteModal && (
                <div className="sdl-modal-overlay">
                    <div className="sdl-modal">
                        <div className="sdl-modal-header">
                            <h3>Confirmar eliminación</h3>
                            <button 
                                className="sdl-modal-close"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                            >
                                <FiXCircle />
                            </button>
                        </div>
                        <div className="sdl-modal-body">
                            <p>¿Estás seguro que deseas eliminar el descuento #{selectedDescuento?.idDescuento}?</p>
                            <p className="sdl-modal-warning">Esta acción no se puede deshacer.</p>
                            {selectedDescuento?.nombreUsuario && (
                                <p className="sdl-modal-user">
                                    <FiUser /> Registrado por: {selectedDescuento.nombreUsuario}
                                </p>
                            )}
                        </div>
                        <div className="sdl-modal-footer">
                            <button
                                className="sdl-modal-btn sdl-modal-cancel"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                className="sdl-modal-btn sdl-modal-confirm"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <span className="sdl-spinner-small"></span>
                                ) : (
                                    "Eliminar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="sdl-error-message">
                    <div className="sdl-error-content">
                        <FiXCircle className="sdl-error-icon" />
                        <p>{errorMessage}</p>
                        <button 
                            className="sdl-error-close"
                            onClick={() => setErrorMessage("")}
                        >
                            <FiX />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockDescuentosList;