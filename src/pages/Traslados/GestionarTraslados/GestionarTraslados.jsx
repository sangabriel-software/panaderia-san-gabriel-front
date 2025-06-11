import { useNavigate } from "react-router";
import useGetTraslados from "../../../hooks/Traslados/UseGetTraslados";
import { useState, useMemo, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { FiTruck, FiCheck, FiX, FiTrash2, FiEye, FiXCircle, FiFilter, FiUser, FiPlus, FiChevronRight, FiClock, FiMapPin } from "react-icons/fi";
import 'bootstrap/dist/css/bootstrap.min.css';
import './GestionarTraslados.styles.css';
import { encryptId } from "../../../utils/CryptoParams";
import { eliminarTrasladoService } from "../../../services/Traslados/traslados.service";
import { formatFecha, formatFechaCompleta, formatFechaRelativa, extraerOpcionesFiltros, filtrarTraslados, validarEliminacionTraslado, handleDeleteClick, handleDeleteConfirm, handleViewDetails, handleAddTraslado, toggleFiltros, handleFiltroChange} from "./GestionarTraslados.utils";

const GestionarTraslados = () => {
    const navigate = useNavigate();
    const { traslados, loadingTraslados, showErrorTraslados, setTraslados } = useGetTraslados();
    const [selectedTraslado, setSelectedTraslado] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showFiltros, setShowFiltros] = useState(false);
    const [filtros, setFiltros] = useState({
        sucursalOrigen: "",
        sucursalDestino: "",
        usuario: ""
    });
    
    // Extraer opciones para los filtros
    const { sucursalesOrigen: sucursalesOrigenOptions, sucursalesDestino: sucursalesDestinoOptions, usuarios: usuariosOptions } = useMemo(() => extraerOpcionesFiltros(traslados), [traslados]);

    // Filtrar traslados
    const trasladosFiltrados = useMemo(() => filtrarTraslados(traslados, filtros), [traslados, filtros]);



    const clearFiltros = () => {
        setFiltros({
            sucursalOrigen: "",
            sucursalDestino: "",
            usuario: ""
        });
    };

    const hasFiltrosActivos = filtros.sucursalOrigen || filtros.sucursalDestino || filtros.usuario;

    // Renderizado condicional
    if (loadingTraslados) {
        return (
            <div className="gtl-loading-screen">
                <div className="gtl-loading-spinner"></div>
                <p>Cargando historial de traslados...</p>
            </div>
        );
    }

    if (showErrorTraslados) {
        return (
            <div className="gtl-error-screen">
                <div className="gtl-error-icon">!</div>
                <p>Error al cargar el historial de traslados</p>
            </div>
        );
    }

    if (!trasladosFiltrados || trasladosFiltrados.length === 0) {
        return (
            <div className="gtl-empty-screen">
                <div className="gtl-empty-icon">
                    <FiTruck />
                </div>
                <p>
                    {hasFiltrosActivos 
                        ? "No hay traslados que coincidan con los filtros" 
                        : "No hay traslados registrados"
                    }
                </p>
                {hasFiltrosActivos && (
                    <button 
                        className="gtl-clear-filter"
                        onClick={clearFiltros}
                    >
                        Limpiar filtros
                    </button>
                )}
                <button 
                    className="gtl-add-traslado-btn gtl-empty-btn"
                    onClick={() => handleAddTraslado(navigate)}
                >
                    <FiPlus /> Crear nuevo traslado
                </button>
            </div>
        );
    }

    return (
        <div className="gtl-container">
            {/* Header y Filtros */}
            <header className="gtl-header">
                <div className="gtl-header-top row">
                    <div className="col-12 col-md-6">
                        <h1>Historial de Traslados</h1>
                        <p className="d-none d-md-block">Registro histórico de todos los traslados realizados</p>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="d-flex flex-column flex-md-row justify-content-md-end gap-2">
                            <button 
                                className="gtl-filter-toggle"
                                onClick={() => toggleFiltros(setShowFiltros, showFiltros)}
                            >
                                <FiFilter />
                                {showFiltros ? 'Ocultar filtros' : 'Filtrar'}
                            </button>
                            
                            <button 
                                className="gtl-add-traslado-btn"
                                onClick={() => handleAddTraslado(navigate)}
                            >
                                <FiPlus /> Crear traslado
                            </button>
                        </div>
                    </div>
                </div>
                
                <p className="d-md-none mt-2">Registro histórico de todos los traslados realizados</p>
                
                {showFiltros && (
                    <div className="gtl-filtros-container mt-2">
                        <div className="row">
                            <div className="col-12 col-md-4">
                                <div className="gtl-filtro-group">
                                    <label>Sucursal Origen:</label>
                                    <div className="gtl-select-container">
                                        <select
                                            name="sucursalOrigen"
                                            value={filtros.sucursalOrigen}
                                            onChange={(e) => handleFiltroChange(e, setFiltros)}
                                            className="gtl-select"
                                        >
                                            <option value="">Todas las sucursales</option>
                                            {sucursalesOrigenOptions.map((sucursal, index) => (
                                                <option key={`origen-${index}`} value={sucursal}>
                                                    {sucursal}
                                                </option>
                                            ))}
                                        </select>
                                        <FiMapPin className="gtl-select-icon" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="gtl-filtro-group">
                                    <label>Sucursal Destino:</label>
                                    <div className="gtl-select-container">
                                        <select
                                            name="sucursalDestino"
                                            value={filtros.sucursalDestino}
                                            onChange={(e) => handleFiltroChange(e, setFiltros)}
                                            className="gtl-select"
                                        >
                                            <option value="">Todas las sucursales</option>
                                            {sucursalesDestinoOptions.map((sucursal, index) => (
                                                <option key={`destino-${index}`} value={sucursal}>
                                                    {sucursal}
                                                </option>
                                            ))}
                                        </select>
                                        <FiMapPin className="gtl-select-icon" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="gtl-filtro-group">
                                    <label>Usuario Responsable:</label>
                                    <div className="gtl-select-container">
                                        <select
                                            name="usuario"
                                            value={filtros.usuario}
                                            onChange={(e) => handleFiltroChange(e, setFiltros)}
                                            className="gtl-select"
                                        >
                                            <option value="">Todos los usuarios</option>
                                            {usuariosOptions.map((usuario, index) => (
                                                <option key={`usuario-${index}`} value={usuario}>
                                                    {usuario}
                                                </option>
                                            ))}
                                        </select>
                                        <FiUser className="gtl-select-icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-12">
                                <button 
                                    className="gtl-clear-filters-btn"
                                    onClick={clearFiltros}
                                    disabled={!hasFiltrosActivos}
                                >
                                    Limpiar todos los filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Lista de Traslados */}
            <div className="gtl-list">
                {trasladosFiltrados.map(traslado => (
                    <div key={traslado.idTraslado} className="gtl-item">
                        <div className="gtl-item-icon">
                            <FiTruck />
                        </div>
                        
                        <div className="gtl-item-content">
                            <div className="gtl-item-header">
                                <span className={`gtl-estado-badge ${traslado.estado?.toLowerCase()}`}>
                                    {traslado.estado || "PENDIENTE"}
                                </span>
                                <span className="gtl-id">ID: #{traslado.idTraslado}</span>
                            </div>
                            
                            <div className="gtl-route-info">
                                <div className="gtl-route-point">
                                    <FiMapPin className="gtl-route-icon gtl-origin" />
                                    <div className="gtl-route-text">
                                        <span className="gtl-route-label">Origen:</span>
                                        <span className="gtl-route-value">{traslado.sucursalOrigen}</span>
                                    </div>
                                </div>
                                
                                <div className="gtl-route-line"></div>
                                
                                <div className="gtl-route-point">
                                    <FiMapPin className="gtl-route-icon gtl-destination" />
                                    <div className="gtl-route-text">
                                        <span className="gtl-route-label">Destino:</span>
                                        <span className="gtl-route-value">{traslado.sucursalDestino}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="gtl-item-footer">
                                <div className="gtl-user-info">
                                    <FiUser className="gtl-user-icon" />
                                    <span className="gtl-username">Responsable: {traslado.usuarioResponsable}</span>
                                </div>
                                <div className="gtl-time-info">
                                    <FiClock className="gtl-time-icon" />
                                    <span className="gtl-time-text" title={formatFechaCompleta(traslado.fechaTraslado)}>
                                        {formatFecha(traslado.fechaTraslado)} · {formatFechaRelativa(traslado.fechaTraslado)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="gtl-item-actions">
                            <button 
                                className="gtl-action-btn gtl-view-btn"
                                onClick={() => handleViewDetails(traslado.idTraslado, navigate)}
                                title="Ver detalles"
                            >
                                <FiEye />
                            </button>
                            <button 
                                className={`gtl-action-btn gtl-delete-btn ${!validarEliminacionTraslado(traslado) ? 'disabled' : ''}`}
                                onClick={() => handleDeleteClick(traslado, setErrorMessage, setSelectedTraslado, setShowDeleteModal)}
                                title={!validarEliminacionTraslado(traslado) ? "No se pueden eliminar traslados completados o cancelados" : "Eliminar traslado"}
                                disabled={!validarEliminacionTraslado(traslado)}
                            >
                                <FiTrash2 />
                            </button>
                            <div className="gtl-item-arrow">
                                <FiChevronRight />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Eliminación */}
            {showDeleteModal && (
                <div className="gtl-modal-overlay">
                    <div className="gtl-modal">
                        <div className="gtl-modal-header">
                            <h3>Confirmar eliminación</h3>
                            <button 
                                className="gtl-modal-close"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                            >
                                <FiXCircle />
                            </button>
                        </div>
                        <div className="gtl-modal-body">
                            <p>¿Estás seguro que deseas eliminar el traslado #{selectedTraslado?.idTraslado}?</p>
                            <p className="gtl-modal-warning">Esta acción no se puede deshacer.</p>
                            {selectedTraslado?.usuarioResponsable && (
                                <p className="gtl-modal-user">
                                    <FiUser /> Responsable: {selectedTraslado.usuarioResponsable}
                                </p>
                            )}
                            <div className="gtl-modal-route">
                                <div className="gtl-modal-route-point">
                                    <FiMapPin className="gtl-modal-origin" />
                                    <span>{selectedTraslado?.sucursalOrigen}</span>
                                </div>
                                <div className="gtl-modal-route-line"></div>
                                <div className="gtl-modal-route-point">
                                    <FiMapPin className="gtl-modal-destination" />
                                    <span>{selectedTraslado?.sucursalDestino}</span>
                                </div>
                            </div>
                            <div className="gtl-modal-date">
                                <FiClock className="me-2" />
                                <span>{formatFechaCompleta(selectedTraslado?.fechaTraslado)}</span>
                            </div>
                        </div>
                        <div className="gtl-modal-footer">
                            <button
                                className="gtl-modal-btn gtl-modal-cancel"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                className="gtl-modal-btn gtl-modal-confirm"
                                onClick={() => handleDeleteConfirm(selectedTraslado, traslados, setTraslados, setShowDeleteModal, setSelectedTraslado, setIsDeleting, setErrorMessage)}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <span className="gtl-spinner-small"></span>
                                ) : (
                                    "Eliminar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje de Error */}
            {errorMessage && (
                <div className="gtl-error-message">
                    <div className="gtl-error-content">
                        <FiXCircle className="gtl-error-icon" />
                        <div>
                            <p className="gtl-error-title">Error al eliminar traslado</p>
                            <p className="gtl-error-detail">{errorMessage}</p>
                        </div>
                        <button 
                            className="gtl-error-close"
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

export default GestionarTraslados;