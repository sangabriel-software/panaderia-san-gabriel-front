import { useNavigate } from "react-router";
import useGetTraslados from "../../../hooks/Traslados/UseGetTraslados";
import { useState, useMemo, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { FiTruck, FiCheck, FiX, FiTrash2, FiEye, FiXCircle, FiFilter, FiUser, FiPlus, FiChevronRight, FiClock, FiMapPin } from "react-icons/fi";
import 'bootstrap/dist/css/bootstrap.min.css';
import './GestionarTraslados.styles.css';
import { encryptId } from "../../../utils/CryptoParams";
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importar locale español
import relativeTime from 'dayjs/plugin/relativeTime'; // Plugin para tiempos relativos

// Configurar Day.js
dayjs.locale('es'); // Establecer español como idioma
dayjs.extend(relativeTime); // Extender con plugin de tiempos relativos

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
    const [sucursalesOrigenOptions, setSucursalesOrigenOptions] = useState([]);
    const [sucursalesDestinoOptions, setSucursalesDestinoOptions] = useState([]);
    const [usuariosOptions, setUsuariosOptions] = useState([]);
    
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

    // Efecto para extraer opciones de filtros únicas
    useEffect(() => {
        if (traslados && traslados.length > 0) {
            // Extraer sucursales origen únicas
            const sucursalesOrigenUnicas = [...new Set(
                traslados.map(t => t.sucursalOrigen)
            )].sort();
            
            // Extraer sucursales destino únicas
            const sucursalesDestinoUnicas = [...new Set(
                traslados.map(t => t.sucursalDestino)
            )].sort();
            
            // Extraer usuarios únicos
            const usuariosUnicos = [...new Set(
                traslados.map(t => t.usuarioResponsable)
            )].sort();
            
            setSucursalesOrigenOptions(sucursalesOrigenUnicas);
            setSucursalesDestinoOptions(sucursalesDestinoUnicas);
            setUsuariosOptions(usuariosUnicos);
        }
    }, [traslados]);

    // Función para formatear la fecha con Day.js
    const formatFecha = (fecha) => {
        return dayjs(fecha).format('DD MMM [·] HH:mm');
    };

    // Función para mostrar tiempo relativo (ej: "hace 2 horas")
    const formatFechaRelativa = (fecha) => {
        return dayjs(fecha).fromNow();
    };

    // Función para mostrar fecha completa
    const formatFechaCompleta = (fecha) => {
        return dayjs(fecha).format('dddd, D [de] MMMM [de] YYYY [a las] HH:mm');
    };

    const trasladosFiltrados = useMemo(() => {
        if (!traslados) return [];
        
        return traslados.filter(traslado => {
            const matchesSucursalOrigen = !filtros.sucursalOrigen || 
                traslado.sucursalOrigen === filtros.sucursalOrigen;
            
            const matchesSucursalDestino = !filtros.sucursalDestino || 
                traslado.sucursalDestino === filtros.sucursalDestino;
            
            const matchesUsuario = !filtros.usuario || 
                traslado.usuarioResponsable === filtros.usuario;
            
            return matchesSucursalOrigen && matchesSucursalDestino && matchesUsuario;
        });
    }, [traslados, filtros]);

    const handleDeleteClick = (traslado) => {
        setSelectedTraslado(traslado);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            // Aquí iría la llamada al servicio para eliminar el traslado
            // await cancelarTrasladoServices(selectedTraslado.idTraslado);
            setTraslados(
                traslados.filter(t => t.idTraslado !== selectedTraslado.idTraslado)
            );
            setShowDeleteModal(false);
        } catch (error) {
            setErrorMessage(error.message || "Error al eliminar el traslado");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleViewDetails = (idTraslado) => {
        const encryptedId = encryptId(idTraslado.toString());
        navigate(`/detalles-traslados/${encodeURIComponent(encryptedId)}`);
    };

    const toggleFiltros = () => {
        setShowFiltros(!showFiltros);
    };

    const handleAddTraslado = () => {
        navigate(`/crear-traslado`);
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFiltros = () => {
        setFiltros({
            sucursalOrigen: "",
            sucursalDestino: "",
            usuario: ""
        });
    };

    const hasFiltrosActivos = filtros.sucursalOrigen || filtros.sucursalDestino || filtros.usuario;

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
                    onClick={handleAddTraslado}
                >
                    <FiPlus /> Crear nuevo traslado
                </button>
            </div>
        );
    }

    return (
        <div className="gtl-container">
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
                                onClick={toggleFiltros}
                            >
                                <FiFilter />
                                {showFiltros ? 'Ocultar filtros' : 'Filtrar'}
                            </button>
                            
                            <button 
                                className="gtl-add-traslado-btn"
                                onClick={handleAddTraslado}
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
                                            onChange={handleFiltroChange}
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
                                            onChange={handleFiltroChange}
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
                                            onChange={handleFiltroChange}
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
                                onClick={() => handleViewDetails(traslado.idTraslado)}
                                title="Ver detalles"
                            >
                                <FiEye />
                            </button>
                            <button 
                                className={`gtl-action-btn gtl-delete-btn ${traslado.estado === 'COMPLETADO' || traslado.estado === 'CANCELADO' ? 'disabled' : ''}`}
                                onClick={() => handleDeleteClick(traslado)}
                                title={traslado.estado === 'COMPLETADO' || traslado.estado === 'CANCELADO' ? "No se pueden eliminar traslados completados o cancelados" : "Eliminar traslado"}
                                disabled={traslado.estado === 'COMPLETADO' || traslado.estado === 'CANCELADO'}
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
                                onClick={handleDeleteConfirm}
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

            {errorMessage && (
                <div className="gtl-error-message">
                    <div className="gtl-error-content">
                        <FiXCircle className="gtl-error-icon" />
                        <p>{errorMessage}</p>
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