import { useParams, useNavigate } from "react-router";
import useGetDetalleDescuento from "../../../../hooks/DescuentoDeStock/useGetDetalleDescuento";
import { FiArrowLeft, FiTag, FiUser, FiClock, FiPackage, FiMinus, FiCheck, FiX } from "react-icons/fi";
import './DetalleDescuento.styles.css';
import { encryptId } from "../../../../utils/CryptoParams";

const DetalleDescuento = () => {
    const { idDescuento } = useParams();
    const navigate = useNavigate();
    const {descuentoDetalle, loadingDescuentoDetalle, showErrorDescuentoDetalle,showInfoDescuentoDetalle, setDescuentoDetalle } = useGetDetalleDescuento(idDescuento);

    const handleGoBack = () => {
        const encryptedId = encryptId(descuentoDetalle.encabezadoDescuento.idSucursal.toString());
        navigate(`/descuento-stock/stock-descuentos-lista/${encodeURIComponent(encryptedId)}`);
    };

    if (loadingDescuentoDetalle) {
        return (
            <div className="dd-loading-screen">
                <div className="dd-loading-spinner"></div>
                <p>Cargando detalles del descuento...</p>
            </div>
        );
    }

    if (showErrorDescuentoDetalle) {
        return (
            <div className="dd-error-screen">
                <div className="dd-error-icon">!</div>
                <p>Error al cargar los detalles del descuento</p>
                <button className="dd-back-btn" onClick={handleGoBack}>
                    <FiArrowLeft /> Volver
                </button>
            </div>
        );
    }

    if (!descuentoDetalle || !descuentoDetalle.encabezadoDescuento) {
        return (
            <div className="dd-empty-screen">
                <div className="dd-empty-icon">
                    <FiTag />
                </div>
                <p>No se encontraron detalles para este descuento</p>
                <button className="dd-back-btn" onClick={handleGoBack}>
                    <FiArrowLeft /> Volver
                </button>
            </div>
        );
    }

    const { encabezadoDescuento, detalleDescuento } = descuentoDetalle;
    const tipoDescuento = encabezadoDescuento.tipoDescuento.toLowerCase().replace(' ', '-');

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' ·');
    };

    return (
        <div className="dd-container">
            <header className="dd-header">
                <button className="dd-back-btn" onClick={handleGoBack}>
                    <FiArrowLeft /> Volver
                </button>
                
                <div className="dd-header-content">
                    <div className="dd-header-icon">
                        <FiTag />
                    </div>
                    <div>
                        <h1>Descuento #{encabezadoDescuento.idDescuento}</h1>
                        <p>Detalle completo de la modificación de stock</p>
                    </div>
                </div>
            </header>

            <div className="dd-card">
                <div className="dd-card-header">
                    <span className={`dd-tipo-badge ${tipoDescuento}`}>
                        {encabezadoDescuento.tipoDescuento}
                    </span>
                    <span className={`dd-estado ${encabezadoDescuento.estado === 'A' ? 'active' : 'inactive'}`}>
                        {encabezadoDescuento.estado === 'A' ? <FiCheck /> : <FiX />}
                    </span>
                </div>

                <div className="dd-card-body">
                    <div className="dd-info-group">
                        <div className="dd-info-item">
                            <FiUser className="dd-info-icon" />
                            <div>
                                <span className="dd-info-label">Registrado por:</span>
                                <span className="dd-info-value">{encabezadoDescuento.nombreUsuario}</span>
                            </div>
                        </div>

                        <div className="dd-info-item">
                            <FiClock className="dd-info-icon" />
                            <div>
                                <span className="dd-info-label">Fecha:</span>
                                <span className="dd-info-value">{formatFecha(encabezadoDescuento.fechaDescuento)}</span>
                            </div>
                        </div>

                        <div className="dd-info-item">
                            <FiPackage className="dd-info-icon" />
                            <div>
                                <span className="dd-info-label">Sucursal:</span>
                                <div className="dd-sucursal-info">
                                    <span className="dd-info-value">{encabezadoDescuento.nombreSucursal}</span>
                                    {encabezadoDescuento.descuentoTurno && (
                                        <span className="dd-turno-badge">
                                            {encabezadoDescuento.descuentoTurno}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dd-products-section">
                        <h3>Productos descontados</h3>
                        <div className="dd-products-list">
                            {detalleDescuento.map((producto) => (
                                <div key={producto.idDetalleDescuento} className="dd-product-item">
                                    <div className="dd-product-info">
                                        <span className="dd-product-name">{producto.nombreProducto}</span>
                                        <span className="dd-product-id">ID: {producto.idProducto}</span>
                                    </div>
                                    <div className="dd-product-quantity">
                                        <FiMinus className="dd-minus-icon" />
                                        <span>{producto.unidadesDescontadas} unidades</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleDescuento;