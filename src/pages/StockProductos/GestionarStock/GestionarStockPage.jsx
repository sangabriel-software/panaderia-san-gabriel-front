import { Container, Row, Col, Card, Button } from "react-bootstrap";
import DotsMove from "../../../components/Spinners/DotsMove";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { useNavigate } from "react-router-dom";
import "./GestionarStockPage.styles.css";

const GestionarStockPage = () => {
    const { sucursales, loadingSucursales } = useGetSucursales();
    const navigate = useNavigate();

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

    const handleAddProduct = () => {
        navigate("/stock/agregar-producto");
    };

    const handleAddProductToSucursal = (sucursalId) => {
        navigate(`/stock/agregar-producto/${sucursalId}`);
    };

    return (
        <Container className="gestionar-stock-container">
            <div className="gestionar-stock-header">
                <h1 className="gestionar-stock-title">Gestión de Stock</h1>
                <p className="gestionar-stock-subtitle">Seleccione una sucursal y tipo de stock</p>
            </div>
            
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

                                <Button
                                    className="gestionar-stock-sucursal-add-button"
                                    onClick={() => handleAddProductToSucursal(sucursal.idSucursal)}
                                >
                                    <i className="bi bi-plus-lg"></i> Agregar a esta sucursal
                                </Button>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default GestionarStockPage;