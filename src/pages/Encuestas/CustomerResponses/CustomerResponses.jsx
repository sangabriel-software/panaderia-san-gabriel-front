import React, { useState, useEffect } from 'react';
import './CustomerResponses.styles.css';
import { useGetCampaniaEncuesta } from '../../../hooks/Encuestas/useGetCampaniaEncuesta';
import { registrarRespuestaService } from '../../../services/Encuestas/Encuestas.service';
import { getCurrentDateTimeWithSeconds } from '../../../utils/dateUtils';

const CustomerResponses = () => {
  // Estados de la encuesta
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userInfo, setUserInfo] = useState({
    nombre: '',
    telefono: '',
    correo: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  
  const { campania, preguntas, loadingCampania, showErrorCampania, showInfoCampania } = useGetCampaniaEncuesta();

  // Transformar preguntas del backend al formato requerido por el frontend
  const transformPreguntas = (preguntasBackend) => {
    if (!preguntasBackend || preguntasBackend.length === 0) return [];
    
    return preguntasBackend.map(pregunta => ({
      id: `pregunta_${pregunta.idPregunta}`,
      tipo: pregunta.tipo === 'pregunta' ? 'stars' : 'text',
      title: pregunta.pregunta,
      subtitle: pregunta.obligatoria ? 'Esta pregunta es obligatoria' : 'Esta pregunta es opcional',
      obligatoria: pregunta.obligatoria === 1,
      orden: pregunta.orden,
      idPreguntaBackend: pregunta.idPregunta,
      idCampania: pregunta.idCampania
    })).sort((a, b) => a.orden - b.orden);
  };

  const questions = transformPreguntas(preguntas);
  const hasCampania = campania && campania.length > 0;
  const hasPreguntas = preguntas && preguntas.length > 0;

  // Validar información del usuario
  const validateUserInfo = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{08}$/;

    if (!userInfo.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (userInfo.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!userInfo.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!phoneRegex.test(userInfo.telefono.replace(/\D/g, ''))) {
      errors.telefono = 'Ingrese un número de teléfono válido (8 dígitos)';
    }

    if (!userInfo.correo.trim()) {
      errors.correo = 'El correo es requerido';
    } else if (!emailRegex.test(userInfo.correo)) {
      errors.correo = 'Ingrese un correo electrónico válido';
    }

    return errors;
  };

  // Manejar cambio en los campos del usuario
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar envío de información del usuario
  const handleUserInfoSubmit = (e) => {
    e.preventDefault();
    const errors = validateUserInfo();
    
    if (Object.keys(errors).length === 0) {
      setFormErrors({});
      setShowWelcome(false);
    } else {
      setFormErrors(errors);
    }
  };

  // Cargar respuestas guardadas desde localStorage al inicializar
  useEffect(() => {
    const savedResponses = localStorage.getItem('customerSurveyResponses');
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, []);

  // Guardar respuestas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('customerSurveyResponses', JSON.stringify(responses));
  }, [responses]);

  // Manejar selección de estrellas
  const handleStarSelect = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Manejar cambio de texto
  const handleTextChange = (e) => {
    const questionId = questions[currentQuestion].id;
    setResponses(prev => ({
      ...prev,
      [questionId]: e.target.value
    }));
  };

  // Reiniciar encuesta
  const resetSurvey = () => {
    setCurrentQuestion(0);
    setResponses({});
    setShowThankYou(false);
    setIsSubmitting(false);
    setShowWelcome(true);
    setUserInfo({ nombre: '', telefono: '', correo: '' });
    setFormErrors({});
    setSubmitError(null);
    localStorage.removeItem('customerSurveyResponses');
  };

  // Función para enviar las respuestas al backend
  const enviarRespuestasAlBackend = async (payload) => {
    try {
      console.log('🚀 Enviando respuestas al backend...');
      console.log('📤 Payload:', payload);
      
      const response = await registrarRespuestaService(payload);
      
      console.log('✅ Respuesta del servidor:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al enviar respuestas:', error);
      throw error;
    }
  };

  // Navegar a la siguiente pregunta o enviar
  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Último paso - enviar encuesta
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Preparar respuestas para el backend incluyendo información del usuario
        const respuestasFormateadas = [];
        
        // Iterar sobre todas las preguntas para asegurar el orden correcto
        questions.forEach((question) => {
          const respuesta = responses[question.id];
          if (respuesta !== undefined && respuesta !== null && respuesta !== '') {
            respuestasFormateadas.push({
              idPregunta: question.idPreguntaBackend,
              respuesta: respuesta
            });
          }
        });
        
        // Crear payload completo según lo que espera el backend
        const payload = {
          idCampania: campania[0]?.idCampania,
          nombreCampania: campania[0]?.nombreCampania,
          usuario: {
            nombre: userInfo.nombre,
            telefono: userInfo.telefono,
            correo: userInfo.correo
          },
          respuestas: respuestasFormateadas,
          fechaRespuesta: getCurrentDateTimeWithSeconds(),
          metadata: {
            totalPreguntas: questions.length,
            preguntasRespondidas: respuestasFormateadas.length,
            surveyVersion: '1.0'
          }
        };
        
        console.log('🎯 PAYLOAD PARA EL BACKEND 🎯');
        console.log('==============================');
        console.log('📋 Información General:');
        console.log(`ID Campaña: ${payload.idCampania}`);
        console.log(`Nombre Campaña: ${payload.nombreCampania}`);
        console.log(`Fecha Respuesta: ${payload.fechaRespuesta}`);
        console.log(`Hora Respuesta: ${payload.horaRespuesta}`);
        console.log('');
        
        console.log('👤 Información del Usuario:');
        console.log(`Nombre: ${payload.usuario.nombre}`);
        console.log(`Teléfono: ${payload.usuario.telefono}`);
        console.log(`Correo: ${payload.usuario.correo}`);
        console.log('');
        
        console.log('❓ Respuestas de la Encuesta:');
        payload.respuestas.forEach((respuesta, index) => {
          const pregunta = questions.find(q => q.idPreguntaBackend === respuesta.idPregunta);
          console.log(`Pregunta ${index + 1}:`);
          console.log(`  ID Pregunta: ${respuesta.idPregunta}`);
          console.log(`  Texto: ${pregunta?.title || 'No encontrada'}`);
          console.log(`  Tipo: ${pregunta?.tipo || 'Desconocido'}`);
          console.log(`  Respuesta: ${respuesta.respuesta}`);
          console.log('  ---');
        });
        console.log(`Total respuestas: ${payload.respuestas.length}/${payload.metadata.totalPreguntas}`);
        console.log('');
        
        // También mostrar el objeto completo para copiar/pegar si es necesario
        console.log('📦 Payload completo (JSON):');
        console.log(JSON.stringify(payload, null, 2));
        
        // Llamar al servicio para registrar las respuestas
        const resultado = await enviarRespuestasAlBackend(payload);
        
        console.log('✅ ENCUESTA ENVIADA EXITOSAMENTE');
        console.log('===============================');
        console.log(`📨 Respuesta del servidor:`, resultado);
        console.log(`👤 Usuario: ${userInfo.nombre}`);
        console.log(`📞 Contacto: ${userInfo.telefono}`);
        console.log(`📊 Respuestas enviadas: ${respuestasFormateadas.length}/${questions.length}`);
        
        // Limpiar localStorage después del envío exitoso
        localStorage.removeItem('customerSurveyResponses');
        
        // Mostrar pantalla de agradecimiento
        setIsSubmitting(false);
        setShowThankYou(true);
        
      } catch (error) {
        console.error('❌ Error al enviar la encuesta:', error);
        setIsSubmitting(false);
        setSubmitError('Ocurrió un error al enviar las respuestas. Por favor, intente nuevamente.');
        
        // Puedes agregar más lógica aquí, como mostrar un mensaje de error al usuario
        // o permitir reintentar el envío
      }
    }
  };

  // Navegar a la pregunta anterior
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Calcular progreso
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  // Verificar si la pregunta actual está respondida
  const isCurrentQuestionAnswered = () => {
    if (questions.length === 0) return false;
    
    const currentQ = questions[currentQuestion];
    const answer = responses[currentQ.id];
    
    if (currentQ.tipo === 'stars') {
      if (currentQ.obligatoria) {
        return answer !== undefined && answer !== null;
      }
      return true;
    } else if (currentQ.tipo === 'text') {
      return true;
    }
    return false;
  };

  // Renderizar estrellas
  const renderStars = (questionId, selectedValue) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star ${i <= (selectedValue || 0) ? 'star-filled' : 'star-empty'}`}
          onClick={() => handleStarSelect(questionId, i)}
          onMouseEnter={(e) => {
            const starElements = e.currentTarget.parentNode.querySelectorAll('.star');
            starElements.forEach((star, index) => {
              if (index < i) {
                star.classList.add('star-hover');
              } else {
                star.classList.remove('star-hover');
              }
            });
          }}
          onMouseLeave={(e) => {
            const starElements = e.currentTarget.parentNode.querySelectorAll('.star');
            starElements.forEach(star => {
              star.classList.remove('star-hover');
            });
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="star-icon">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      );
    }
    return stars;
  };

  // Obtener descripción de la calificación con estrellas
  const getStarDescription = (value) => {
    if (!value) return '';
    
    const descriptions = {
      1: 'Muy Insatisfecho',
      2: 'Insatisfecho',
      3: 'Neutral',
      4: 'Satisfecho',
      5: 'Muy Satisfecho'
    };
    
    return descriptions[value] || '';
  };

  // Pantalla de carga principal
  if (loadingCampania) {
    return (
      <div className="survey-wrapper">
        <div className="container">
          <div className="header">
            <h1>Preparando su experiencia</h1>
            <p>Cargando la encuesta...</p>
          </div>
          <div className="loading-content">
            <div className="loading-animation">
              <div className="loading-spinner-large"></div>
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
            <p className="loading-text">Cargando su experiencia personalizada...</p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de bienvenida
  if (showWelcome && hasCampania && hasPreguntas) {
    return (
      <div className="survey-wrapper">
        <div className="container welcome-container">
          <div className="header">
            <h1>¡Bienvenido!</h1>
            <p>Antes de comenzar, necesitamos conocer algunos datos</p>
          </div>
          
          <div className="welcome-content">
            <div className="welcome-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            
            <div className="campaign-info">
              <h2>{campania[0]?.nombreCampania}</h2>
              <p className="campaign-description">{campania[0]?.descripcion}</p>
            </div>
            
            <form onSubmit={handleUserInfoSubmit} className="user-info-form">
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={userInfo.nombre}
                  onChange={handleUserInfoChange}
                  className={formErrors.nombre ? 'input-error' : ''}
                  placeholder="Ingrese su nombre completo"
                  autoComplete="name"
                />
                {formErrors.nombre && (
                  <div className="error-message">{formErrors.nombre}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="telefono">
                  Teléfono <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={userInfo.telefono}
                  onChange={handleUserInfoChange}
                  className={formErrors.telefono ? 'input-error' : ''}
                  placeholder="8 dígitos (ej. 55123456)"
                  autoComplete="tel"
                />
                {formErrors.telefono && (
                  <div className="error-message">{formErrors.telefono}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="correo">
                  Correo electrónico <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={userInfo.correo}
                  onChange={handleUserInfoChange}
                  className={formErrors.correo ? 'input-error' : ''}
                  placeholder="ejemplo@dominio.com"
                  autoComplete="email"
                />
                {formErrors.correo && (
                  <div className="error-message">{formErrors.correo}</div>
                )}
              </div>
              
              <button type="submit" className="start-survey-btn">
                <svg className="btn-icon btn-icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Comenzar Encuesta
              </button>
              
              <p className="form-note">
                <span className="required">*</span> Campos obligatorios
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay campaña activa
  if (showInfoCampania || !hasCampania) {
    return (
      <div className="survey-wrapper">
        <div className="container">
          <div className="header">
            <h1>No hay encuestas disponibles</h1>
            <p>En este momento no hay encuestas activas</p>
          </div>
          <div className="info-content">
            <div className="info-icon">
              <svg width="64" height="64" fill="#667eea" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <h3>No hay encuestas activas</h3>
            <p>
              En este momento no hay ninguna encuesta disponible para completar.
              Por favor, intente más tarde o contacte con el administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si hay campaña pero no preguntas
  if (!hasPreguntas) {
    return (
      <div className="survey-wrapper">
        <div className="container">
          <div className="header">
            <h1>{campania[0]?.nombreCampania || 'Encuesta'}</h1>
            <p>{campania[0]?.descripcion || 'Descripción no disponible'}</p>
          </div>
          <div className="info-content">
            <div className="info-icon warning">
              <svg width="64" height="64" fill="#f59e0b" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <h3>Encuesta en configuración</h3>
            <p>
              La encuesta está configurada pero aún no tiene preguntas disponibles.
              Por favor, contacte con el administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error si hay algún problema
  if (showErrorCampania) {
    return (
      <div className="survey-wrapper">
        <div className="container">
          <div className="header">
            <h1>Error al cargar la encuesta</h1>
            <p>Ocurrió un problema al cargar la encuesta</p>
          </div>
          <div className="error-content">
            <div className="error-icon">
              <svg width="64" height="64" fill="#ef4444" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h3>Error de conexión</h3>
            <p>
              No se pudo cargar la encuesta. Por favor, verifique su conexión a internet
              e intente nuevamente.
            </p>
            <button 
              className="restart-btn" 
              onClick={() => window.location.reload()}
            >
              <svg className="btn-icon btn-icon-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="thank-you-wrapper">
        <div className="container thank-you-container-wrapper">
          <div className="thank-you-container">
            <div className="success-icon-container">
              <div className="success-icon-ping"></div>
              <div className="success-icon-base">
                <svg 
                  className="success-icon-check" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            
            <h2>¡Gracias {userInfo.nombre}!</h2>
            <p>Sus respuestas han sido registradas exitosamente.</p>
            <p>Le contactaremos en {userInfo.correo} si es necesario.</p>
            <p className="campaign-reference">
              Encuesta: <strong>{campania[0]?.nombreCampania}</strong>
            </p>
            
            <button className="restart-btn" onClick={resetSurvey}>
              <svg className="btn-icon btn-icon-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Iniciar Nueva Encuesta
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="survey-wrapper">
      <div className="container">
        <div className="header">
          <h1>{campania[0]?.nombreCampania || 'Encuesta de Satisfacción'}</h1>
          <p>{campania[0]?.descripcion || 'Su opinión nos ayuda a mejorar'}</p>
          <div className="user-info-display">
            <span>{userInfo.nombre}</span>
            {campania[0]?.fechaInicio && campania[0]?.fechaFin && (
              <span className="campaign-dates">
                Disponible del {new Date(campania[0].fechaInicio).toLocaleDateString()} al {new Date(campania[0].fechaFin).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="survey-content">
          <div className="question-counter">
            <span className="question-badge">
              Pregunta {currentQuestion + 1} de {questions.length}
              {currentQ.obligatoria && (
                <span className="obligatory-indicator">● Obligatoria</span>
              )}
            </span>
          </div>
          
          <div className="question-container">
            <div className="question-text">{currentQ.title}</div>
            {currentQ.subtitle && (
              <div className="question-subtitle">{currentQ.subtitle}</div>
            )}
            
            {currentQ.tipo === 'stars' && (
              <div className="stars-container">
                <div className="stars-wrapper">
                  {renderStars(currentQ.id, responses[currentQ.id])}
                </div>
                {responses[currentQ.id] && (
                  <div className="star-rating-feedback">
                    <div className="star-label">
                      {responses[currentQ.id]} de 5 estrellas
                    </div>
                    <div className="star-description">
                      {getStarDescription(responses[currentQ.id])}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {currentQ.tipo === 'text' && (
              <textarea 
                className="text-input"
                placeholder="Escriba sus comentarios aquí..."
                value={responses[currentQ.id] || ''}
                onChange={handleTextChange}
                rows={5}
              />
            )}
          </div>
          
          {/* Mostrar error de envío si existe */}
          {submitError && (
            <div className="submit-error-message">
              <div className="error-icon-small">
                <svg width="20" height="20" fill="#ef4444" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <span>{submitError}</span>
            </div>
          )}
          
          <div className="nav-buttons">
            <button
              className="nav-btn prev-btn"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              <svg className="btn-icon btn-icon-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            
            <button
              className={`nav-btn next-btn ${isLastQuestion ? 'submit' : ''} ${isSubmitting ? 'loading' : ''}`}
              onClick={nextQuestion}
              disabled={!isCurrentQuestionAnswered() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Enviando...
                </>
              ) : isLastQuestion ? (
                <>
                  Enviar
                  <svg className="btn-icon btn-icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              ) : (
                <>
                  Siguiente
                  <svg className="btn-icon btn-icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerResponses;