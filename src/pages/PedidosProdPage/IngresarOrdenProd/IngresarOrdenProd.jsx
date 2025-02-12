import { useState } from "react";
import {
  Container,
  Form,
  Row,
  Col,
  Button,
  Card,
  InputGroup,
} from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import { useGetSucursales } from "../../../hooks/sucursales/useGetSucursales";
import DatePicker from "react-datepicker";
import { BsArrowLeft, BsExclamationTriangleFill } from "react-icons/bs";
import { useNavigate } from "react-router";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import "./ordenes.css";
import Title from "../../../components/Title/Title";
import {
  getInitials,
  getUniqueColor,
  handleIngresarOrdenProduccionSubmit,
} from "./IngresarOrdenProdUtils";
import Alert from "../../../components/Alerts/Alert";

const IngresarOrdenProd = () => {
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const { productos, loadigProducts, showErrorProductos, showInfoProductos, setProductos } = useGetProductosYPrecios();
  const navigate = useNavigate();
  const tomorrow = dayjs().add(1, "day").toDate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      sucursal: "",
      turno: "AM",
      fechaAProducir: tomorrow,
      nombrePanadero: "",
    },
  });

  // Para leer el valor actual del turno y aplicar estilos en los botones
  const turnoValue = watch("turno");

  const [activeCategory, setActiveCategory] = useState("Panadería");
  const [trayQuantities, setTrayQuantities] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar productos por categoría
  const panaderiaProducts = productos.filter(
    (p) => p.nombreCategoria === "Panadería"
  );
  const reposteriaProducts = productos.filter(
    (p) => p.nombreCategoria === "Repostería"
  );

  const onSubmit = async (data) => {
    await handleIngresarOrdenProduccionSubmit( data, trayQuantities, setTrayQuantities, setIsPopupOpen,  setErrorPopupMessage,
                                              setIsPopupErrorOpen, setIsLoading, reset);
  };

  return (
    <Container className="py-4">
      {/* titulo */}
      <div className="text-center">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/ordenes-produccion")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title title="🍞 Nueva Orden de Producción" />
          </div>
        </div>
      </div>
      {errorPopupMessage && !isPopupErrorOpen && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message={errorPopupMessage}
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}
      {/* Encabezado en Card */}
      <Card
        className="shadow-lg border-0 mb-4 bg-gradient-primary"
        style={{ borderRadius: "15px" }}
      >
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              {/* Fecha de Producción - Mejorado para móviles */}
              <Col
                xs={12}
                md={4}
                xl={4}
                className="border-end border-light mb-3 mb-md-0"
              >
                <Form.Group>
                  <label className="form-label text-muted small mb-1">
                    FECHA DE PRODUCCIÓN
                  </label>
                  <InputGroup>
                    <Controller
                      control={control}
                      name="fechaAProducir"
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          selected={field.value}
                          onChange={field.onChange}
                          className="form-control border-primary w-100 mobile-datepicker"
                          minDate={tomorrow}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Seleccionar fecha"
                          showPopperArrow={false}
                          popperPlacement="auto"
                          popperModifiers={[
                            {
                              name: "preventOverflow",
                              options: {
                                altBoundary: true,
                                tether: false,
                              },
                            },
                          ]}
                          withPortal
                          isClearable
                          calendarClassName="mobile-calendar"
                        />
                      )}
                    />
                    <InputGroup.Text className="bg-white border-primary">
                      📅
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} md={2} className="border-end border-light my-2">
                <Form.Group>
                  <label className="form-label text-muted small mb-1">
                    TURNO
                  </label>
                  <InputGroup className="w-100">
                    <Button
                      className="w-50"
                      variant={
                        turnoValue === "AM" ? "primary" : "outline-primary"
                      }
                      onClick={() => setValue("turno", "AM")}
                      type="button"
                    >
                      AM
                    </Button>
                    <Button
                      className="w-50"
                      variant={
                        turnoValue === "PM" ? "primary" : "outline-primary"
                      }
                      onClick={() => setValue("turno", "PM")}
                      type="button"
                    >
                      PM
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} md={1} className="border-end border-light">
                {/* espacio */}
              </Col>
              <Col xs={12} md={4} className="border-end border-light my-2">
                <Form.Group>
                  <label className="form-label text-muted small mb-1">
                    SUCURSAL
                  </label>
                  {loadingSucursales ? (
                    <div className="d-flex justify-content-center my-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Cargando Sucursales...
                        </span>
                      </div>
                    </div>
                  ) : sucursales.length === 0 ? (
                    <div className="alert alert-danger" role="alert">
                      {showErrorSucursales === true
                        ? "Error al cargar las sucursales"
                        : "No hay sucursales disponibles"}
                    </div>
                  ) : (
                    <>
                      <Form.Select
                        {...register("sucursal", {
                          required: "Seleccione sucursal",
                        })}
                        className="border-primary"
                      >
                        <option value="">Seleccione sucursal</option>
                        {sucursales.map((s) => (
                          <option key={s.idSucursal} value={s.idSucursal}>
                            {s.nombreSucursal}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.sucursal && (
                        <span className="text-danger">
                          {errors.sucursal.message}
                        </span>
                      )}
                    </>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mt-3">
              {/* Nombre del Panadero */}
              <Col xs={12} md={4} className="border-end-md border-light">
                <Form.Group>
                  <label className="form-label text-muted small mb-1">
                    NOMBRE DEL PANADERO
                  </label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Ingresar nombre"
                      {...register("nombrePanadero", {
                        required: "El nombre del panadero es requerido",
                      })}
                      className="border-primary"
                    />
                  </InputGroup>
                  {errors.nombrePanadero && (
                    <span className="text-danger">
                      {errors.nombrePanadero.message}
                    </span>
                  )}
                </Form.Group>
              </Col>

              <Col xs={12} md={2} className="d-none d-md-block"></Col>

              {/* Nombre del usuario */}
              <Col xs={12} md={6} className="text-center text-md-start">
                <Form.Group>
                  <label className="form-label text-muted small mb-1">
                    USUARIO
                  </label>
                  <span className="badge bg-success ms-2">admin</span>
                </Form.Group>
              </Col>
            </Row>
            <div className="text-center mt-4">
              <Button
                variant="success"
                size="lg"
                type="submit"
                disabled={isLoading || loadingSucursales || loadigProducts || showErrorSucursales || showErrorProductos}
              >
                {isLoading ? "Guardando..." : "🚀 Guardar Orden de Producción"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      {/* Listado de Productos con estilo (según la segunda imagen) */}
      {loadigProducts ? (
        <div className="d-flex justify-content-center  my-5">
          <div className="spinner-border text-primary my-5 my-5" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Selector de Categorías */}
          <div className="d-flex gap-2 mb-4" id="category-selection">
            <Button
              variant={
                activeCategory === "Panadería" ? "primary" : "outline-primary"
              }
              onClick={() => setActiveCategory("Panadería")}
            >
              Panadería ({panaderiaProducts.length})
            </Button>
            <Button
              variant={
                activeCategory === "Repostería" ? "primary" : "outline-primary"
              }
              onClick={() => setActiveCategory("Repostería")}
            >
              Repostería ({reposteriaProducts.length})
            </Button>
          </div>

          <Row className="g-3">
            {(activeCategory === "Panadería"
              ? panaderiaProducts
              : reposteriaProducts
            ).map((producto) => (
              <Col key={producto.idProducto} xs={12} md={6} lg={4}>
                <Card className="h-100 shadow border-0 product-card text-center p-3">
                  <Card.Body className="d-flex flex-column align-items-center position-relative">
                    <div
                      className="position-absolute top-0 start-0 m-2 text-white rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: 30,
                        height: 30,
                        backgroundColor: getUniqueColor(
                          producto.nombreProducto
                        ),
                      }}
                    >
                      {getInitials(producto.nombreProducto)}
                    </div>
                    <Card.Title className="product-title fw-bold">
                      {producto.nombreProducto}
                    </Card.Title>
                    <span className="text-muted">
                      {producto.nombreCategoria === "Panadería"
                        ? "Cantidad en Bandejas"
                        : "Unidades"}
                    </span>
                    <InputGroup className="mt-2 w-75">
                      <Form.Control
                        type="number"
                        min="0"
                        value={trayQuantities[producto.idProducto] || ""}
                        onChange={(e) =>
                          setTrayQuantities({
                            ...trayQuantities,
                            [producto.idProducto]:
                              parseInt(e.target.value) || 0,
                          })
                        }
                        className="text-center border-primary"
                      />
                    </InputGroup>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Floating button for mobile devices */}
      <Button
        variant="primary"
        className="d-md-none position-fixed bottom-0 end-0 m-3 rounded-circle"
        style={{ width: "50px", height: "50px", zIndex: 1000 }}
        onClick={() => window.scrollTo({ top: 240, behavior: "smooth" })}
      >
        ↑
      </Button>

      {/* Alertar errore y data no encontrada */}
      {showErrorSucursales && !showInfoProductos && (
        <div className="row justify-content-center my-3">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar los productos. Intenta más tarde..."
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}
    </Container>
  );
};

export default IngresarOrdenProd;
