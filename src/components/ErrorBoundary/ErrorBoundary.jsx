import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Método para capturar errores en los componentes hijos
  static getDerivedStateFromError(error) {
    // Actualiza el estado para mostrar un mensaje de error
    return { hasError: true };
  }

  // Método para registrar información del error
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Renderiza un mensaje de error personalizado
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>¡Algo salió mal!</h1>
          <p>Por favor, recarga la página o intenta nuevamente más tarde.</p>
          <details style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}>
            <summary>Detalles del error</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
          </details>
        </div>
      );
    }

    // Si no hay errores, renderiza los componentes hijos
    return this.props.children;
  }
}

export default ErrorBoundary;