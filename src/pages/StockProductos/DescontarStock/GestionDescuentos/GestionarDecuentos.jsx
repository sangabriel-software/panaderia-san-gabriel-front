import { useState } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { FaBoxes, FaStore, FaBuilding, FaMapMarkerAlt, FaMinusCircle, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useGetSucursales from "../../../../hooks/sucursales/useGetSucursales";
import DotsMove from "../../../../components/Spinners/DotsMove";
import "./GestionarDecuentos.styles.css";
import { handleNavigateToDescuentos } from "./GestionarDescuento.utils";
import { getUserData } from "../../../../utils/Auth/decodedata";

const GestionarDescuentos = () => {
    const { sucursales, loadingSucursales } = useGetSucursales();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const usuario = getUserData();

    // Filtrar sucursales según el rol del usuario
    const sucursalesFiltradasPorRol = usuario.idRol === 1 
        ? sucursales 
        : sucursales.filter(suc => suc.idSucursal === usuario.idSucursal);

    // Aplicar filtro de búsqueda sobre las sucursales ya filtradas por rol
    const filteredSucursales = sucursalesFiltradasPorRol.filter(sucursal =>
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
                    <FaStore className="me-2" /> 
                    {usuario.idRol === 1 
                        ? "Seleccione una sucursal para descontar productos" 
                        : "Tu sucursal asignada"}
                </p>
                
                {/* Filtro de búsqueda - Solo visible para admin */}
                {usuario.idRol === 1 && (
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
                                    Mostrando {filteredSucursales.length} de {sucursalesFiltradasPorRol.length} sucursales
                                </span>
                            )}
                        </div>
                    </div>
                )}
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
                                onClick={() => handleNavigateToDescuentos(navigate, sucursal.idSucursal)}
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
                            <p>
                                {usuario.idRol === 1
                                    ? `No se encontraron sucursales que coincidan con "${searchTerm}"`
                                    : "No tienes una sucursal asignada"}
                            </p>
                            {usuario.idRol === 1 && searchTerm && (
                                <button 
                                    className="clear-filter-btn"
                                    onClick={() => setSearchTerm("")}
                                >
                                    Limpiar filtro
                                </button>
                            )}
                        </div>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default GestionarDescuentos;