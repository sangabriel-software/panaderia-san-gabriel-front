import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Badge, Spinner } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { FaPlus, FaMinus, FaClipboardList, FaUser, FaClock, FaStore, FaBreadSlice, FaCookie } from 'react-icons/fa';

const colors = {
  primary: '#6366f1',
  secondary: '#10b981',
  accent: '#f59e0b',
  background: '#f8fafc',
  text: '#334155'
};

const sucursalesMock = [
  { id: 1, nombre: 'Sucursal Centro' },
  { id: 2, nombre: 'Sucursal Norte' },
  { id: 3, nombre: 'Sucursal Sur' }
];

const productos = [
  { id: 1, nombre: 'Pan Francés', categoria: 'Panadería' },
  { id: 2, nombre: 'Pan Dulce', categoria: 'Panadería' },
  { id: 3, nombre: 'Pirujo Pequeño', categoria: 'Repostería' },
  { id: 4, nombre: 'Pirujo Grande', categoria: 'Repostería' },
  { id: 4, nombre: 'Pirujo Grande', categoria: 'Repostería' },
  { id: 4, nombre: 'Pirujo Grande', categoria: 'Repostería' },
  { id: 4, nombre: 'Pirujo Grande', categoria: 'Repostería' },
  { id: 4, nombre: 'Pirujo Grande', categoria: 'Repostería' },
];

const IngresarOrdenProd = () => {
  const [cantidades, setCantidades] = useState({});
  const [turno, setTurno] = useState('AM');
  const [panadero, setPanadero] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [sucursales, setSucursales] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [errorSucursales, setErrorSucursales] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        setSucursales(sucursalesMock);
        setLoadingSucursales(false);
      } catch (error) {
        setErrorSucursales('Error cargando sucursales');
        setLoadingSucursales(false);
      }
    };
    fetchSucursales();
  }, []);

  const getFechaActual = () => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date().toLocaleDateString('es-ES', options);
  };

  const handleCantidad = (id, valor) => {
    const nuevaCantidad = Math.max(0, Number(valor));
    setCantidades(prev => ({ ...prev, [id]: nuevaCantidad }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      fecha: getFechaActual(),
      turno,
      panadero,
      sucursalId,
      usuario: 'admin',
      productos: Object.entries(cantidades)
        .filter(([_, cantidad]) => cantidad > 0)
        .map(([id, cantidad]) => ({
          productId: Number(id),
          cantidad
        }))
    };
    console.log('Orden generada:', payload);
  };

  // Agrupar productos por categoría
  const productosPorCategoria = productos.reduce((acc, producto) => {
    if (!acc[producto.categoria]) {
      acc[producto.categoria] = [];
    }
    acc[producto.categoria].push(producto);
    return acc;
  }, {});

  return (
    <Container fluid className="p-3 p-md-4" style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <h1 className="text-center mb-4 display-5 fw-bold" style={{ color: colors.primary }}>
        <FaClipboardList className="me-2" />
        Orden de Producción
      </h1>

      {/* Encabezado completo */}
      <div className="mb-4 p-3 rounded-3 shadow-sm" style={{ backgroundColor: 'white', border: `1px solid ${colors.primary}20` }}>
        <Row className="g-3 align-items-center">
          <Col xs={12} md={3}>
            <div className="d-flex align-items-center gap-2">
              <FaStore style={{ color: colors.primary }}/>
              <Form.Select
                value={sucursalId}
                onChange={(e) => setSucursalId(e.target.value)}
                style={{ borderColor: colors.primary }}
                disabled={loadingSucursales}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Col>

          <Col xs={6} md={2}>
            <Form.Select 
              value={turno} 
              onChange={(e) => setTurno(e.target.value)}
              style={{ borderColor: colors.primary }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </Form.Select>
          </Col>

          <Col xs={6} md={3}>
            <div className="d-flex align-items-center gap-2">
              <FaUser style={{ color: colors.primary }}/>
              <Form.Control
                placeholder="Nombre panadero"
                value={panadero}
                onChange={(e) => setPanadero(e.target.value)}
                required
                style={{ borderColor: colors.primary }}
              />
            </div>
          </Col>

          <Col xs={12} md={4}>
            <div className="d-flex align-items-center gap-2">
              <FaClock style={{ color: colors.primary }}/>
              <Form.Control
                type="date"
                value={new Date().toISOString().split('T')[0]}
                disabled
                style={{ borderColor: colors.primary }}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Categorías de productos */}
      {Object.entries(productosPorCategoria).map(([categoria, productos]) => (
        <div key={categoria} className="mb-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            {categoria === 'Panadería' ? (
              <FaBreadSlice style={{ color: colors.accent, fontSize: '1.5rem' }}/>
            ) : (
              <FaCookie style={{ color: colors.accent, fontSize: '1.5rem' }}/>
            )}
            <h2 className="h4 mb-0 fw-bold" style={{ color: colors.text }}>
              {categoria}
            </h2>
          </div>

          <Row xs={1} md={2} lg={3} className="g-3">
            {productos.map(producto => (
              <Col key={producto.id}>
                <div className="p-3 rounded-4 shadow-sm position-relative" 
                     style={{ backgroundColor: 'white', border: `1px solid ${colors.primary}20` }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h6 mb-0 fw-bold" style={{ color: colors.text }}>
                      {producto.nombre}
                    </h3>
                    <Badge 
                      pill 
                      className="fs-6"
                      style={{ 
                        backgroundColor: colors.secondary,
                        minWidth: '35px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {cantidades[producto.id] || 0}
                    </Badge>
                  </div>

                  <small className="d-block text-center mb-2" style={{ color: colors.primary }}>
                    Cantidad en Bandejas
                  </small>

                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleCantidad(producto.id, (cantidades[producto.id] || 0) - 1)}
                      style={{ borderRadius: '8px', padding: '0.25rem 0.5rem' }}
                    >
                      <FaMinus />
                    </Button>
                    
                    <Form.Control
                      type="number"
                      min="0"
                      value={cantidades[producto.id] || 0}
                      onChange={(e) => handleCantidad(producto.id, e.target.value)}
                      className="text-center"
                      style={{
                        width: '70px',
                        borderColor: colors.primary,
                        borderRadius: '8px',
                        padding: '0.25rem'
                      }}
                    />
                    
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleCantidad(producto.id, (cantidades[producto.id] || 0) + 1)}
                      style={{ borderRadius: '8px', padding: '0.25rem 0.5rem' }}
                    >
                      <FaPlus />
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      <div className={`mt-4 ${isMobile ? 'fixed-bottom p-3' : 'text-center'}`}>
        <Button 
          variant="primary" 
          type="submit" 
          className="w-100 fw-bold py-2"
          style={{
            background: colors.primary,
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem'
          }}
          onClick={handleSubmit}
        >
          Generar Orden
        </Button>
      </div>
    </Container>
  );
};

export default IngresarOrdenProd;