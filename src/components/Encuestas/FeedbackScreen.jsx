import { useState } from 'react'

const FeedbackScreen = ({ onNext, onPrevious, data }) => {
  const [comments, setComments] = useState(data.comments || '')

  const handleNext = () => {
    onNext({ comments })
  }

  return (
    <div className="screen">
      <h1 className="screen-title">
        ¿Tiene alguna recomendación o comentario específico?
      </h1>
      <p className="screen-subtitle">
        Sus comentarios nos ayudan a mejorar nuestro servicio (opcional)
      </p>

      <div className="comment-field">
        <label htmlFor="comments">
          Cuéntanos más sobre su experiencia:
        </label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Escriba aquí sus comentarios, sugerencias o cualquier detalle que considere importante..."
        />
      </div>

      <div className="button-group">
        <button className="btn btn-secondary" onClick={onPrevious}>
          ← Anterior
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Finalizar Encuesta →
        </button>
      </div>
    </div>
  )
}

export default FeedbackScreen