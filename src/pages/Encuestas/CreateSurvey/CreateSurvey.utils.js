import dayjs from 'dayjs';
import { 
  crearCampaniaServices, 
  eliminarCampaniaServices,
  consultarCampaniaDetalleServices 
} from '../../../services/Encuestas/encuestas.service';

/**
 * Crea una nueva campaña/encuesta
 * @param {Object} formData - Datos del formulario
 * @returns {Promise} Resultado de la creación
 */
export const crearCampania = async (formData) => {
  try {
    const response = await crearCampaniaServices(formData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina una campaña/encuesta
 * @param {number} encuestaId - ID de la encuesta a eliminar
 * @returns {Promise} Resultado de la eliminación
 */
export const eliminarCampania = async (encuestaId) => {
  try {
    const response = await eliminarCampaniaServices(encuestaId);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Consulta los detalles de una campaña/encuesta
 * @param {number} encuestaId - ID de la encuesta
 * @returns {Promise} Detalles de la encuesta
 */
export const consultarCampaniaDetalle = async (encuestaId) => {
  try {
    const response = await consultarCampaniaDetalleServices(encuestaId);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Crea un objeto de encuesta para la lista
 * @param {Object} formData - Datos del formulario
 * @param {Object} responseData - Datos de respuesta del servicio
 * @returns {Object} Objeto de encuesta formateado
 */
export const createEncuestaObject = (formData, responseData) => {
  const now = dayjs();
  const startDate = dayjs(formData.fechaInicio);
  const endDate = dayjs(formData.fechaFin);
  
  let calculatedStatus = 'active';
  if (now.isBefore(startDate)) calculatedStatus = 'scheduled';
  else if (now.isAfter(endDate)) calculatedStatus = 'closed';
  
  return {
    id: responseData.id || Date.now(),
    title: formData.nombreCampania,
    descripcion: formData.descripcion,
    type: formData.tipoEncuesta,
    start_date: formData.fechaInicio,
    end_date: formData.fechaFin,
    created: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    questions: formData.preguntas.length,
    responses: 0,
    calculated_status: calculatedStatus,
    status: 'active'
  };
};

/**
 * Obtiene el estado de una encuesta basado en fechas
 * @param {Object} encuesta - Objeto de encuesta
 * @returns {Object} Estado con texto y clase CSS
 */
export const getStatus = (encuesta) => {
  const status = encuesta.calculated_status || 
                (() => {
                  const now = dayjs();
                  const start = dayjs(encuesta.start_date);
                  const end = dayjs(encuesta.end_date);
                  
                  if (encuesta.status === 'draft') return 'draft';
                  if (now.isBefore(start)) return 'scheduled';
                  if (now.isBetween(start, end, 'day', '[]')) return 'active';
                  if (now.isAfter(end)) return 'closed';
                  return 'unknown';
                })();

  switch(status) {
    case 'active': return { text: 'Activa', className: 'status-active' };
    case 'draft': return { text: 'Borrador', className: 'status-draft' };
    case 'closed': return { text: 'Cerrada', className: 'status-closed' };
    case 'scheduled': return { text: 'Programada', className: 'status-scheduled' };
    default: return { text: 'Desconocido', className: 'status-unknown' };
  }
};

/**
 * Obtiene el color según el tipo de encuesta
 * @param {string} type - Tipo de encuesta
 * @returns {string} Color hexadecimal
 */
export const getTypeColor = (type) => {
  switch(type) {
    case 'online': return '#4F46E5';
    case 'presencial': return '#059669';
    case 'telefonica': return '#D97706';
    case 'email': return '#7C3AED';
    default: return '#6B7280';
  }
};

/**
 * Obtiene el ícono según el tipo de encuesta
 * @param {string} type - Tipo de encuesta
 * @returns {string} Ícono emoji
 */
export const getTypeIcon = (type) => {
  switch(type) {
    case 'online': return '🌐';
    case 'presencial': return '🏪';
    case 'telefonica': return '📞';
    case 'email': return '📧';
    default: return '📋';
  }
};

/**
 * Formatea una fecha a DD/MM/YYYY
 * @param {string} dateString - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  return dayjs(dateString).format('DD/MM/YYYY');
};

/**
 * Formatea una fecha a DD/MM/YYYY HH:mm
 * @param {string} dateString - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

/**
 * Valida los datos del formulario antes de enviar
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Resultado de validación con estado y mensaje
 */
export const validateFormData = (formData) => {
  if (!formData.nombreCampania.trim()) {
    return { isValid: false, message: 'El nombre de la campaña es obligatorio' };
  }

  if (formData.preguntas.length === 0) {
    return { isValid: false, message: 'Debes agregar al menos una pregunta' };
  }

  if (dayjs(formData.fechaFin).isBefore(dayjs(formData.fechaInicio))) {
    return { isValid: false, message: 'La fecha de fin no puede ser anterior a la fecha de inicio' };
  }

  return { isValid: true, message: '' };
};

/**
 * Calcula estadísticas de las encuestas
 * @param {Array} encuestas - Lista de encuestas
 * @returns {Object} Estadísticas calculadas
 */
export const calculateStats = (encuestas) => {
  return {
    total: encuestas?.length || 0,
    active: encuestas?.filter(e => e.calculated_status === 'active')?.length || 0,
    responses: encuestas?.reduce((sum, e) => sum + (e.responses || 0), 0) || 0
  };
};

/**
 * Crea datos iniciales para el formulario
 * @returns {Object} Datos iniciales del formulario
 */
export const getInitialFormData = () => {
  return {
    nombreCampania: '', 
    descripcion: '',
    idUsuarioCreo: 1,
    fechaInicio: dayjs().format('YYYY-MM-DD'),
    fechaFin: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    tipoEncuesta: 'online',
    urlEncuesta: 'https://panaderiasangabriel.vercel.app/surveys/customer-responses',
    fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    fechaActualizacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    preguntas: []
  };
};

/**
 * Crea datos iniciales para una pregunta
 * @param {number} nextOrder - Siguiente orden disponible
 * @returns {Object} Datos iniciales de la pregunta
 */
export const getInitialQuestion = (nextOrder = 1) => {
  return {
    tipo: 'pregunta',
    pregunta: '',
    orden: nextOrder,
    obligatoria: 1,
    fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss')
  };
};