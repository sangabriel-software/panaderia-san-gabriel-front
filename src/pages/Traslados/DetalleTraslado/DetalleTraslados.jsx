import { useParams, useNavigate } from "react-router";
import useGetDetalleTraslado from "../../../hooks/Traslados/useGetDetalleTraslado";
import { FiTruck, FiMapPin, FiUser, FiClock, FiBox, FiArrowLeft } from "react-icons/fi";
import './DetalleTraslados.styles.css';
import { formatFechaCompleta } from "./DetalleTraslados.utils";

const DetalleTraslados = () => {
    const { idTraslado } = useParams();
    const navigate = useNavigate();
    const { detalleTraslado, loadingDetalleTraslado, showErrorDetalleTraslado } = useGetDetalleTraslado(idTraslado);

    const handleGoBack = () => {
        navigate('/traslados-productos');
    };

    if (loadingDetalleTraslado) {
        return (
            <div className="dtl-loading-screen">
                <div className="dtl-loading-spinner"></div>
                <p>Cargando detalles del traslado...</p>
            </div>
        );
    }

    if (showErrorDetalleTraslado) {
        return (
            <div className="dtl-error-screen">
                <div className="dtl-error-icon">!</div>
                <p>Error al cargar los detalles del traslado</p>
                <button className="dtl-back-btn" onClick={handleGoBack}>
                    <FiArrowLeft /> Volver
                </button>
            </div>
        );
    }

    if (!detalleTraslado || !detalleTraslado.encabezadoTraslado || !detalleTraslado.detalle) {
        return (
            <div className="dtl-empty-screen">
                <div className="dtl-empty-icon">
                    <FiTruck />
                </div>
                <p>No se encontraron datos para este traslado</p>
                <button className="dtl-back-btn" onClick={handleGoBack}>
                    <FiArrowLeft /> Volver
                </button>
            </div>
        );
    }

    const { encabezadoTraslado, detalle } = detalleTraslado;
    const totalProductos = detalle.reduce((sum, item) => sum + item.cantidadATrasladar, 0);

    return (
        <div className="dtl-container">
            <header className="dtl-header">
                <button className="dtl-back-btn" onClick={handleGoBack}>
                    <FiArrowLeft /> Volver
                </button>
                
                <div className="dtl-header-content">
                    <div className="dtl-header-icon">
                        <FiTruck />
                    </div>
                    <div>
                        <h1>Traslado #{encabezadoTraslado.idTraslado}</h1>
                        <p>Detalle completo del traslado de productos</p>
                    </div>
                </div>
            </header>

            <div className="dtl-card">
                <div className="dtl-card-body">
                    <div className="dtl-info-group">
                        <div className="dtl-info-item">
                            <FiUser className="dtl-info-icon" />
                            <div>
                                <span className="dtl-info-label">Responsable:</span>
                                <span className="dtl-info-value">{encabezadoTraslado.usuarioResponsable || "No especificado"}</span>
                            </div>
                        </div>

                        <div className="dtl-info-item">
                            <FiClock className="dtl-info-icon" />
                            <div>
                                <span className="dtl-info-label">Fecha:</span>
                                <span className="dtl-info-value">{formatFechaCompleta(encabezadoTraslado.fechaTraslado)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="dtl-route-section">
                        <h3>Ruta del traslado</h3>
                        <div className="dtl-route-list">
                            <div className="dtl-route-item">
                                <div className="dtl-route-icon">
                                    <FiMapPin />
                                </div>
                                <div className="dtl-route-text">
                                    <span className="dtl-route-title">Origen</span>
                                    <span className="dtl-route-subtitle">{encabezadoTraslado.sucursalOrigen || "No especificado"}</span>
                                </div>
                            </div>

                            <div className="dtl-route-item">
                                <div className="dtl-route-icon">
                                    <FiMapPin />
                                </div>
                                <div className="dtl-route-text">
                                    <span className="dtl-route-title">Destino</span>
                                    <span className="dtl-route-subtitle">{encabezadoTraslado.sucursalDestino || "No especificado"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dtl-card">
                <div className="dtl-card-header">
                    <h3>
                        <FiBox className="dtl-card-icon" /> Productos a Trasladar
                    </h3>
                    <span className="dtl-info-value">{detalle.length} productos</span>
                </div>

                <div className="dtl-card-body">
                    <div className="dtl-products-list">
                        {detalle.map((item) => (
                            <div key={item.idTrasladoDetalle} className="dtl-product-item">
                                <div className="dtl-product-info">
                                    <span className="dtl-product-name">{item.nombreProducto || "Producto sin nombre"}</span>
                                    <span className="dtl-product-id">ID: {item.idProducto}</span>
                                </div>
                                <div className="dtl-product-quantity">
                                    <span>{item.cantidadATrasladar} unidades</span>
                                </div>
                            </div>
                        ))}
                        <div className="dtl-total-item">
                            <span className="dtl-total-label">Total</span>
                            <span className="dtl-total-value">{totalProductos} unidades</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleTraslados;