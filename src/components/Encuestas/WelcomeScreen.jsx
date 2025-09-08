import { useState } from 'react'

const WelcomeScreen = ({ onNext, data }) => {
  const [selectedOption, setSelectedOption] = useState(data.generalExperience || null)

  const options = [
    { value: 1, emoji: '😠', label: 'Muy Difícil' },
    { value: 2, emoji: '😟', label: 'Difícil' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '🙂', label: 'Fácil' },
    { value: 5, emoji: '😄', label: 'Muy Fácil' }
  ]

  const handleNext = () => {
    if (selectedOption !== null) {
      onNext({ generalExperience: selectedOption })
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">
        En general, ¿qué tan fácil fue ser atendido hoy en nuestra tienda?
      </h1>
      <p className="screen-subtitle">
        Selecciona la opción que mejor describa tu experiencia
      </p>
      
      <div className="emoji-scale">
        {options.map((option) => (
          <div
            key={option.value}
            className={`emoji-option ${selectedOption === option.value ? 'selected' : ''}`}
            onClick={() => setSelectedOption(option.value)}
          >
            <span className="emoji">{option.emoji}</span>
            <span className="emoji-label">{option.label}</span>
          </div>
        ))}
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={selectedOption === null}
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}

export default WelcomeScreen