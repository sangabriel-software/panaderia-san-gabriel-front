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
import "react-datepicker/dist/react-datepicker.css";
import "./ordenes.css";
import Title from "../../../components/Title/Title";
import { BsArrowLeft } from "react-icons/bs";
import { useNavigate } from "react-router";

const IngresarOrdenProd = () => {
  const { sucursales } = useGetSucursales();
  const { productos } = useGetProductosYPrecios();
  const navigate = useNavigate();

  // Calcular mañana para el minDate del DatePicker
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
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

  // Filtrar productos por categoría
  const panaderiaProducts = productos.filter(
    (p) => p.nombreCategoria === "Panadería"
  );
  const reposteriaProducts = productos.filter(
    (p) => p.nombreCategoria === "Repostería"
  );

  // Función que se ejecuta al enviar el formulario (encabezado)
  const onSubmit = async (data) => {
    console.log("Data:", data);
    // Generar detalle de la orden a partir de los inputs de productos
    const detalleOrden = Object.entries(trayQuantities)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([idProducto, cantidad]) => ({
        idProducto: Number(idProducto),
        cantidadBandejas: cantidad,
        fechaCreacion: new Date().toISOString(),
      }));

    const payload = {
      encabezadoOrden: {
        idSucursal: Number(data.sucursal),
        ordenTurno: data.turno,
        nombrePanadero: data.nombrePanadero,
        fechaAProducir: new Date(data.fechaAProducir)
          .toISOString()
          .split("T")[0],
        idUsuario: 1, // Se asume que el usuario está logueado
        fechaCreacion: new Date().toISOString().split("T")[0],
      },
      detalleOrden,
    };

    console.log(payload);
    try {
      const response = await fetch("http://localhost:3000/api/ingresar-orden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Aquí se puede manejar la respuesta (éxito, error, etc.)
    } catch (error) {
      console.error("Error:", error);
    }
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

      {/* Encabezado en Card */}
      <Card
        className="shadow-lg border-0 mb-4 bg-gradient-primary"
        style={{ borderRadius: "15px" }}
      >
        <Card.Body>
          <Form onSumit={handleSubmit(onSubmit)}>
            <Row>
{/* Fecha de Producción - Mejorado para móviles */}
<Col xs={12} md={4} xl={4} className="border-end border-light mb-3 mb-md-0">
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
                        name: 'preventOverflow',
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
                  <Form.Control
                    type="text"
                    placeholder="Ej. María Pérez"
                    {...register("nombrePanadero", {
                      required: "El nombre del panadero es requerido",
                    })}
                    className="border-primary"
                  />
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
              <Button variant="success" size="lg" type="submit">
                🚀 Guardar Orden de Producción
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Selector de Categorías */}
      <div className="d-flex gap-2 mb-4">
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

      {/* Listado de Productos con estilo (según la segunda imagen) */}
      <Row className="g-3">
        {(activeCategory === "Panadería"
          ? panaderiaProducts
          : reposteriaProducts
        ).map((producto) => (
          <Col key={producto.idProducto} xs={12} md={6} lg={4}>
            <Card
              className="h-100 shadow border-0"
              style={{ borderRadius: "10px" }}
            >
              <Card.Body className="d-flex flex-column">
                <Card.Title>{producto.nombreProducto}</Card.Title>
                <Card.Text className="text-muted mb-2">
                  Precio por bandeja: Q{producto.precioPorUnidad}
                </Card.Text>
                <Form.Control
                  type="number"
                  min="0"
                  value={trayQuantities[producto.idProducto] || ""}
                  onChange={(e) =>
                    setTrayQuantities({
                      ...trayQuantities,
                      [producto.idProducto]: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="N° de bandejas"
                  className="mt-auto"
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default IngresarOrdenProd;
