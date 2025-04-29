import { Container, Row, Col, Card } from "react-bootstrap";
import { FaBoxes, FaStore, FaBuilding, FaMapMarkerAlt, FaMinusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useGetSucursales from "../../../../hooks/sucursales/useGetSucursales";
import DotsMove from "../../../../components/Spinners/DotsMove";
import "./GestionarDecuentos.styles.css";

const GestionarDescuentos = () => {
    const { sucursales, loadingSucursales } = useGetSucursales();
    const navigate = useNavigate();

    const handleNavigateToDescuentos = (idSucursal) => {
        navigate(`/descontar-productos/${idSucursal}`);
    };

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
                    <FaBoxes className="me-3" /> Descuento  de Descuentos
                </h1>
                <p className="gestionar-descuentos-subtitle">
                    <FaStore className="me-2" /> Seleccione una sucursal para descontar productos
                </p>
            </div>
            
            <Row className="gestionar-descuentos-row">
                {sucursales.map((sucursal) => (
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
                ))}
            </Row>
        </Container>
    );
};

export default GestionarDescuentos;