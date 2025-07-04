import { Container, Row, Col, Card, Button } from "react-bootstrap";
import DotsMove from "../../../components/Spinners/DotsMove";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { useNavigate } from "react-router-dom";
import "./GestionarStockPage.styles.css";
import { FaBoxes, FaStore, FaBuilding, FaMapMarkerAlt, FaBoxOpen, FaShoppingCart, FaPlus } from "react-icons/fa";
import { handleAddProductToSucursal, handleNavigate } from "./GestionarStockPage.utils";
import { getUserData } from "../../../utils/Auth/decodedata";

const GestionarStockPage = () => {
    const { sucursales, loadingSucursales } = useGetSucursales();
    const navigate = useNavigate();
    const usuario = getUserData();

    if (loadingSucursales) {
        return (
            <Container className="loading-container">
                <DotsMove />
            </Container>
        );
    }

    // Filtrar sucursales según el rol del usuario
    const sucursalesAMostrar = usuario.idRol === 1 
        ? sucursales 
        : sucursales.filter(suc => suc.idSucursal === usuario.idSucursal);

    return (
        <Container className="gestionar-container">
            <header className="gestionar-header">
                <h1 className="gestionar-title">
                    <FaBoxes className="title-icon" /> Gestión de Stock
                </h1>
                <p className="gestionar-subtitle">
                    {usuario.idRol === 1 
                        ? "Selecciona una sucursal para gestionar su inventario" 
                        : "Tu sucursal asignada"}
                </p>
            </header>
            
            {sucursalesAMostrar.length > 0 ? (
                <Row className="sucursales-grid">
                    {sucursalesAMostrar.map((sucursal) => (
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
            ) : (
                <div className="no-sucursales-message">
                    <p>No tienes sucursales asignadas para gestionar</p>
                </div>
            )}
        </Container>
    );
};

export default GestionarStockPage;