import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import './CreateSurvey.styles.css';
import { crearCampaniaServices } from '../../../services/Encuestas/encuestas.service';
import useGetEncuestasList from '../../../hooks/Encuestas/useGetEncuestasList';

const CreateSurvey = () => {
  const [activeTab, setActiveTab] = useState('surveys');
  const { encuestas, loading, showError, showInfo, refetch, setEncuestas } = useGetEncuestasList();

  // Estados para el formulario de creación
  const [formData, setFormData] = useState({
    nombreCampania: '',
    descripcion: '',
    idUsuarioCreo: 1, // Este valor vendría del contexto de autenticación
    fechaInicio: dayjs().format('YYYY-MM-DD'),
    fechaFin: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    tipoEncuesta: 'online',
    urlEncuesta: 'https://panaderiasangabriel.vercel.app/surveys/customer-responses',
    fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    fechaActualizacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    preguntas: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    tipo: 'pregunta',
    pregunta: '',
    orden: 1,
    obligatoria: 1,
    fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss')
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'success', 'error', 'info'
    title: '',
    message: '',
    onConfirm: null
  });

  // Calcular estadísticas desde las encuestas reales
  const stats = {
    total: encuestas?.length || 0,
    active: encuestas?.filter(e => e.calculated_status === 'active')?.length || 0,
    responses: encuestas?.reduce((sum, e) => sum + (e.responses || 0), 0) || 0
  };

  const getStatus = (encuesta) => {
    // Usar calculated_status del hook si está disponible, sino calcularlo
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

  const getTypeColor = (type) => {
    switch(type) {
      case 'online': return '#4F46E5';
      case 'presencial': return '#059669';
      case 'telefonica': return '#D97706';
      case 'email': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'online': return '🌐';
      case 'presencial': return '🏪';
      case 'telefonica': return '📞';
      case 'email': return '📧';
      default: return '📋';
    }
  };

  const handleCreateSurvey = () => {
    setActiveTab('create');
  };

  const handleViewResults = (encuestaId) => {
    showModal('info', 'Ver Resultados', 'Esta función estará disponible próximamente.');
  };

  const handleEditSurvey = (encuestaId) => {
    showModal('info', 'Editar Encuesta', 'Esta función estará disponible próximamente.');
  };

  const handleDeleteSurvey = (encuestaId) => {
    showModal('info', 'Eliminar Encuesta', 
      '¿Estás seguro de que deseas eliminar esta encuesta?', 
      () => {
        // Filtrar la encuesta eliminada
        const updatedEncuestas = encuestas.filter(e => e.id !== encuestaId);
        setEncuestas(updatedEncuestas);
        
        showModal('success', 'Encuesta Eliminada', 'La encuesta ha sido eliminada exitosamente.');
      }
    );
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Función para crear un objeto de encuesta para la lista
  const createEncuestaObject = (responseData) => {
    const now = dayjs();
    const startDate = dayjs(formData.fechaInicio);
    const endDate = dayjs(formData.fechaFin);
    
    let calculatedStatus = 'active';
    if (now.isBefore(startDate)) calculatedStatus = 'scheduled';
    else if (now.isAfter(endDate)) calculatedStatus = 'closed';
    
    return {
      id: responseData.id || Date.now(), // Usar el ID de la respuesta o generar uno temporal
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

  // Funciones para el modal
  const showModal = (type, title, message, onConfirm = null) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: '',
      title: '',
      message: '',
      onConfirm: null
    });
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
      showModal('error', 'Error', 'Por favor, ingresa el texto de la pregunta');
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

    // Resetear el formulario de pregunta
    setCurrentQuestion({
      tipo: 'pregunta',
      pregunta: '',
      orden: formData.preguntas.length + 2,
      obligatoria: 1,
      fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss')
    });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = formData.preguntas.filter((_, i) => i !== index);
    
    // Reordenar las preguntas restantes
    const reorderedQuestions = updatedQuestions.map((question, idx) => ({
      ...question,
      orden: idx + 1
    }));

    setFormData(prev => ({
      ...prev,
      preguntas: reorderedQuestions
    }));

    // Actualizar el orden de la pregunta actual
    if (currentQuestion.orden > index + 1) {
      setCurrentQuestion(prev => ({
        ...prev,
        orden: prev.orden - 1
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombreCampania.trim()) {
      showModal('error', 'Error', 'El nombre de la campaña es obligatorio');
      return;
    }

    if (formData.preguntas.length === 0) {
      showModal('error', 'Error', 'Debes agregar al menos una pregunta');
      return;
    }

    // Validar que la fecha de fin no sea anterior a la de inicio
    if (dayjs(formData.fechaFin).isBefore(dayjs(formData.fechaInicio))) {
      showModal('error', 'Error', 'La fecha de fin no puede ser anterior a la fecha de inicio');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await crearCampaniaServices(formData);
      console.log('Encuesta creada exitosamente:', response);
      
      // Crear el objeto de encuesta para la lista
      const nuevaEncuesta = createEncuestaObject(response);
      
      // Agregar la nueva encuesta a la lista en tiempo real
      setEncuestas(prev => [nuevaEncuesta, ...prev]);
      
      // Resetear formulario
      setFormData({
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
      });

      setCurrentQuestion({
        tipo: 'pregunta',
        pregunta: '',
        orden: 1,
        obligatoria: 1,
        fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss')
      });
      
      showModal('success', '¡Éxito!', 'La encuesta ha sido creada exitosamente.', () => {
        setActiveTab('surveys');
      });

    } catch (error) {
      console.error('Error al crear la encuesta:', error);
      showModal('error', 'Error', error.message || 'Error al crear la encuesta. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal Component
  const Modal = () => {
    if (!modal.isOpen) return null;

    const getModalIcon = () => {
      switch(modal.type) {
        case 'success': return '✓';
        case 'error': return '✗';
        case 'info': return 'ℹ';
        default: return '📋';
      }
    };

    const getModalColor = () => {
      switch(modal.type) {
        case 'success': return '#059669';
        case 'error': return '#dc3545';
        case 'info': return '#4F46E5';
        default: return '#6B7280';
      }
    };

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header" style={{ backgroundColor: getModalColor() }}>
            <span className="modal-icon">{getModalIcon()}</span>
            <h3 className="modal-title">{modal.title}</h3>
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
          <div className="modal-body">
            <p>{modal.message}</p>
          </div>
          <div className="modal-footer">
            {modal.onConfirm ? (
              <>
                <button className="modal-btn secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button 
                  className="modal-btn primary" 
                  onClick={() => {
                    modal.onConfirm();
                    closeModal();
                  }}
                  style={{ backgroundColor: getModalColor() }}
                >
                  Confirmar
                </button>
              </>
            ) : (
              <button 
                className="modal-btn primary" 
                onClick={closeModal}
                style={{ backgroundColor: getModalColor() }}
              >
                Aceptar
              </button>
            )}
          </div>
        </div>
      </div>
    );
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
            {encuestas && encuestas.length > 0 ? (
              <>
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
                          <button 
                            className="action-btn edit"
                            onClick={() => handleEditSurvey(encuesta.id)}
                          >
                            <span className="btn-icon">✎</span>
                            Editar
                          </button>
                          <button 
                            className="action-btn results"
                            onClick={() => handleViewResults(encuesta.id)}
                          >
                            <span className="btn-icon">📊</span>
                            Resultados
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteSurvey(encuesta.id)}
                          >
                            <span className="btn-icon">🗑️</span>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
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
            )}
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
                    <label htmlFor="nombreCampania" className="required">Nombre de la campaña</label>
                    <input 
                      id="nombreCampania" 
                      name="nombreCampania"
                      type="text" 
                      placeholder="Ej: Encuesta de Satisfacción 2025"
                      value={formData.nombreCampania}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tipoEncuesta" className="required">Tipo de encuesta</label>
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
                  <label htmlFor="descripcion" className="required">Descripción</label>
                  <textarea 
                    id="descripcion" 
                    name="descripcion"
                    placeholder="Describe el propósito de esta encuesta"
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fechaInicio" className="required">Fecha de inicio</label>
                    <input 
                      id="fechaInicio" 
                      name="fechaInicio"
                      type="date" 
                      value={formData.fechaInicio}
                      onChange={handleFormChange}
                      min={dayjs().format('YYYY-MM-DD')}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fechaFin" className="required">Fecha de fin</label>
                    <input 
                      id="fechaFin" 
                      name="fechaFin"
                      type="date" 
                      value={formData.fechaFin}
                      onChange={handleFormChange}
                      min={formData.fechaInicio}
                      required
                    />
                  </div>
                </div>

                <div className="questions-section">
                  <h3>Preguntas de la encuesta</h3>
                  <p>Agrega las preguntas que formarán parte de la encuesta</p>

                  <div className="question-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="pregunta" className="required">Texto de la pregunta</label>
                        <input 
                          id="pregunta" 
                          name="pregunta"
                          type="text" 
                          placeholder="¿Qué te pareció nuestro servicio?"
                          value={currentQuestion.pregunta}
                          onChange={handleQuestionChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tipo" className="required">Tipo de pregunta</label>
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
                        <label htmlFor="obligatoria" className="required">¿Es obligatoria?</label>
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
                              <span className={`question-required ${question.obligatoria ? 'required' : 'optional'}`}>
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

            {/* <div className="tips-section">
              <h3>Consejos para crear encuestas efectivas</h3>
              <ul>
                <li>Mantén las encuestas cortas (5-10 preguntas)</li>
                <li>Usa preguntas claras y específicas</li>
                <li>Incluye opciones de respuesta balanceadas</li>
                <li>Prueba la encuesta antes de publicarla</li>
                <li>Considera el momento adecuado para enviarla</li>
              </ul>
            </div> */}
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

      <Modal />
    </>
  );
};

export default CreateSurvey;