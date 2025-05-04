import { useState, useMemo, useEffect } from "react";
import { Container, Table, Button, Form, Spinner, Dropdown } from "react-bootstrap";
import { BsArrowLeft, BsExclamationTriangleFill, BsFillInfoCircleFill } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import DotsMove from "../../../../components/Spinners/DotsMove";
import SuccessPopup from "../../../../components/Popup/SuccessPopup";
import ErrorPopup from "../../../../components/Popup/ErrorPopUp";
import { getInitials, getUniqueColor } from "../../../../utils/utils";
import Alert from "../../../../components/Alerts/Alert";
import Title from "../../../../components/Title/Title";
import useGetSucursales from "../../../../hooks/sucursales/useGetSucursales";
import { decryptId } from "../../../../utils/CryptoParams";
import "./DescontarStock.style.css";
import { descontarStockService } from "../../../../services/descuentoDeStock/descuentoDeStock.service";
import { getUserData } from "../../../../utils/Auth/decodedata";
import useGetStockGeneral from "../../../../hooks/stock/useGetStockGeneral";
import useGetStockDelDia from "../../../../hooks/stock/useGetStockDelDia";

const DescontarStock = () => {
  const { idSucursal } = useParams();
  const navigate = useNavigate();
  const { stockGeneral: initialStockGeneral, loadingStockGeneral, setStockGeneral } = useGetStockGeneral(idSucursal);
  const { stockDelDia: initialStockDelDia, loadingStockDiario, setStockDelDia } = useGetStockDelDia(idSucursal);
  const { sucursales, loadingSucursales } = useGetSucursales();
  const [stockValues, setStockValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState("MAYOREO");
  const [localStock, setLocalStock] = useState({ general: [], dia: [] });
  const userData = getUserData();

  /* Popups */
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  // Actualizar el estado local cuando cambian los datos iniciales
  useEffect(() => {
    setLocalStock({
      general: initialStockGeneral || [],
      dia: initialStockDelDia || []
    });
  }, [initialStockGeneral, initialStockDelDia]);

  const decryptedIdSucursal = decryptId(decodeURIComponent(idSucursal));
  const sucursal = sucursales?.find(item => 
    Number(item.idSucursal) === Number(decryptedIdSucursal)
  );

  // Función para calcular el stock mostrado (dividir por 6 si es Frances)
  const calcularStockMostrado = (producto) => {
    if (producto.nombreProducto === "Frances") {
      return producto.cantidadExistente / 6;
    }
    return producto.cantidadExistente;
  };

  // Función para convertir valor ingresado a unidades (especial para Frances)
  const convertirValorAUnidades = (valor, esFrances) => {
    if (!esFrances) return Math.floor(valor);
    
    // Separar parte entera y decimal
    const partes = valor.toString().split('.');
    const filas = partes.length > 0 ? parseInt(partes[0]) : 0;
    const unidadesExtra = partes.length > 1 ? parseInt(partes[1].substring(0, 1)) : 0; // Solo primer decimal
    
    return (filas * 6) + unidadesExtra;
  };

  // Combinación de stocks similar a StockUnificado con filtro de stock > 0
  const combinedStock = useMemo(() => {
    // Si ambos están vacíos, retornar array vacío
    if ((!localStock.dia || localStock.dia.length === 0) && (!localStock.general || localStock.general.length === 0)) return [];
    
    // Obtener productos del día (filtrados y marcados)
    const productosDia = Array.isArray(localStock.dia) 
      ? localStock.dia
          .filter(item => item?.idStockDiario !== 0 && item.cantidadExistente > 0)
          .map(item => ({ 
            ...item, 
            esStockDiario: true,
            cantidadMostrada: calcularStockMostrado(item)
          }))
      : [];
    
    // Obtener productos generales (filtrados y marcados)
    const productosGenerales = Array.isArray(localStock.general) 
      ? localStock.general
          .filter(genItem => 
            genItem.cantidadExistente > 0 && 
            !productosDia.some(diaItem => diaItem.idProducto === genItem.idProducto)
          )
          .map(item => ({ 
            ...item, 
            esStockDiario: false,
            cantidadMostrada: calcularStockMostrado(item)
          }))
      : [];
    
    // Combinar dando prioridad a los productos del día
    return [...productosDia, ...productosGenerales];
  }, [localStock]);

  // Obtención de categorías
  const categorias = useMemo(() => {
    try {
      if (!Array.isArray(combinedStock) || combinedStock.length === 0) return ['Todas'];
      
      const categoriasUnicas = [...new Set(
        combinedStock
          .map(item => item?.nombreCategoria)
          .filter(cat => cat && typeof cat === 'string')
      )];
      return ['Todas', ...categoriasUnicas];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return ['Todas'];
    }
  }, [combinedStock]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    if (!Array.isArray(combinedStock)) return [];
    
    return combinedStock.filter((producto) => {
      const matchesSearch = producto?.nombreProducto?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
      const matchesCategory = categoriaActiva === "Todas" || producto?.nombreCategoria === categoriaActiva;
      return matchesSearch && matchesCategory;
    });
  }, [combinedStock, searchTerm, categoriaActiva]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleStockChange = (idProducto, value) => {
    const producto = combinedStock.find(p => p.idProducto === Number(idProducto));
    const esFrances = producto?.nombreProducto === "Frances";
    
    // Validar formato para Frances (no más de un decimal)
    if (esFrances && value.includes('.') && value.split('.')[1]?.length > 1) {
      value = parseFloat(value).toFixed(1);
    }
    
    const nuevoValor = value === "" ? "" : parseFloat(value);
    
    if (!producto) return;
    
    // Calcular el máximo permitido basado en el stock mostrado
    const maxPermitido = producto.cantidadMostrada;
    
    if (nuevoValor > maxPermitido) {
      setErrorPopupMessage(`No puedes descontar más de ${maxPermitido} ${esFrances ? "filas" : "unidades"} de ${producto.nombreProducto}`);
      setIsPopupErrorOpen(true);
      return;
    }
    
    setStockValues(prev => ({
      ...prev,
      [idProducto]: value // Guardamos el string para mantener el formato
    }));
  };

  // Función para actualizar el stock local después de un descuento
  const actualizarStockLocal = (productosDescontados) => {
    setLocalStock(prev => {
      const newStock = { ...prev };
      
      productosDescontados.forEach(({ idProducto, stockADescontar, esStockDiario }) => {
        if (esStockDiario) {
          newStock.dia = newStock.dia.map(item => 
            item.idProducto === idProducto 
              ? { ...item, cantidadExistente: item.cantidadExistente - stockADescontar }
              : item
          );
        } else {
          newStock.general = newStock.general.map(item => 
            item.idProducto === idProducto 
              ? { ...item, cantidadExistente: item.cantidadExistente - stockADescontar }
              : item
          );
        }
      });
      
      return newStock;
    });
  };

  /* Descontar Stock */
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Validar que al menos un producto tenga cantidad para descontar
      const productosConStock = Object.entries(stockValues)
        .filter(([_, value]) => value > 0)
        .map(([idProducto, value]) => ({
          idProducto: Number(idProducto),
          value: value
        }));

      if (productosConStock.length === 0) {
        setErrorPopupMessage("Debe ingresar al menos un producto con cantidad a descontar");
        setIsPopupErrorOpen(true);
        setIsLoading(false);
        return;
      }

      // Obtener los productos completos para el payload
      const productosCompletos = productosConStock.map(item => {
        const producto = combinedStock.find(p => p.idProducto === item.idProducto);
        const esFrances = producto.nombreProducto === "Frances";
        
        // Convertir el valor ingresado a unidades
        const stockADescontar = convertirValorAUnidades(item.value, esFrances);
        
        return {
          ...producto,
          stockADescontar: stockADescontar
        };
      });

      const now = new Date();
      const fechaDescuento = format(now, "yyyy-MM-dd HH:mm:ss");
      const fechaCreacion = format(now, "yyyy-MM-dd");

      // Construir el payload según lo que espera el backend
      const payload = {
        descuentoInfo: {
          idSucursal: decryptedIdSucursal,
          idUsuario: userData.idUsuario,
          tipoDescuento: tipoDescuento,
          fechaDescuento: fechaDescuento,
          fechaCreacion: fechaCreacion
        },
        detalleDescuento: productosCompletos.map(producto => ({
          idProducto: producto.idProducto,
          tipoProduccion: producto.tipoProduccion,
          controlarStock: producto.controlarStock ? 1 : 0,
          controlarStockDiario: producto.esStockDiario ? 1 : 0,
          stockADescontar: producto.stockADescontar,
          fechaDescuento: fechaDescuento
        }))
      };

      // Llamada al servicio para descontar stock
      const response = await descontarStockService(payload);

      // Verificar si la respuesta fue exitosa
      if (response) {
        // Actualizar el stock local antes de mostrar el popup
        actualizarStockLocal(productosCompletos.map(p => ({
          idProducto: p.idProducto,
          stockADescontar: p.stockADescontar,
          esStockDiario: p.esStockDiario
        })));

        setIsPopupOpen(true);
        setStockValues({});
        
        // Refrescar datos del servidor en segundo plano
      } else {
        throw new Error("No se recibió respuesta del servidor");
      }
      
    } catch (error) {
      console.error("Error al descontar stock:", error);
      setErrorPopupMessage(
        error.response?.data?.message || 
        error.message || 
        "Ocurrió un error al descontar el stock"
      );
      setIsPopupErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStockGeneral || loadingStockDiario || loadingSucursales) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <DotsMove />
      </Container>
    );
  }

  return (
    <Container className="">
      {/* Alerta de error */}
      {productosFiltrados?.length === 0 && (
        <div className="row justify-content-center my-2">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="No hay productos disponibles para descontar"
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="text-center">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate(`/descuento-stock/stock-descuentos-lista/${encodeURIComponent(idSucursal)}`)}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title
              title={`Descontar Stock - ${sucursal?.nombreSucursal}`}
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4 my-3">
        <div className="flex-grow-1">
          <h6 className="mb-3">Buscar producto:</h6>
          <div className="position-relative">
            <Form.Control
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="btn btn-clear-search position-absolute end-0 top-50 translate-middle-y"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <div>
          <h6 className="mb-3">Filtrar por categoría:</h6>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-categorias">
              {categoriaActiva === "Todas"
                ? "Todas las categorías"
                : categoriaActiva}
            </Dropdown.Toggle>
            <Dropdown.Menu className="category-dropdown-menu">
              <Dropdown.Item
                active={categoriaActiva === "Todas"}
                onClick={() => setCategoriaActiva("Todas")}
              >
                Todas
              </Dropdown.Item>
              {categorias.map((categoria) => (
                <Dropdown.Item
                  className="category-dropdown-item"
                  key={categoria}
                  active={categoriaActiva === categoria}
                  onClick={() => setCategoriaActiva(categoria)}
                >
                  {categoria}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Selector de tipo de descuento */}
      <div className="ros">
        <div className="col-md-3">
        <div className="mb-4">
        <h6 className="mb-3">Tipo de descuento:</h6>
        <Form.Select
          value={tipoDescuento}
          onChange={(e) => setTipoDescuento(e.target.value)}
          className="mb-3"
        >
          <option value="MAYOREO">Venta por mayoreo</option>
          <option value="MAL ESTADO">Perdida</option>
          <option value="CORRECCION">Correccion de stock</option>
        </Form.Select>
      </div>

        </div>
      </div>

      {/* Tabla de productos */}
      <div className="table-responsive excel-table-container mb-4">
        <Table striped bordered hover className="excel-table">
          <thead>
            <tr>
              <th className="dark-header text-center" style={{ width: "50%" }}>
                Producto
              </th>
              <th className="dark-header text-center" style={{ width: "20%"}}>
                Stock Actual
              </th>
              <th className="dark-header text-center" style={{ width: "30%" }}>
                Cantidad a Descontar
              </th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados?.length > 0 ? (
              productosFiltrados.map((producto) => {
                const esFrances = producto.nombreProducto === "Frances";
                return (
                  <tr key={`${producto.idProducto}-${producto.esStockDiario ? 'dia' : 'gen'}`}>
                    <td>
                      <div className="product-info">
                        <div
                          className="product-badge-stock"
                          style={{
                            backgroundColor: getUniqueColor(
                              producto.nombreProducto
                            ),
                          }}
                        >
                          {getInitials(producto.nombreProducto)}
                        </div>
                        <span className="product-name">
                          {producto.nombreProducto}
                        </span>
                      </div>
                    </td>
                    <td className="text-center align-middle" style={{ fontWeight: "bold"}}>
                      {esFrances ? 
                        `${Math.floor(producto.cantidadMostrada)}.${Math.round((producto.cantidadMostrada % 1) * 6)}` : 
                        producto.cantidadExistente}
                    </td>
                    <td className="text-center align-middle">
                      <Form.Control
                        type="number"
                        min="0"
                        max={producto.cantidadMostrada}
                        step={esFrances ? "0.1" : "any"}
                        value={stockValues[producto.idProducto] || ""}
                        onChange={(e) =>
                          handleStockChange(producto.idProducto, e.target.value)
                        }
                        className="quantity-input"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No hay productos disponibles en esta categoría
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Botón de guardar */}
      <div className="text-center">
        <Button
          className="btn-descontar-stock"
          variant="danger"
          size="lg"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            Object.values(stockValues).every(
              (val) => val === null || isNaN(val) || val <= 0
            )
          }
        >
          {isLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Descontar Stock"
          )}
        </Button>
      </div>

      {/* Popup de Éxito */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="¡Éxito!"
        message="Se descontó el stock de los productos correctamente"
        nombreBotonVolver="Ver Gestiones"
        nombreBotonNuevo="Descontar nuevo"
        onView={() => navigate(`/descuento-stock/stock-descuentos-lista/${encodeURIComponent(idSucursal)}`)}
        onNew={() => {
          setIsPopupOpen(false);
          setStockValues({});
        }}
      />

      {/* Popup errores */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </Container>
  );
};

export default DescontarStock;