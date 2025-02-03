import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsArrowLeft } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { useNavigate } from "react-router";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import ImageUploader from "../../../components/ImagenUploager/ImagenUploadre";
import { compressImage } from "../../../utils/CompressImage/CompressImage";
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import { crearPayloadPrecioProducto, crearPayloadProducto, crearPayloadProductoImagen } from "./IngresarProductosUtils";
import { ingresarPrecioProducto, ingresarProducto, ingresarProductoImagen } from "../../../services/productos/productos.service";

function IngresarProductos() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { register, handleSubmit, formState: { errors }, } = useForm({ defaultValues: { idCategoria: "" } });
  const { categorias, loadingCategorias } = useGetCategorias();

  const handleImageChange = (file, imageUrl) => {
    setSelectedImage(file);
    setImagePreview(imageUrl);
  };

  const onSubmit = async (data) => {
    try {
      let resIngresoProducto;
      let imageBase64 = null;
      if (selectedImage) {
        imageBase64 = await compressImage(selectedImage, 20);
      }

      const paylodProducto = crearPayloadProducto(data);
      resIngresoProducto = await ingresarProducto(paylodProducto);

      if(resIngresoProducto.status === 201){
        const payloadPrecio = crearPayloadPrecioProducto(data, resIngresoProducto.idProducto);
        const resIngresoPrecio = await ingresarPrecioProducto(payloadPrecio);

        if(resIngresoPrecio.status === 201 && selectedImage){
          const payloadImagen = crearPayloadProductoImagen(resIngresoProducto.idProducto, imageBase64)
          const resImagenProducto = await ingresarProductoImagen(payloadImagen);
        }
      }
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
            <Title title="Productos" description="Ingreso de productos existentes" />
          </div>
        </div>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)} className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <Form.Group className="mb-3">
            <Form.Label className="label-title">Nombre del Producto</Form.Label>
            <Form.Control
              className="input-data"
              type="text"
              placeholder="Ingrese el nombre del producto"
              {...register("nombreProducto", { required: "El nombre del producto es obligatorio." })}
              isInvalid={!!errors.nombreProducto}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombreProducto?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="label-title">Categoría del Producto</Form.Label>
            {loadingCategorias ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Cargando categorías...</span>
              </div>
            ) : (
              <Form.Select
                {...register("idCategoria", { required: "Debe seleccionar una categoría." })}
                className={`input-data ${errors.idCategoria ? "is-invalid" : ""}`}
              >
                <option value="">Selecciona una categoría...</option>
                {categorias.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nombreCategoria}
                  </option>
                ))}
              </Form.Select>
            )}
            {errors.idCategoria && <div className="text-danger">{errors.idCategoria.message}</div>}
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
                    min: { value: 1, message: "La cantidad debe ser mayor a 0." }
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
                    min: { value: 0.01, message: "El precio debe ser mayor a 0." }
                  })}
                  isInvalid={!!errors.precio}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.precio?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* <Form.Group className="mb-3">
            <Form.Label className="label-title">Vencimiento del Precio (Opcional)</Form.Label>
            <Form.Control
              className="input-data"
              type="date"
              {...register("fechaFin")}
            />
          </Form.Group> */}

          <ImageUploader onImageChange={handleImageChange} imagePreview={imagePreview} labelName={"Imagen del producto"} />

          <div className="text-center">
            <button type="submit" className="btn bt-general">Ingresar Producto</button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default IngresarProductos;
