import { useState, useEffect } from 'react'
import WelcomeScreen from './WelcomeScreen'
import SpecificQuestionsScreen from './SpecificQuestionsScreen'
import FeedbackScreen from './FeedbackScreen'
import ThankYouScreen from './ThankYouScreen'
import ProgressBar from './ProgressBar'

const SurveyComponent = () => {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [surveyData, setSurveyData] = useState({
    generalExperience: null,
    serviceSpeed: null,
    employeeKindness: null,
    cleanliness: null,
    comments: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', null

  const totalScreens = 4
  const STORAGE_KEY = 'ces_survey_data'

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setSurveyData(parsedData)
      } catch (error) {
        console.error('Error parsing saved survey data:', error)
      }
    }
  }, [])

  // Guardar en localStorage cada vez que cambian los datos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(surveyData))
  }, [surveyData])

  const handleNext = (data) => {
    const updatedData = { ...surveyData, ...data }
    setSurveyData(updatedData)
    
    // Si estamos en la pantalla 3 (FeedbackScreen), enviar al backend
    if (currentScreen === 3) {
      submitSurveyData(updatedData)
    }
    
    setCurrentScreen(prev => prev + 1)
  }

  const handlePrevious = () => {
    setCurrentScreen(prev => prev - 1)
  }

  const submitSurveyData = async (data) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Preparar los datos para enviar
      const surveyPayload = {
        timestamp: new Date().toISOString(),
        responses: {
          generalExperience: data.generalExperience,
          serviceSpeed: data.serviceSpeed,
          employeeKindness: data.employeeKindness,
          cleanliness: data.cleanliness,
          comments: data.comments || ''
        },
        // Calcular métricas adicionales
        averageRating: calculateAverageRating(data),
        completionTime: Date.now() - (JSON.parse(localStorage.getItem('survey_start_time')) || Date.now())
      }

      // Simular llamada al backend (reemplaza con tu endpoint real)
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyPayload)
      })

      if (response.ok) {
        setSubmitStatus('success')
        // Limpiar localStorage después del envío exitoso
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem('survey_start_time')
        console.log('Survey submitted successfully')
      } else {
        throw new Error('Failed to submit survey')
      }
    } catch (error) {
      console.error('Error submitting survey:', error)
      setSubmitStatus('error')
      
      // En caso de error, mantener los datos en localStorage para reintento
      localStorage.setItem(`${STORAGE_KEY}_failed`, JSON.stringify({
        data: surveyPayload,
        error: error.message,
        timestamp: new Date().toISOString()
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateAverageRating = (data) => {
    const ratings = [
      data.generalExperience,
      data.serviceSpeed,
      data.employeeKindness,
      data.cleanliness
    ].filter(rating => rating !== null && rating !== undefined)
    
    return ratings.length > 0 
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)
      : 0
  }

  // Guardar tiempo de inicio al comenzar la encuesta
  useEffect(() => {
    if (currentScreen === 1 && !localStorage.getItem('survey_start_time')) {
      localStorage.setItem('survey_start_time', JSON.stringify(Date.now()))
    }
  }, [currentScreen])

  const renderScreen = () => {
    switch (currentScreen) {
      case 1:
        return <WelcomeScreen onNext={handleNext} data={surveyData} />
      case 2:
        return <SpecificQuestionsScreen onNext={handleNext} onPrevious={handlePrevious} data={surveyData} />
      case 3:
        return <FeedbackScreen onNext={handleNext} onPrevious={handlePrevious} data={surveyData} />
      case 4:
        return (
          <ThankYouScreen 
            surveyData={surveyData} 
            isSubmitting={isSubmitting}
            submitStatus={submitStatus}
          />
        )
      default:
        return <WelcomeScreen onNext={handleNext} data={surveyData} />
    }
  }

  return (
    <div className="survey-container">
      <ProgressBar currentStep={currentScreen} totalSteps={totalScreens} />
      {renderScreen()}
    </div>
  )
}

export default SurveyComponent