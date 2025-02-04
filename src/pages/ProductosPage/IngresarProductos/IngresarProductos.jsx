import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { BsArrowLeft } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { useNavigate } from "react-router";
import { Form, Row, Col, Spinner } from "react-bootstrap";
import ImageUploader from "../../../components/ImagenUploager/ImagenUploadre";
import { compressImage } from "../../../utils/CompressImage/CompressImage";
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import { crearPayloadPrecioProducto, crearPayloadProducto, crearPayloadProductoImagen, resetForm, } from "./IngresarProductosUtils"; // Importa las funciones de utilidad
import { ingresarPrecioProducto, ingresarProducto, ingresarProductoImagen,} from "../../../services/productos/productos.service";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";

function IngresarProductos() {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Abrir popup de éxito
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false); // Abrir popup de error
  const [errorPopupMessage, setErrorPopupMessage] = useState(""); // Mensaje de error
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null); // Estado para la imagen seleccionada
  const [imagePreview, setImagePreview] = useState(null); // Estado para la vista previa de la imagen
  const { register, handleSubmit, reset, formState: { errors }, } = useForm({ defaultValues: { idCategoria: "" } }); 
  const { categorias, loadingCategorias } = useGetCategorias();
  const [ isResetImageInput, setIsResetImageInput ] = useState(false);

  // Maneja el cambio de ima gen
  const handleImageChange = (file, imageUrl) => {
    setSelectedImage(file);
    setImagePreview(imageUrl);
  };

  // Función para enviar el formulario
  const onSubmit = async (data) => {
    try {
      let resIngresoProducto;
      let imageBase64 = null;

      // Comprime la imagen si está seleccionada
      if (selectedImage) {
        imageBase64 = await compressImage(selectedImage, 20);
      }

      // Crea el payload del producto y lo envía
      const payloadProducto = crearPayloadProducto(data);
      resIngresoProducto = await ingresarProducto(payloadProducto);

      if (resIngresoProducto.status === 201) {
        // Crea el payload del precio y lo envía
        const payloadPrecio = crearPayloadPrecioProducto(data, resIngresoProducto.idProducto);
        const resIngresoPrecio = await ingresarPrecioProducto(payloadPrecio);

        // Si hay imagen, la envía
        if (resIngresoPrecio.status === 201 && selectedImage) {
          const payloadImagen = crearPayloadProductoImagen(resIngresoProducto.idProducto, imageBase64);
          await ingresarProductoImagen(payloadImagen);
        }

        // Muestra el popup de éxito y limpia el formulario
        setIsPopupOpen(true);
        resetForm(reset, setSelectedImage, setImagePreview, setIsResetImageInput);
      }
    } catch (error) {
      console.log(error)
      if(error.status === 409){
        setErrorPopupMessage("Ya existe un producto con el nombre ingresado.");
        setIsPopupErrorOpen(true);
        return
      }
      setErrorPopupMessage("Hubo un error al ingresar el producto. Inténtelo de nuevo.");
      setIsPopupErrorOpen(true);
      return
    }
  };

  return (
    <div className="container justify-content-center">
      {/* Título del formulario */}
      <div className="text-center mb-3">
        <div className="row">
          <div className="col-2">
            {/* Botón de volver */}
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

      {/* Formulario */}
      <Form onSubmit={handleSubmit(onSubmit)} className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          {/* Nombre del producto */}
          <Form.Group className="mb-3">
            <Form.Label className="label-title">Nombre del Producto</Form.Label>
            <Form.Control
              id="nombreProducto"
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

          {/* Categoría del producto */}
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

          {/* Cantidad y precio */}
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
                    min: { value: 1, message: "La cantidad debe ser mayor a 0." },
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
                    min: { value: 0.01, message: "El precio debe ser mayor a 0." },
                  })}
                  isInvalid={!!errors.precio}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.precio?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Subida de imagen */}
          <ImageUploader
            onImageChange={handleImageChange}
            imagePreview={imagePreview}
            labelName={"Imagen del producto"}
            isReset={isResetImageInput}
          />

          {/* Botón de enviar */}
          <div className="text-center">
            <button type="submit" className="btn bt-general">
              Ingresar Producto
            </button>
          </div>
        </div>
      </Form>

      {/*---------------------------PopUp de confirmacion y errores-----------------------------------------
      --------------------------------------------------------------------------------------------------- */ }

      {/* Popup de éxito */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="¡Éxito!"
        message="El producto ha sido creado con éxito."
        nombreBotonVolver="Ver Productos"
        nombreBotonNuevo="Ingresar Producto"
        onViewRoles={() => navigate("/productos")}
        onNewRole={() => {
          setIsPopupOpen(false);
          resetForm(reset, setSelectedImage, setImagePreview, setIsResetImageInput);
        }}
      />

      {/* Popup de error */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </div>
  );
}

export default IngresarProductos;