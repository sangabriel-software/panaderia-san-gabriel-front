import React, { useState, useEffect } from 'react';
import './CustomerResponses.styles.css';

const CustomerResponses = () => {
  // Estado de la encuesta
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preguntas de la encuesta - todas con tipo 'stars'
  const questions = [
    {
      id: 'speed',
      type: 'stars',
      title: '¿Qué tan rápido fue el servicio?',
      subtitle: 'Califique del 1 al 5 estrellas'
    },
    {
      id: 'service',
      type: 'stars',
      title: '¿Cómo calificaría la calidad del servicio?',
      subtitle: 'Califique del 1 al 5 estrellas'
    },
    {
      id: 'cleanliness',
      type: 'stars',
      title: '¿Qué tan limpio encontró nuestro establecimiento?',
      subtitle: 'Califique del 1 al 5 estrellas'
    },
    {
      id: 'staff',
      type: 'stars',
      title: '¿Cómo calificaría la amabilidad de nuestro personal?',
      subtitle: 'Califique del 1 al 5 estrellas'
    },
    {
      id: 'recommendations',
      type: 'text',
      title: 'Por favor, comparta sus recomendaciones o comentarios adicionales:'
    }
  ];

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
    localStorage.removeItem('customerSurveyResponses');
  };

  // Navegar a la siguiente pregunta o enviar
  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Último paso - enviar encuesta
      setIsSubmitting(true);
      
      const payload = {
        timestamp: new Date().toISOString(),
        responses: responses,
        surveyVersion: '1.0'
      };
      
      console.log('Payload para el backend:', payload);
      
      // Simular envío
      setTimeout(() => {
        setIsSubmitting(false);
        setShowThankYou(true);
        // Limpiar el localStorage después del envío exitoso
        localStorage.removeItem('customerSurveyResponses');
      }, 2000);
    }
  };

  // Navegar a la pregunta anterior
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Calcular progreso
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Verificar si la pregunta actual está respondida
  const isCurrentQuestionAnswered = () => {
    const currentQ = questions[currentQuestion];
    const answer = responses[currentQ.id];
    
    if (currentQ.type === 'stars') {
      return answer !== undefined;
    } else if (currentQ.type === 'text') {
      return true; // Los comentarios son opcionales
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
            // Efecto hover temporal
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
            // Remover efecto hover
            const starElements = e.currentTarget.parentNode.querySelectorAll('.star');
            starElements.forEach(star => {
              star.classList.remove('star-hover');
            });
          }}
        >
          {/* SVG de estrella */}
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
      1: 'Muy Malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: 'Excelente'
    };
    
    return descriptions[value] || '';
  };

  if (showThankYou) {
    return (
      <div className="thank-you-wrapper">
        <div className="container thank-you-container-wrapper">
          <div className="thank-you-container">
            {/* Ícono de éxito animado */}
            <div className="success-icon-container">
              <div className="success-icon-ping"></div>
              <div className="success-icon-base">
                {/* SVG del checkmark */}
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
            
            <h2>¡Gracias por su feedback!</h2>
            <p>Sus respuestas han sido registradas exitosamente y serán de gran ayuda para mejorar nuestros servicios.</p>
            <p>¡Apreciamos mucho su tiempo y confianza!</p>
            
            {/* Botón para reiniciar encuesta */}
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
        {/* Header */}
        <div className="header">
          <h1>Encuesta de Satisfacción</h1>
          <p>Su opinión nos ayuda a mejorar</p>
        </div>
        
        {/* Barra de progreso */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        
        {/* Contenido de la encuesta */}
        <div className="survey-content">
          <div className="question-counter">
            <span className="question-badge">
              Pregunta {currentQuestion + 1} de {questions.length}
            </span>
          </div>
          
          <div className="question-container">
            <div className="question-text">{currentQ.title}</div>
            {currentQ.subtitle && (
              <div className="question-subtitle">{currentQ.subtitle}</div>
            )}
            
            {currentQ.type === 'stars' && (
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
            
            {currentQ.type === 'text' && (
              <textarea 
                className="text-input"
                placeholder="Escriba sus comentarios aquí..."
                value={responses[currentQ.id] || ''}
                onChange={handleTextChange}
                rows={5}
              />
            )}
          </div>
          
          {/* Botones de navegación */}
          <div className="nav-buttons">
            <button
              className="nav-btn prev-btn"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              {/* SVG flecha izquierda */}
              <svg className="btn-icon btn-icon-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            
            <button
              className={`nav-btn next-btn ${isLastQuestion ? 'submit' : ''} ${isSubmitting ? 'loading' : ''}`}
              onClick={nextQuestion}
              disabled={!isCurrentQuestionAnswered() && currentQ.type === 'stars'}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Enviando...
                </>
              ) : isLastQuestion ? (
                <>
                  Enviar
                  {/* SVG de enviar */}
                  <svg className="btn-icon btn-icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              ) : (
                <>
                  Siguiente
                  {/* SVG flecha derecha */}
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