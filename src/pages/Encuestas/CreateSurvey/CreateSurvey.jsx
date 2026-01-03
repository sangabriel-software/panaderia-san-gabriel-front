import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal } from 'react-bootstrap';
import { FiEye, FiEdit2, FiBarChart2, FiTrash2, FiX, FiCalendar, FiUser, FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';
import dayjs from 'dayjs';
import './CreateSurvey.styles.css';
import useGetEncuestasList from '../../../hooks/Encuestas/useGetEncuestasList';
import { BsFillInfoCircleFill, BsExclamationTriangleFill } from 'react-icons/bs';
import Alert from '../../../components/Alerts/Alert';
import ConfirmPopUp from '../../../components/Popup/ConfirmPopup';
import ErrorPopup from '../../../components/Popup/ErrorPopUp';
import { useMediaQuery } from 'react-responsive'; // Importar useMediaQuery

// Importar utilidades
import { crearCampania, eliminarCampania, consultarCampaniaDetalle, createEncuestaObject, getStatus, getTypeColor, getTypeIcon, formatDate, formatDateTime, validateFormData, calculateStats, getInitialFormData, getInitialQuestion } from './CreateSurvey.utils';

// Componente de alerta moderna (se mantiene igual)
const ModernAlert = ({ message, type, onClose }) => {
  // ... (código del componente ModernAlert se mantiene igual)
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          color: '#155724',
          icon: '✅'
        };
      case 'error':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          color: '#721c24',
          icon: '❌'
        };
      case 'info':
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          color: '#0c5460',
          icon: 'ℹ️'
        };
      default:
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          color: '#155724',
          icon: '✅'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`modern-alert ${isVisible ? 'show' : 'hide'}`} style={{ backgroundColor: styles.backgroundColor, borderColor: styles.borderColor }}>
      <div className="modern-alert-content">
        <span className="modern-alert-icon">{styles.icon}</span>
        <span className="modern-alert-message" style={{ color: styles.color }}>{message}</span>
        <button className="modern-alert-close" onClick={onClose}>×</button>
      </div>
      <div className="modern-alert-progress">
        <div 
          className="modern-alert-progress-bar" 
          style={{ backgroundColor: styles.color }}
        />
      </div>
    </div>
  );
};

// Componente para estadísticas solo en desktop
const DesktopStats = ({ stats }) => {
  return (
    <div className="stats-row">
      <div className="stat">
        <div className="stat-value">{stats.total}</div>
        <div className="stat-label">Encuestas</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.active}</div>
        <div className="stat-label">Activas</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.responses}</div>
        <div className="stat-label">Respuestas</div>
      </div>
    </div>
  );
};

// Componente para estadísticas móviles (opcional - si quieres mostrar algo diferente)
const MobileStats = ({ stats }) => {
  return (
    <div className="mobile-stats">
      <div className="mobile-stats-summary">
        <span className="mobile-stats-text">
          {stats.total} encuestas • {stats.active} activas • {stats.responses} respuestas
        </span>
      </div>
    </div>
  );
};

