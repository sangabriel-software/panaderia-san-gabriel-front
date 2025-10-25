import { useState } from 'react'
import StarRating from './StarRating'

const SpecificQuestionsScreen = ({ onNext, onPrevious, data }) => {
  const [ratings, setRatings] = useState({
    serviceSpeed: data.serviceSpeed || 0,
    employeeKindness: data.employeeKindness || 0,
    cleanliness: data.cleanliness || 0
  })

  const questions = [
    {
      key: 'serviceSpeed',
      text: '¿Qué tan rápido fue el servicio?',
      labels: { low: 'Muy Lento', high: 'Muy Rápido' }
    },
    {
      key: 'employeeKindness',
      text: '¿Cómo calificaría la amabilidad de nuestros empleados?',
      labels: { low: 'Poco Amable', high: 'Muy Amable' }
    },
    {
      key: 'cleanliness',
      text: '¿Qué tan limpio encontró nuestro local?',
      labels: { low: 'Muy Sucio', high: 'Impecable' }
    }
  ]

  const handleRatingChange = (questionKey, rating) => {
    setRatings(prev => ({ ...prev, [questionKey]: rating }))
  }

  const handleNext = () => {
    const allRated = Object.values(ratings).every(rating => rating > 0)
    if (allRated) {
      onNext(ratings)
    }
  }

  const allRated = Object.values(ratings).every(rating => rating > 0)

  return (
    <div className="screen">
      <h1 className="screen-title">
        Califique su experiencia específica
      </h1>
      <p className="screen-subtitle">
        Por favor, califique cada aspecto del servicio del 1 al 5
      </p>

      {questions.map((question) => (
        <div key={question.key} className="question-group">
          <div className="question-text">{question.text}</div>
          <StarRating
            rating={ratings[question.key]}
            onRatingChange={(rating) => handleRatingChange(question.key, rating)}
          />
          <div className="rating-labels">
            <span>{question.labels.low}</span>
            <span>{question.labels.high}</span>
          </div>
        </div>
      ))}

      <div className="button-group">
        <button className="btn btn-secondary" onClick={onPrevious}>
          ← Anterior
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!allRated}
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}

export default SpecificQuestionsScreen