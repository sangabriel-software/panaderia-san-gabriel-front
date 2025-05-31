import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import { eliminarTrasladoService } from '../../../services/Traslados/traslados.service';
import { encryptId } from '../../../utils/CryptoParams';

// Configurar Day.js
dayjs.locale('es');
dayjs.extend(relativeTime);

export const handleViewDetails = (idTraslado, navigate) => {
    const encryptedId = encryptId(idTraslado.toString());
    navigate(`/detalles-traslados/${encodeURIComponent(encryptedId)}`);
};


export const handleAddTraslado = (navigate) => {
    navigate(`/crear-traslado`);
};

export const handleFiltroChange = (e, setFiltros) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
        ...prev,
        [name]: value
    }));
};

export const toggleFiltros = (setShowFiltros, showFiltros) => {
    setShowFiltros(!showFiltros);
};

export const formatFecha = (fecha) => {
    return dayjs(fecha).format('DD MMM [·] HH:mm');
};

export const formatFechaRelativa = (fecha) => {
    return dayjs(fecha).fromNow();
};

export const formatFechaCompleta = (fecha) => {
    return dayjs(fecha).format('dddd, D [de] MMMM [de] YYYY [a las] HH:mm');
};

export const extraerOpcionesFiltros = (traslados) => {
    if (!traslados || traslados.length === 0) {
        return {
            sucursalesOrigen: [],
            sucursalesDestino: [],
            usuarios: []
        };
    }

    return {
        sucursalesOrigen: [...new Set(traslados.map(t => t.sucursalOrigen))].sort(),
        sucursalesDestino: [...new Set(traslados.map(t => t.sucursalDestino))].sort(),
        usuarios: [...new Set(traslados.map(t => t.usuarioResponsable))].sort()
    };
};

export const filtrarTraslados = (traslados, filtros) => {
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
};

export const validarEliminacionTraslado = (traslado) => {
    return !(traslado.estado === 'COMPLETADO' || traslado.estado === 'CANCELADO');
};

/* Elminar traslados completados o cancelados */
export const handleDeleteClick = (traslado, setErrorMessage, setSelectedTraslado, setShowDeleteModal) => {
    if (!validarEliminacionTraslado(traslado)) {
        setErrorMessage("No se pueden eliminar traslados completados o cancelados");
        return;
    }
        
    setSelectedTraslado(traslado);
    setShowDeleteModal(true);
    setErrorMessage("");
};

export const handleDeleteConfirm = async (selectedTraslado, traslados, setTraslados, setShowDeleteModal, setSelectedTraslado, setIsDeleting, setErrorMessage) => {
    setIsDeleting(true);
    setErrorMessage("");
    
    try {
        await eliminarTrasladoService(selectedTraslado.idTraslado);
        
        setTraslados(
            traslados.filter(t => t.idTraslado !== selectedTraslado.idTraslado)
        );
            
        setShowDeleteModal(false);
        setSelectedTraslado(null);
    } catch (error) {
        console.error("Error al eliminar traslado:", error);
        setErrorMessage(
            error.response?.data?.message || 
            error.message || 
            "Ocurrió un error al intentar eliminar el traslado"
        );
    } finally {
        setIsDeleting(false);
    }
};