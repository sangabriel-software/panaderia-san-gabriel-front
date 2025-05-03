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
            <Container className="loading-container">
                <DotsMove />
            </Container>
        );
    }

    return (
        <Container className="gestionar-container">
            <header className="gestionar-header">
                <h1 className="gestionar-title">
                    <FaBoxes className="title-icon" /> Gestión de Stock
                </h1>
                <p className="gestionar-subtitle">
                    Selecciona una sucursal para gestionar su inventario
                </p>
            </header>
            
            <Row className="sucursales-grid">
                {sucursales.map((sucursal) => (
                    <Col key={sucursal.idSucursal} xs={12} sm={12} lg={4}>
                        <Card className="sucursal-card">
                            <div className="card-header">
                                <FaBuilding className="sucursal-icon" />
                                <h3>{sucursal.nombreSucursal}</h3>
                            </div>
                            <div className="card-location">
                                <FaMapMarkerAlt className="location-icon" />
                                <span>{sucursal.municipioSucursal}, {sucursal.departamentoSucursal}</span>
                            </div>
                            
                            <div className="card-options">
                                <Button 
                                    variant="outline-primary"
                                    className="option-btn stock-general-btn"
                                    onClick={() => handleNavigate(navigate, sucursal.idSucursal, 'stock-general')}
                                >
                                    <FaBoxOpen className="option-icon" />
                                    <div className="option-text">
                                        <span>Stock</span>
                                        <small>Productos en inventario</small>
                                    </div>
                                </Button>
                                
                                <Button
                                    variant="outline-success"
                                    className="option-btn add-btn"
                                    onClick={() => handleAddProductToSucursal(navigate, sucursal.idSucursal)}
                                >
                                    <FaPlus className="option-icon" />
                                    Agregar producto
                                </Button>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default GestionarStockPage;