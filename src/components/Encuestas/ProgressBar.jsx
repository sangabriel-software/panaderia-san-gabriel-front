const ProgressBar = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100
  
    return (
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '4px',
        background: '#e5e7eb',
        zIndex: 10
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #3B82F6, #10B981)',
          width: `${progress}%`,
          transition: 'width 0.5s ease'
        }} />
      </div>
    )
  }
  
  export default ProgressBar