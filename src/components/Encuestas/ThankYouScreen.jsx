const ThankYouScreen = ({ surveyData, isSubmitting, submitStatus }) => {
    const getEmojiForRating = (rating) => {
      const emojis = ['😠', '😟', '😐', '🙂', '😄']
      return emojis[rating - 1] || '😐'
    }
  
    const getStars = (rating) => {
      return '★'.repeat(rating) + '☆'.repeat(5 - rating)
    }
  
    return (
      <div className="screen">
        <div className="thank-you-content">
          {isSubmitting && (
            <div className="submission-status submitting">
              <div className="loading-spinner"></div>
              <p>Enviando su encuesta...</p>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="submission-status error">
              <span className="error-icon">⚠️</span>
              <p>Hubo un problema al enviar su encuesta. Sus respuestas se han guardado localmente.</p>
            </div>
          )}
          
          {submitStatus === 'success' && (
            <div className="submission-status success">
              <span className="success-icon-small">✅</span>
              <p>Su encuesta se ha enviado exitosamente.</p>
            </div>
          )}
          
          <div className="success-icon">
            <span className="checkmark">✓</span>
          </div>
          
          <h1 className="thank-you-title">¡Gracias por su feedback!</h1>
          <p className="thank-you-message">
            Sus respuestas son muy valiosas para nosotros y nos ayudan a mejorar continuamente 
            nuestro servicio. Esperamos verle pronto nuevamente.
          </p>
  
          <div className="survey-summary">
            <div className="summary-title">Resumen de su evaluación:</div>
            
            <div className="summary-item">
              <span className="summary-label">Experiencia General:</span>
              <span className="summary-value">
                {getEmojiForRating(surveyData.generalExperience)} 
                {surveyData.generalExperience}/5
              </span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">Rapidez del Servicio:</span>
              <span className="summary-value">
                {getStars(surveyData.serviceSpeed)} ({surveyData.serviceSpeed}/5)
              </span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">Amabilidad:</span>
              <span className="summary-value">
                {getStars(surveyData.employeeKindness)} ({surveyData.employeeKindness}/5)
              </span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">Limpieza:</span>
              <span className="summary-value">
                {getStars(surveyData.cleanliness)} ({surveyData.cleanliness}/5)
              </span>
            </div>
            
            {surveyData.comments && (
              <div className="summary-item" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '16px' }}>
                <span className="summary-label" style={{ marginBottom: '8px' }}>Comentarios:</span>
                <span className="summary-value" style={{ fontWeight: 'normal', fontStyle: 'italic' }}>
                  "{surveyData.comments}"
                </span>
              </div>
            )}
          </div>
  
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {submitStatus === 'success' 
              ? 'Su feedback ha sido enviado y registrado exitosamente.' 
              : 'Su feedback ha sido registrado localmente.'}
          </p>
        </div>
      </div>
    )
  }
  
  export default ThankYouScreenapp