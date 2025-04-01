import { Container, Row, Col, Card } from "react-bootstrap";
import DotsMove from "../../../components/Spinners/DotsMove";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { useNavigate } from "react-router-dom";
import "./GestionarStockPage.styles.css"; // Archivo CSS específico para este componente

const GestionarStockPage = () => {
    const { sucursales, loadingSucursales } = useGetSucursales();
    const navigate = useNavigate();

    // Loading mientras se cargan los recursos
    if (loadingSucursales) {
        return (
            <Container
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "70vh" }}
            >
                <DotsMove />
            </Container>
        );
    }

    const handleNavigate = (sucursalId, tipoStock) => {
        navigate(`/stock/${sucursalId}/${tipoStock}`);
    };

    return (
        <Container className="gestionar-stock-container">
            <h1 className="gestionar-stock-title">Gestión de Stock</h1>
            <p className="gestionar-stock-subtitle">Seleccione una sucursal y tipo de stock</p>
            
            <Row className="gestionar-stock-row">
                {sucursales.map((sucursal) => (
                    <Col 
                        key={sucursal.idSucursal} 
                        xs={12} 
                        md={6} 
                        lg={4} 
                        className="gestionar-stock-col"
                    >
                        <div className="gestionar-stock-sucursal-card">
                            <h3 className="gestionar-stock-sucursal-name">{sucursal.nombreSucursal}</h3>
                            <p className="gestionar-stock-sucursal-location">
                                {sucursal.municipioSucursal}, {sucursal.departamentoSucursal}
                            </p>
                            
                            <div className="gestionar-stock-options-container">
                                <Card 
                                    className="gestionar-stock-option-card stock-total"
                                    onClick={() => handleNavigate(sucursal.idSucursal, 'general')}
                                >
                                    <Card.Body>
                                        <div className="gestionar-stock-option-content">
                                            <i className="bi bi-box-seam gestionar-stock-icon"></i>
                                            <div>
                                                <h5>Stock Total</h5>
                                                <p>Gestionar inventario completo</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                                
                                <Card 
                                    className="gestionar-stock-option-card stock-diario"
                                    onClick={() => handleNavigate(sucursal.idSucursal, 'diario')}
                                >
                                    <Card.Body>
                                        <div className="gestionar-stock-option-content">
                                            <i className="bi bi-cart-check gestionar-stock-icon"></i>
                                            <div>
                                                <h5>Ventas Diarias</h5>
                                                <p>Productos vendidos hoy</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default GestionarStockPage;