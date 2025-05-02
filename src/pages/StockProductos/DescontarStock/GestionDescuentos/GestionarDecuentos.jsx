import { useState } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { FaBoxes, FaStore, FaBuilding, FaMapMarkerAlt, FaMinusCircle, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useGetSucursales from "../../../../hooks/sucursales/useGetSucursales";
import DotsMove from "../../../../components/Spinners/DotsMove";
import "./GestionarDecuentos.styles.css";

const GestionarDescuentos = () => {
    const { sucursales, loadingSucursales } = useGetSucursales();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const handleNavigateToDescuentos = (idSucursal) => {
        navigate(`/descontar-productos/${idSucursal}`);
    };

    const filteredSucursales = sucursales.filter(sucursal =>
        sucursal.nombreSucursal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sucursal.municipioSucursal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sucursal.departamentoSucursal.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loadingSucursales) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
                <DotsMove />
            </Container>
        );
    }

    return (
        <Container className="gestionar-descuentos-container">
            <div className="gestionar-descuentos-header">
                <h1 className="gestionar-descuentos-title">
                    <FaBoxes className="me-3" /> Gestión de Descuentos
                </h1>
                <p className="gestionar-descuentos-subtitle">
                    <FaStore className="me-2" /> Seleccione una sucursal para descontar productos
                </p>
                
                {/* Filtro de búsqueda */}
                <div className="gestionar-descuentos-filter">
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <Form.Control
                            type="text"
                            placeholder="Buscar sucursal por nombre, municipio o departamento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-results">
                        {searchTerm && (
                            <span>
                                Mostrando {filteredSucursales.length} de {sucursales.length} sucursales
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <Row className="gestionar-descuentos-row">
                {filteredSucursales.length > 0 ? (
                    filteredSucursales.map((sucursal) => (
                        <Col 
                            key={sucursal.idSucursal} 
                            xs={12} 
                            md={6} 
                            lg={4} 
                            className="gestionar-descuentos-col"
                        >
                            <Card 
                                className="gestionar-descuentos-card"
                                onClick={() => handleNavigateToDescuentos(sucursal.idSucursal)}
                            >
                                <Card.Body>
                                    <div className="gestionar-descuentos-card-header">
                                        <FaBuilding className="gestionar-descuentos-icon" />
                                        <h3 className="gestionar-descuentos-sucursal-name">
                                            {sucursal.nombreSucursal}
                                        </h3>
                                    </div>
                                    
                                    <p className="gestionar-descuentos-location">
                                        <FaMapMarkerAlt className="me-2" /> 
                                        {sucursal.municipioSucursal}, {sucursal.departamentoSucursal}
                                    </p>
                                    
                                    <div className="gestionar-descuentos-action">
                                        <FaMinusCircle className="me-2" />
                                        <span>Descontar productos</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col className="text-center py-5">
                        <div className="no-results">
                            <p>No se encontraron sucursales que coincidan con "{searchTerm}"</p>
                            <button 
                                className="clear-filter-btn"
                                onClick={() => setSearchTerm("")}
                            >
                                Limpiar filtro
                            </button>
                        </div>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default GestionarDescuentos;