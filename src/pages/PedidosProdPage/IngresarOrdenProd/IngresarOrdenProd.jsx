import { useState } from "react";
import { Container, Form, Row, Col, Button, Card, InputGroup } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import { useGetSucursales } from "../../../hooks/sucursales/useGetSucursales";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const IngresarOrdenProd = () => {
  const { sucursales } = useGetSucursales();
  const { productos } = useGetProductosYPrecios();

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
    watch
  } = useForm({
    defaultValues: {
      sucursal: "",
      turno: "AM",
      fechaAProducir: tomorrow,
      nombrePanadero: ""
    }
  });

  // Para leer el valor actual del turno y aplicar estilos en los botones
  const turnoValue = watch("turno");

  const [activeCategory, setActiveCategory] = useState("Panadería");
  const [trayQuantities, setTrayQuantities] = useState({});

  // Filtrar productos por categoría
  const panaderiaProducts = productos.filter(p => p.nombreCategoria === "Panadería");
  const reposteriaProducts = productos.filter(p => p.nombreCategoria === "Repostería");

  // Función que se ejecuta al enviar el formulario (encabezado)
  const onSubmit = async (data) => {
    // Generar detalle de la orden a partir de los inputs de productos
    const detalleOrden = Object.entries(trayQuantities)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([idProducto, cantidad]) => ({
        idProducto: Number(idProducto),
        cantidadBandejas: cantidad,
        fechaCreacion: new Date().toISOString()
      }));

    const payload = {
      encabezadoOrden: {
        idSucursal: Number(data.sucursal),
        ordenTurno: data.turno,
        nombrePanadero: data.nombrePanadero,
        fechaAProducir: new Date(data.fechaAProducir).toISOString().split("T")[0],
        idUsuario: 1, // Se asume que el usuario está logueado
        fechaCreacion: new Date().toISOString().split("T")[0]
      },
      detalleOrden
    };

    try {
      const response = await fetch("http://localhost:3000/api/ingresar-orden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      // Aquí se puede manejar la respuesta (éxito, error, etc.)
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-primary">🍞 Nueva Orden de Producción</h2>
      
      {/* Encabezado en Card */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              {/* Sucursal */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Sucursal</Form.Label>
                  <Form.Select
                    {...register("sucursal", { required: "Seleccione sucursal" })}
                  >
                    <option value="">Seleccione sucursal</option>
                    {sucursales.map((s) => (
                      <option key={s.idSucursal} value={s.idSucursal}>
                        {s.nombreSucursal}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.sucursal && (
                    <span className="text-danger">{errors.sucursal.message}</span>
                  )}
                </Form.Group>
              </Col>

              {/* Turno */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Turno</Form.Label>
                  <InputGroup>
                    <Button
                      variant={turnoValue === "AM" ? "primary" : "outline-primary"}
                      onClick={() => setValue("turno", "AM")}
                      type="button"
                    >
                      AM
                    </Button>
                    <Button
                      variant={turnoValue === "PM" ? "primary" : "outline-primary"}
                      onClick={() => setValue("turno", "PM")}
                      type="button"
                    >
                      PM
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Fecha de Producción */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fecha de Producción</Form.Label>
                  <Controller
                    control={control}
                    name="fechaAProducir"
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        className="form-control"
                        minDate={tomorrow}
                        dateFormat="yyyy-MM-dd"
                      />
                    )}
                  />
                </Form.Group>
              </Col>

              {/* Nombre del Panadero */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Nombre del Panadero</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. María Pérez"
                    {...register("nombrePanadero", { required: "El nombre del panadero es requerido" })}
                  />
                  {errors.nombrePanadero && (
                    <span className="text-danger">{errors.nombrePanadero.message}</span>
                  )}
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
          variant={activeCategory === "Panadería" ? "primary" : "outline-primary"}
          onClick={() => setActiveCategory("Panadería")}
        >
          Panadería ({panaderiaProducts.length})
        </Button>
        <Button
          variant={activeCategory === "Repostería" ? "primary" : "outline-primary"}
          onClick={() => setActiveCategory("Repostería")}
        >
          Repostería ({reposteriaProducts.length})
        </Button>
      </div>

      {/* Listado de Productos con estilo (según la segunda imagen) */}
      <Row className="g-3">
        {(activeCategory === "Panadería" ? panaderiaProducts : reposteriaProducts).map((producto) => (
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
                      [producto.idProducto]: parseInt(e.target.value) || 0
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
