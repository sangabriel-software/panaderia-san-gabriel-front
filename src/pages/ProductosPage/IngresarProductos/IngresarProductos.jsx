import { React, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsArrowLeft, BsPlus } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { useNavigate } from "react-router";
import { Form, Row, Col, Spinner, Button } from "react-bootstrap";
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import {
  handleIngresarProductoSubmit,
  resetForm,
} from "./IngresarProductosUtils";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import ModalIngreso from "../../../components/ModalGenerico/Modal";
import { saveCategory } from "../../Categorias/categoriasUtils";
import "./ingresarProductosStyle.css";

function IngresarProductos() {
  //variables logica productos
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { errors }, setValue } = useForm({ defaultValues: { dCategoria: "", controlStock: 0, stockDiario: 0, tipoProduccion: "bandejas", unidadesPorBandeja: "" } });

  // variables logica categorias
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [showErrorCategorySave, setShowErrorCategorySave] = useState(false);
  const { categorias, loadingCategorias } = useGetCategorias();
  const { register: registerCategory, handleSubmit: handleSubmitCategory, formState: { errors: errorsCategory }, reset: resetCategory, } = useForm({ defaultValues: { nombreCategoria: "", descripcionCategoria: "" }, });

  // Observar el valor del campo idCategoria
  const selectedCategory = watch("idCategoria");
  const tipoProduccion = watch("tipoProduccion");
  const controlStock = watch("controlStock") === 1;
  const stockDiario = watch("stockDiario") === 1;
  
  // Determinar si la categoría seleccionada es Panadería
  const [isPanaderia, setIsPanaderia] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      const categoriaSeleccionada = categorias?.find(
        (cat) => cat.idCategoria == selectedCategory
      );
      const esPanaderia = categoriaSeleccionada?.nombreCategoria === "Panaderia";
      setIsPanaderia(esPanaderia);
      
      // Resetear valores específicos de panadería cuando se cambia de categoría
      if (!esPanaderia) {
        setValue('controlStock', 0);
        setValue('stockDiario', 0);
        setValue('tipoProduccion', 'bandejas');
        setValue('unidadesPorBandeja', '');
      }
    }
  }, [selectedCategory, categorias, setValue]);

  // Efecto para manejar la exclusividad de los switches
  useEffect(() => {
    if (controlStock && stockDiario) {
      setValue('stockDiario', 0);
    }
  }, [controlStock, setValue]);

  useEffect(() => {
    if (stockDiario && controlStock) {
      setValue('controlStock', 0);
    }
  }, [stockDiario, setValue]);

  const onSubmit = async (data) => { 
    await handleIngresarProductoSubmit( data, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setIsLoading, reset 
    ); 
  };

  const onSubmitCategory = async (data) => {  
    await saveCategory( data, setIsCategorySaving, resetCategory, setShowCategoryModal, setShowErrorCategorySave, categorias );
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
          {/* Categoría del producto */}
          <Form.Group className="mb-3">
            <Form.Label className="label-title">
              Categoría del Producto
            </Form.Label>
            {loadingCategorias ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Cargando categorías...</span>
              </div>
            ) : (
              <div className="d-flex">
                <Form.Select
                  {...register("idCategoria", {
                    required: "Debe seleccionar una categoría.",
                  })}
                  className={`input-data ${
                    errors.idCategoria ? "is-invalid" : ""
                  }`}
                  disabled={isLoading}
                  style={{ flex: 11, marginRight: "0.5rem" }}
                >
                  <option value="">Selecciona una categoría...</option>
                  {categorias.map((categoria) => (
                    <option
                      key={categoria.idCategoria}
                      value={categoria.idCategoria}
                    >
                      {categoria.nombreCategoria}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  variant="success"
                  style={{ flex: 0, height: 43 }}
                  disabled={isLoading}
                  onClick={() => setShowCategoryModal(true)}
                >
                  <BsPlus size={20} />
                </Button>
              </div>
            )}
            {errors.idCategoria && (
              <div className="text-danger">{errors.idCategoria.message}</div>
            )}
          </Form.Group>

          {/* Nombre del producto */}
          <Form.Group className="mb-3">
            <Form.Label className="label-title">Nombre del Producto</Form.Label>
            <div className="position-relative">
              <Form.Control
                id="nombreProducto"
                className="input-data"
                type="text"
                placeholder="Ingrese el nombre del producto"
                {...register("nombreProducto", {
                  required: "El nombre del producto es obligatorio.",
                })}
                isInvalid={!!errors.nombreProducto}
                disabled={isLoading}
              />

              <Form.Control.Feedback type="invalid">
                {errors.nombreProducto?.message}
              </Form.Control.Feedback>
            </div>
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
                    min: {
                      value: 1,
                      message: "La cantidad debe ser mayor a 0.",
                    },
                  })}
                  isInvalid={!!errors.cantidad}
                  disabled={isLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cantidad?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="label-title">Precio Q.</Form.Label>
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
                  disabled={isLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.precio?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Sección específica para Panadería */}
          {isPanaderia && (
            <>
              <div className="mb-3">
                <h6 className="label-title">Configuración para Producción y Stock</h6>
              </div>

              {/* Controles de stock en una fila */}
              <Row className="mb-3">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="label-title">Control de Stock</Form.Label>
                    <div className="d-flex align-items-center">
                      <span className="me-2">No</span>
                      <Form.Check
                        type="switch"
                        id="controlStock"
                        checked={controlStock}
                        onChange={(e) => setValue("controlStock", e.target.checked ? 1 : 0)}
                        disabled={isLoading || stockDiario}
                      />
                      <span className="ms-2">Sí</span>
                    </div>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="label-title">Control de Stock Diario</Form.Label>
                    <div className="d-flex align-items-center">
                      <span className="me-2">No</span>
                      <Form.Check
                        type="switch"
                        id="stockDiario"
                        checked={stockDiario}
                        onChange={(e) => setValue("stockDiario", e.target.checked ? 1 : 0)}
                        disabled={isLoading || controlStock}
                      />
                      <span className="ms-2">Sí</span>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Selector de tipo de producción */}
              <Form.Group className="mb-3">
                <Form.Label className="label-title">Tipo de Producción</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Check
                    type="radio"
                    id="bandejas"
                    label="Bandejas"
                    value="bandejas"
                    checked={tipoProduccion === "bandejas"}
                    onChange={() => setValue("tipoProduccion", "bandejas")}
                    disabled={isLoading}
                    className="me-3 tipoProd"
                  />
                  <Form.Check
                    className="tipoProd"
                    type="radio"
                    id="harina"
                    label="Harina"
                    value="harina"
                    checked={tipoProduccion === "harina"}
                    onChange={() => setValue("tipoProduccion", "harina")}
                    disabled={isLoading}
                  />
                </div>
              </Form.Group>

              {/* Input solo para producción por bandejas */}
              {tipoProduccion === "bandejas" && (
                <Form.Group className="mb-3">
                  <Form.Label className="label-title">Unidades por Bandeja</Form.Label>
                  <Form.Control
                    className="input-data"
                    type="number"
                    placeholder="Ingrese las unidades por bandeja"
                    {...register("unidadesPorBandeja", {
                      required: "Las unidades por bandeja son obligatorias para producción por bandejas.",
                      min: {
                        value: 1,
                        message: "Las unidades por bandeja deben ser mayor a 0.",
                      },
                    })}
                    isInvalid={!!errors.unidadesPorBandeja}
                    disabled={isLoading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.unidadesPorBandeja?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              )}
            </>
          )}

          {/* Botón de enviar */}
          <div className="text-center">
            <button
              type="submit"
              className="btn bt-general"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Procesando...
                </>
              ) : (
                "Ingresar Producto"
              )}
            </button>
          </div>
        </div>
      </Form>

      {/* Modal para ingreso de categorías */}
      <ModalIngreso
        show={showCategoryModal}
        onHide={() => {
          setShowCategoryModal(false);
          resetCategory();
        }}
        title="Agregar Nueva Categoría"
        onConfirm={handleSubmitCategory(onSubmitCategory)}
        isLoading={isCategorySaving}
        isError={showErrorCategorySave}
        confirmText="Guardar"
      >
        <Form>
          <Form.Group className="mb-3" controlId="categoriaNombre">
            <Form.Label className="label-title">
              Nombre de la Categoría
            </Form.Label>
            <Form.Control
              className="input-data"
              type="text"
              placeholder="Ingrese el nombre de la categoría"
              {...registerCategory("nombreCategoria", {
                required: "El nombre de la categoría es obligatorio.",
              })}
              disabled={isCategorySaving}
            />
            {errorsCategory.nombreCategoria && (
              <div className="text-danger">
                {errorsCategory.nombreCategoria.message}
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="categoriaDescripcion">
            <Form.Label className="label-title">Descripción</Form.Label>
            <Form.Control
              className="input-data"
              as="textarea"
              rows={3}
              placeholder="Ingrese la descripción de la categoría"
              {...registerCategory("descripcionCategoria")}
              disabled={isCategorySaving}
            />
          </Form.Group>
        </Form>
      </ModalIngreso>

      {/* Popups */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="¡Éxito!"
        message="El producto ha sido creado con éxito."
        nombreBotonVolver="Ver Productos"
        nombreBotonNuevo="Ingresar Producto"
        onView={() => navigate("/productos")}
        onNew={() => {
          setIsPopupOpen(false);
          resetForm(
            reset,
            setSelectedImage,
            setImagePreview,
            setIsResetImageInput
          );
        }}
      />

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