const CreateSurvey = () => {
  const [activeTab, setActiveTab] = useState('surveys');
  const { encuestas, loading, showError, showInfo, setEncuestas } = useGetEncuestasList();

  // Estados para el formulario de creación
  const [formData, setFormData] = useState(getInitialFormData());
  const [currentQuestion, setCurrentQuestion] = useState(getInitialQuestion());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Estados para los popups
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState('');
  
  // Estados para alertas modernas
  const [modernAlert, setModernAlert] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Estados para el modal de detalles
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [surveyDetails, setSurveyDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);

  // Calcular estadísticas usando la utilidad
  const stats = calculateStats(encuestas);

  // Media queries con react-responsive
  const isDesktop = useMediaQuery({ minWidth: 992 }); // Para dispositivos de escritorio (PC)
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 }); // Para tablets
  const isMobile = useMediaQuery({ maxWidth: 767 }); // Para móviles
  
  // También puedes usar una combinación
  const isDesktopOrLaptop = useMediaQuery({ minDeviceWidth: 1224 });
  const isBigScreen = useMediaQuery({ minDeviceWidth: 1824 });
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });

  const handleCreateSurvey = () => {
    setActiveTab('create');
  };

  const showModernAlert = (message, type = 'success') => {
    setModernAlert({
      show: true,
      message,
      type
    });
  };

  // Función para cargar detalles de una encuesta
  const handleViewDetails = async (encuestaId) => {
    setSelectedSurveyId(encuestaId);
    setLoadingDetails(true);
    setShowDetailsModal(true);
    
    try {
      const response = await consultarCampaniaDetalle(encuestaId);
      setSurveyDetails(response.campania);
    } catch (error) {
      setErrorPopupMessage(error.message || 'Error al cargar los detalles de la encuesta.');
      setIsErrorPopupOpen(true);
      setSurveyDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewResults = (encuestaId) => {
    setErrorPopupMessage('Ver Resultados: Esta función estará disponible próximamente.');
    setIsErrorPopupOpen(true);
  };

  const handleEditSurvey = (encuestaId) => {
    setErrorPopupMessage('Editar Encuesta: Esta función estará disponible próximamente.');
    setIsErrorPopupOpen(true);
  };

  const handleDeleteSurvey = (encuestaId) => {
    setDeleteId(encuestaId);
    setIsConfirmPopupOpen(true);
  };

  // Función para ejecutar la eliminación
  const executeDeleteSurvey = async (encuestaId) => {
    setIsDeleting(true);
    setIsConfirmPopupOpen(false);
    
    try {
      await eliminarCampania(encuestaId);
      const updatedEncuestas = encuestas.filter(e => e.id !== encuestaId);
      setEncuestas(updatedEncuestas);
      showModernAlert('La encuesta ha sido eliminada exitosamente.', 'success');
      
    } catch (error) {
      console.error('Error al eliminar la encuesta:', error);
      showModernAlert(error.message || 'Error al eliminar la encuesta. Por favor, intenta de nuevo.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Manejadores para el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: name === 'obligatoria' ? parseInt(value) : value
    }));
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.pregunta.trim()) {
      showModernAlert('Por favor, ingresa el texto de la pregunta', 'error');
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      orden: formData.preguntas.length + 1,
      fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };

    setFormData(prev => ({
      ...prev,
      preguntas: [...prev.preguntas, newQuestion]
    }));

    setCurrentQuestion(getInitialQuestion(formData.preguntas.length + 2));

    showModernAlert('Pregunta agregada correctamente', 'success');
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = formData.preguntas.filter((_, i) => i !== index);
    
    const reorderedQuestions = updatedQuestions.map((question, idx) => ({
      ...question,
      orden: idx + 1
    }));

    setFormData(prev => ({
      ...prev,
      preguntas: reorderedQuestions
    }));

    if (currentQuestion.orden > index + 1) {
      setCurrentQuestion(prev => ({
        ...prev,
        orden: prev.orden - 1
      }));
    }

    showModernAlert('Pregunta eliminada', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar datos usando la utilidad
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      showModernAlert(validation.message, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await crearCampania(formData);
      
      // Crear objeto de encuesta usando la utilidad
      const nuevaEncuesta = createEncuestaObject(formData, response);
      setEncuestas(prev => [nuevaEncuesta, ...prev]);
      
      // Restablecer formularios usando las utilidades
      setFormData(getInitialFormData());
      setCurrentQuestion(getInitialQuestion());
      
      showModernAlert('¡Encuesta creada exitosamente!', 'success');
      
      setTimeout(() => {
        setActiveTab('surveys');
      }, 2000);

    } catch (error) {
      console.error('Error al crear la encuesta:', error);
      showModernAlert(error.message || 'Error al crear la encuesta. Por favor, intenta de nuevo.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estado de carga
  if (loading && activeTab === 'surveys') {
    return (
      <div className="survey-module">
        <div className="module-header">
          <div className="header-content">
            <h1>Encuestas</h1>
            <p>Gestiona y crea nuevas encuestas</p>
          </div>
          <button className="create-btn" onClick={handleCreateSurvey}>
            + Nueva
          </button>
        </div>
        <div className="loading-state">
          <div className="loading-spinner-large"></div>
          <p>Cargando encuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Alerta moderna */}
      {modernAlert.show && (
        <ModernAlert
          message={modernAlert.message}
          type={modernAlert.type}
          onClose={() => setModernAlert({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="survey-module">
        <div className="module-header">
          <div className="header-content">
            <h1>Encuestas</h1>
            <p>Gestiona y crea nuevas encuestas</p>
          </div>
          <button className="create-btn" onClick={handleCreateSurvey}>
            + Nueva
          </button>
        </div>

        <div className="module-tabs">
          <button 
            className={`tab ${activeTab === 'surveys' ? 'active' : ''}`}
            onClick={() => setActiveTab('surveys')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-text">Todas</span>
            <span className="tab-count">{stats.total}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <span className="tab-icon">+</span>
            <span className="tab-text">Crear</span>
          </button>
          <button 
            className={`tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-text">Resultados</span>
          </button>
        </div>

        {activeTab === 'surveys' && (
          <div className="surveys-content">
            {showError && (
              <div className="row justify-content-center my-3">
                <div className="col-md-12 text-center">
                  <Alert
                    type="danger"
                    message="Hubo un error al cargar las encuestas. Intenta más tarde..."
                    icon={<BsExclamationTriangleFill />}
                  />
                </div>
              </div>
            )}

            {encuestas && encuestas.length > 0 ? (
              <>
                {/* Mostrar estadísticas solo en PC (desktop) */}
                {isDesktop ? (
                  <DesktopStats stats={stats} />
                ) : (
                  // Opcional: Mostrar versión móvil/tablet de las estadísticas
                  <MobileStats stats={stats} />
                )}

                <div className="surveys-list">
                  {encuestas.map(encuesta => {
                    const status = getStatus(encuesta);
                    return (
                      <div key={encuesta.id} className="survey-card">
                        <div className="survey-header">
                          <div className="survey-type-icon" style={{ backgroundColor: getTypeColor(encuesta.type) }}>
                            {getTypeIcon(encuesta.type)}
                          </div>
                          <div className="survey-info">
                            <h3 className="survey-title">{encuesta.title}</h3>
                            <p className="survey-description">{encuesta.descripcion}</p>
                          </div>
                          <span className={`status ${status.className}`}>
                            {status.text}
                          </span>
                        </div>
                        <div className="survey-details">
                          <div className="detail">
                            <span className="detail-label">Preguntas:</span>
                            <span className="detail-value highlight">{encuesta.questions || 0}</span>
                          </div>
                          <div className="detail">
                            <span className="detail-label">Respuestas:</span>
                            <span className="detail-value highlight">{encuesta.responses || 0}</span>
                          </div>
                          <div className="detail">
                            <span className="detail-label">Creada:</span>
                            <span className="detail-value">{formatDate(encuesta.created)}</span>
                          </div>
                        </div>
                        <div className="survey-actions">
                          <Button
                            variant="outline-primary"
                            className="action-btn details"
                            onClick={() => handleViewDetails(encuesta.id)}
                            size="sm"
                          >
                            <FiEye size={16} className="me-1" />
                            Detalles
                          </Button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteSurvey(encuesta.id)}
                            disabled={isDeleting && deleteId === encuesta.id}
                          >
                            {isDeleting && deleteId === encuesta.id ? (
                              <>
                                <span className="loading-spinner-small"></span>
                                Eliminando...
                              </>
                            ) : (
                              <>
                                <span className="btn-icon">🗑️</span>
                                Eliminar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : !showError && !loading ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No hay encuestas creadas</h3>
                <p>Crea tu primera encuesta para comenzar</p>
                <button 
                  className="primary-btn" 
                  onClick={() => setActiveTab('create')}
                  style={{ marginTop: '20px' }}
                >
                  + Crear Primera Encuesta
                </button>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="create-content">
            <div className="create-section">
              <h2>Crear Nueva Encuesta</h2>
              <p>Completa todos los campos para crear una nueva encuesta</p>
              
              <form onSubmit={handleSubmit} className="create-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombreCampania" >Nombre de la campaña</label>
                    <input 
                      id="nombreCampania" 
                      name="nombreCampania"
                      type="text" 
                      placeholder="Ej: Encuesta de Satisfacción 2025"
                      value={formData.nombreCampania}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tipoEncuesta">Tipo de encuesta</label>
                    <select 
                      id="tipoEncuesta" 
                      name="tipoEncuesta"
                      value={formData.tipoEncuesta}
                      onChange={handleFormChange}
                    >
                      <option value="online">Online</option>
                      <option value="presencial">Presencial</option>
                      <option value="telefonica">Telefónica</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion" >Descripción</label>
                  <textarea 
                    id="descripcion" 
                    name="descripcion"
                    placeholder="Describe el propósito de esta encuesta"
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fechaInicio" >Fecha de inicio</label>
                    <input 
                      id="fechaInicio" 
                      name="fechaInicio"
                      type="date" 
                      value={formData.fechaInicio}
                      onChange={handleFormChange}
                      min={dayjs().format('YYYY-MM-DD')}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fechaFin" >Fecha de fin</label>
                    <input 
                      id="fechaFin" 
                      name="fechaFin"
                      type="date" 
                      value={formData.fechaFin}
                      onChange={handleFormChange}
                      min={formData.fechaInicio}
                    />
                  </div>
                </div>

                <div className="questions-section">
                  <h3>Preguntas de la encuesta</h3>
                  <p>Agrega las preguntas que formarán parte de la encuesta</p>

                  <div className="question-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="pregunta" >Texto de la pregunta</label>
                        <input 
                          id="pregunta" 
                          name="pregunta"
                          type="text" 
                          placeholder="¿Qué te pareció nuestro servicio?"
                          value={currentQuestion.pregunta}
                          onChange={handleQuestionChange}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tipo" >Tipo de pregunta</label>
                        <select 
                          id="tipo" 
                          name="tipo"
                          value={currentQuestion.tipo}
                          onChange={handleQuestionChange}
                        >
                          <option value="pregunta">Pregunta</option>
                          <option value="texto">Texto libre</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="obligatoria" >¿Es obligatoria?</label>
                        <select 
                          id="obligatoria" 
                          name="obligatoria"
                          value={currentQuestion.obligatoria}
                          onChange={handleQuestionChange}
                        >
                          <option value={1}>Sí</option>
                          <option value={0}>No</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Orden: #{currentQuestion.orden}</label>
                        <div className="order-display">Automático</div>
                      </div>
                    </div>

                    <button 
                      type="button"
                      className="add-question-btn"
                      onClick={handleAddQuestion}
                    >
                      <span className="btn-icon">+</span>
                      Agregar Pregunta
                    </button>
                  </div>

                  {formData.preguntas.length > 0 && (
                    <div className="questions-list">
                      <h4>Preguntas agregadas ({formData.preguntas.length})</h4>
                      <div className="questions-container">
                        {formData.preguntas.map((question, index) => (
                          <div key={index} className="question-item">
                            <div className="question-header">
                              <span className="question-order">#{question.orden}</span>
                              <span className={`question-type ${question.tipo}`}>
                                {question.tipo === 'pregunta' ? 'Opción múltiple' : 'Texto libre'}
                              </span>
                              <span>
                                {question.obligatoria ? 'Obligatoria' : 'Opcional'}
                              </span>
                            </div>
                            <div className="question-text">{question.pregunta}</div>
                            <button 
                              type="button"
                              className="remove-question-btn"
                              onClick={() => handleRemoveQuestion(index)}
                              title="Eliminar pregunta"
                            >
                              <span className="btn-icon">🗑️</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => setActiveTab('surveys')}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading-spinner"></span>
                        Creando...
                      </>
                    ) : 'Crear Encuesta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-content">
            <div className="results-header">
              <h2>Resultados</h2>
              <p>Selecciona una encuesta para ver sus resultados</p>
            </div>
            
            {encuestas && encuestas.length > 0 ? (
              <div className="results-list">
                {encuestas.filter(e => (e.responses || 0) > 0).map(encuesta => {
                  const status = getStatus(encuesta);
                  return (
                    <div key={encuesta.id} className="result-card" onClick={() => handleViewResults(encuesta.id)}>
                      <div className="result-header">
                        <div className="result-type-icon" style={{ backgroundColor: getTypeColor(encuesta.type) }}>
                          {getTypeIcon(encuesta.type)}
                        </div>
                        <div className="result-info">
                          <h3>{encuesta.title}</h3>
                          <p className="result-description">{encuesta.descripcion}</p>
                          <span className="response-count">{encuesta.responses || 0} respuestas</span>
                        </div>
                      </div>
                      <div className="result-stats">
                        <div className="result-stat">
                          <span className="stat-label">Tasa de finalización</span>
                          <div className="stat-bar">
                            <div 
                              className="stat-bar-fill" 
                              style={{ 
                                width: `${Math.min(95, 70 + (encuesta.responses || 0) % 30)}%`,
                                backgroundColor: getTypeColor(encuesta.type)
                              }}
                            ></div>
                          </div>
                          <span className="stat-value">{Math.min(95, 70 + (encuesta.responses || 0) % 30)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {encuestas.filter(e => (e.responses || 0) > 0).length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>No hay resultados disponibles</h3>
                    <p>Las encuestas aún no tienen respuestas</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No hay encuestas creadas</h3>
                <p>Crea tu primera encuesta para ver resultados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalles - Similar al de reporte de pérdidas */}
      <Modal
        show={showDetailsModal}
        onHide={() => {
          setShowDetailsModal(false);
          setSurveyDetails(null);
          setSelectedSurveyId(null);
        }}
        size="xlg"
        centered
        className="modal-survey-details"
        scrollable
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <div className="modal-title-content">
              <FiEye size={28} className="me-3 text-primary" />
              <div>
                <div className="modal-title-main">Detalles de la Encuesta</div>
                <div className="modal-title-sub">
                  {surveyDetails?.detalle?.nombreCampania || 'Cargando...'}
                </div>
                <div className="modal-title-meta">
                  <Badge bg="info" className="me-2">
                    ID: {surveyDetails?.detalle?.idCampania || 'N/A'}
                  </Badge>
                  <Badge bg={surveyDetails?.detalle?.activa ? "success" : "danger"}>
                    {surveyDetails?.detalle?.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {loadingDetails ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando detalles...</span>
              </div>
              <p className="mt-3 text-muted">Cargando información de la encuesta...</p>
            </div>
          ) : surveyDetails ? (
            <>
              {/* Resumen de la Encuesta */}
              <div className="modal-summary-section">
                <Row>
                  <Col lg={6} md={12} className="mb-3">
                    <Card className="h-100 summary-card">
                      <Card.Body>
                        <div className="summary-item">
                          <div className="summary-icon">
                            <FiFileText size={24} />
                          </div>
                          <div className="summary-content">
                            <div className="summary-label">Descripción</div>
                            <div className="summary-value">
                              {surveyDetails.detalle.descripcion || 'Sin descripción'}
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 summary-card">
                      <Card.Body>
                        <div className="summary-item">
                          <div className="summary-icon">
                            <FiUser size={24} />
                          </div>
                          <div className="summary-content">
                            <div className="summary-label">Creada por</div>
                            <div className="summary-value">
                              {surveyDetails.detalle.usuario || 'Usuario desconocido'}
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 summary-card">
                      <Card.Body>
                        <div className="summary-item">
                          <div className="summary-icon">
                            <FiCheckCircle size={24} />
                          </div>
                          <div className="summary-content">
                            <div className="summary-label">Preguntas</div>
                            <div className="summary-value">
                              {surveyDetails.preguntas?.length || 0}
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="detail-section">
                          <div className="detail-section-title">
                            <FiCalendar size={18} className="me-2" />
                            <span>Fechas de la Encuesta</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Fecha de Inicio:</span>
                            <span className="detail-value">
                              {dayjs(surveyDetails.detalle.fechaInicio).format('DD/MM/YYYY')}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Fecha de Fin:</span>
                            <span className="detail-value">
                              {dayjs(surveyDetails.detalle.fechaFin).format('DD/MM/YYYY')}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Duración:</span>
                            <span className="detail-value">
                              {dayjs(surveyDetails.detalle.fechaFin).diff(
                                dayjs(surveyDetails.detalle.fechaInicio),
                                'days'
                              )} días
                            </span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="detail-section">
                          <div className="detail-section-title">
                            <FiClock size={18} className="me-2" />
                            <span>Información de Estado</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Estado Actual:</span>
                            <span className="detail-value">
                              <Badge bg={surveyDetails.detalle.activa ? "success" : "danger"}>
                                {surveyDetails.detalle.activa ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">ID de Campaña:</span>
                            <span className="detail-value">
                              <Badge bg="secondary">#{surveyDetails.detalle.idCampania}</Badge>
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Tipo de Preguntas:</span>
                            <span className="detail-value">
                              {surveyDetails.preguntas?.some(p => p.tipo === 'texto') 
                                ? 'Mixto' 
                                : 'Opción múltiple'}
                            </span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>

              {/* Preguntas de la Encuesta */}
              <div className="modal-section">
                <div className="modal-section-header">
                  <FiFileText size={20} className="me-2" />
                  <span>Preguntas ({surveyDetails.preguntas?.length || 0})</span>
                </div>
                <div className="modal-section-content">
                  {surveyDetails.preguntas && surveyDetails.preguntas.length > 0 ? (
                    <div className="questions-list-detailed">
                      {surveyDetails.preguntas.map((pregunta, index) => (
                        <Card key={pregunta.idPregunta || index} className="question-card mb-3">
                          <Card.Body>
                            <div className="question-header-detailed">
                              <Badge bg="primary" className="question-number">
                                Pregunta #{index + 1}
                              </Badge>
                              <Badge bg={pregunta.tipo === 'pregunta' ? "info" : "warning"}>
                                {pregunta.tipo === 'pregunta' ? 'Opción Múltiple' : 'Texto Libre'}
                              </Badge>
                            </div>
                            <div className="question-text-detailed mt-3">
                              <strong>Texto de la pregunta:</strong>
                              <p className="mt-2 mb-0">{pregunta.pregunta}</p>
                            </div>
                            <div className="question-meta mt-3">
                              <small className="text-muted">
                                <FiClock size={12} className="me-1" />
                                ID: {pregunta.idPregunta}
                              </small>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="empty-questions text-center py-4">
                  <FiFileText size={48} className="text-muted mb-3" />
                  <p className="text-muted">No hay preguntas en esta encuesta</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <FiX size={48} className="text-danger mb-3" />
          <p className="text-danger">No se pudieron cargar los detalles de la encuesta</p>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setShowDetailsModal(false)}
          >
            Cerrar
          </Button>
        </div>
      )}
    </Modal.Body>
    <Modal.Footer className="modal-footer-custom">
      <div className="footer-time-info small text-muted">
        <FiClock size={12} className="me-1" />
        Consultado: {dayjs().format('HH:mm:ss')}
      </div>
      <Button 
        variant="secondary" 
        onClick={() => {
          setShowDetailsModal(false);
          setSurveyDetails(null);
          setSelectedSurveyId(null);
        }}
      >
        <FiX size={16} className="me-1" />
        Cerrar
      </Button>
    </Modal.Footer>
  </Modal>

  {/* Popup confirmación de eliminación */}
  <ConfirmPopUp
    isOpen={isConfirmPopupOpen}
    onClose={() => setIsConfirmPopupOpen(false)}
    title="Confirmar Eliminación"
    message="¿Está seguro de eliminar esta encuesta? Esta acción no se puede deshacer."
    isLoading={isDeleting}
    onConfirm={() => {
      if (deleteId) {
        executeDeleteSurvey(deleteId);
      }
    }}
    onCancel={() => setIsConfirmPopupOpen(false)}
  />

  {/* Error popup */}
  <ErrorPopup
    isOpen={isErrorPopupOpen}
    onClose={() => setIsErrorPopupOpen(false)}
    title="¡Error!"
    message={errorPopupMessage}
  />
</>
);
};

export default CreateSurvey;