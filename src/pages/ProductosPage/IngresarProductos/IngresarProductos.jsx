import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { BsArrowLeft } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { useNavigate } from "react-router";
import { Form, Button, Row, Col } from "react-bootstrap";
import ImageUploader from "../../../components/ImagenUploager/ImagenUploadre";
import { compressImage } from "../../../utils/CompressImage/CompressImage";

function IngresarProductos() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm();

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

  const handleImageChange = (file, imageUrl) => {
    setSelectedImage(file);
    setImagePreview(imageUrl);
  };

  const onSubmit = async (data) => {
    try {
      let imageBase64 = null;
      if (selectedImage) {
        imageBase64 = await compressImage(selectedImage, 20);
      }

      const productoData = {
        nombre: data.nombreProducto,
        categoriaId: data.idCategoria,
        cantidad: data.cantidad,
        precio: data.precio,
        imagen: imageBase64,
      };
      console.log(productoData);
    } catch (error) {
      console.error("Error al procesar la imagen o enviar los datos:", error);
    }
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
              value={categorias.find(cat => cat.value === Number(watch("idCategoria")))} // Convertir a número si es necesario
              onChange={(selectedOption) => {
                setValue(
                  "idCategoria",
                  selectedOption ? selectedOption.value : null
                );
                trigger("idCategoria");
              }}
            />
            <input
              type="hidden"
              {...register("idCategoria", {
                required: "Debe seleccionar una categoría.",
              })}
            />
            {errors.idCategoria && (
              <div className="text-danger">{errors.idCategoria.message}</div>
            )}
          </Form.Group>

          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="label-title">Cantidad</Form.Label>
                <Form.Control
                  className="input-data truncate-placeholder"
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
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="label-title">Precio</Form.Label>
                <Form.Control
                  className="input-data truncate-placeholder"
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

          <ImageUploader
            onImageChange={handleImageChange}
            imagePreview={imagePreview}
            labelName={"Imagen del producto"}
          />

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
