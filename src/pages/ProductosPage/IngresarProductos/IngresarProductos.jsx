import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { BsArrowLeft } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { useNavigate } from "react-router";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";

function IngresarProductos() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCategorias([
        { value: 1, label: "Panadería" },
        { value: 2, label: "Bebidas" },
        { value: 3, label: "Lácteos" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleImageChange = (event) => {
    setImageLoading(true); // 🔥 Activar el spinner antes de cargar la imagen

    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        setSelectedImage(file);
        setImagePreview(imageUrl);
        setImageLoading(false); // 🔥 Desactivar el spinner solo cuando la imagen termine de cargar
      };

      img.src = imageUrl;
    } else {
      setImageLoading(false);
    }
  };

  const onSubmit = (data) => {
    console.log("Datos del producto:", data);
  };

  return (
    <div className="container justify-content-center">
      <div className="text-center mb-3">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/productos")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title
              title="Productos"
              description="Ingreso de productos existentes"
            />
          </div>
        </div>
      </div>

      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="row justify-content-center"
      >
        <div className="col-lg-6 col-md-8 col-sm-10">
          <Form.Group className="mb-3">
            <Form.Label className="label-title">Nombre del Producto</Form.Label>
            <Form.Control
              className="input-data"
              type="text"
              placeholder="Ingrese el nombre del producto"
              {...register("nombreProducto", {
                required: "El nombre del producto es obligatorio.",
              })}
              isInvalid={!!errors.nombreProducto}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombreProducto?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="label-title">
              Categoría del Producto
            </Form.Label>
            <Select
              className="input-data"
              options={categorias}
              isLoading={loading}
              placeholder="Seleccione una categoría"
              onChange={(selectedOption) =>
                setValue("idCategoria", selectedOption.value)
              }
            />
            {errors.idCategoria && (
              <div className="text-danger">{errors.idCategoria.message}</div>
            )}
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="label-title">Cantidad</Form.Label>
                <Form.Control
                  className="input-data"
                  type="number"
                  placeholder="Ingrese la cantidad"
                  {...register("cantidad", {
                    required: "La cantidad es obligatoria.",
                    min: {
                      value: 1,
                      message: "La cantidad debe ser mayor a 0.",
                    },
                  })}
                  isInvalid={!!errors.cantidad}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cantidad?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="label-title">Precio</Form.Label>
                <Form.Control
                  className="input-data"
                  type="number"
                  placeholder="Ingrese el precio"
                  step="0.01"
                  {...register("precio", {
                    required: "El precio es obligatorio.",
                    min: {
                      value: 0.01,
                      message: "El precio debe ser mayor a 0.",
                    },
                  })}
                  isInvalid={!!errors.precio}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.precio?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Imagen del producto */}
          <Form.Group className="mb-3">
            <Form.Label className="label-title">Imagen del Producto</Form.Label>
            <div className="position-relative d-flex justify-content-center w-100">
              <input type="file" accept="image/*" className="d-none" id="imagen" onChange={handleImageChange} />
              <div
                className="input-data flex-grow-1 position-relative"
                style={{
                  height: "45px",
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ced4da",
                  borderRadius: "5px",
                  backgroundColor: "#fff",
                  minWidth: "320px",
                  overflow: "hidden",
                  paddingLeft: "130px",
                  textOverflow: "ellipsis",
                }}
              >
                <label
                  htmlFor="imagen"
                  className={`btn ${selectedImage ? "btn-success" : "btn-primary"} mb-0 position-absolute`}
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    left: "0",
                    width: "120px",
                    borderRadius: "5px 0 0 5px",
                    fontSize: "14px",
                  }}
                >
                  {imageLoading ? <Spinner animation="border" size="sm" /> : "Cargar"}
                </label>
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {imageLoading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Cargando...
                    </>
                  ) : selectedImage ? (
                    selectedImage.name
                  ) : (
                    "Seleccionar archivo"
                  )}
                </span>
              </div>
            </div>

            {imagePreview && (
              <div className="d-flex justify-content-center mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="img-fluid rounded shadow"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>
            )}
          </Form.Group>

          <div className="text-center">
            <Button type="submit" variant="primary">
              Crear Producto
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default IngresarProductos;
