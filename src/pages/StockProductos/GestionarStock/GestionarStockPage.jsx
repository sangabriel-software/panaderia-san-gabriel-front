import { Container, Row, Col, Card, Button } from "react-bootstrap";
import DotsMove from "../../../components/Spinners/DotsMove";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { useNavigate } from "react-router-dom";
import "./GestionarStockPage.styles.css";
import { FaBoxes, FaStore, FaBuilding, FaMapMarkerAlt, FaBoxOpen, FaShoppingCart, FaPlus } from "react-icons/fa";
import { handleAddProductToSucursal, handleNavigate } from "./GestionarStockPage.utils";

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

    return (
        <Container className="gestionar-stock-container">
            <div className="gestionar-stock-header">
                <h1 className="gestionar-stock-title">
                    <FaBoxes className="gestionar-stock-title-icon" /> Gestión de Stock
                </h1>
                <p className="gestionar-stock-subtitle">
                    <FaStore className="gestionar-stock-subtitle-icon" /> Seleccione una sucursal y tipo de stock
                </p>
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
                            <h3 className="gestionar-stock-sucursal-name">
                                <FaBuilding className="gestionar-stock-sucursal-icon" /> {sucursal.nombreSucursal}
                            </h3>
                            <p className="gestionar-stock-sucursal-location">
                                <FaMapMarkerAlt className="gestionar-stock-location-icon" /> {sucursal.municipioSucursal}, {sucursal.departamentoSucursal}
                            </p>
                            
                            <div className="gestionar-stock-options-container">
                                <Card 
                                    className="gestionar-stock-option-card stock-total"
                                    onClick={() => handleNavigate(navigate, sucursal.idSucursal, 'ventas-generales')}
                                >
                                    <Card.Body>
                                        <div className="gestionar-stock-option-content">
                                            <FaBoxOpen className="gestionar-stock-icon" />
                                            <div>
                                                <h5>Stock General</h5>
                                                <p>Productos que se ingresan manualmente</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                                
                                <Card 
                                    className="gestionar-stock-option-card stock-diario"
                                    onClick={() => handleNavigate(navigate, sucursal.idSucursal, 'venta-diaria')}
                                >
                                    <Card.Body>
                                        <div className="gestionar-stock-option-content">
                                            <FaShoppingCart className="gestionar-stock-icon" />
                                            <div>
                                                <h5>Stock Ventas Diarias</h5>
                                                <p>Productos que se ingrean por orden de produccion</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Button
                                    className="gestionar-stock-sucursal-add-button"
                                    onClick={() => handleAddProductToSucursal(navigate, sucursal.idSucursal)}
                                >
                                    <FaPlus /> Agregar a esta sucursal
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