import { useState, useMemo, useEffect } from "react";
import { Container, Table, Button, Form, Spinner, Dropdown, Alert } from "react-bootstrap";
import { BsArrowLeft, BsExclamationTriangleFill, BsTruck, BsGeoAlt, BsGeo, BsArrowRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import DotsMove from "../../../components/Spinners/DotsMove";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import { getInitials, getUniqueColor } from "../../../utils/utils";
import Title from "../../../components/Title/Title";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { getUserData } from "../../../utils/Auth/decodedata";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "./IngresarTraslado.styles.css";
import { consultarStockProductosDelDiaService, consultarStockProductosService } from "../../../services/stockservices/stock.service";
import { ingresarTrasladoService } from "../../../services/Traslados/traslados.service";

const IngresarTraslado = () => {
    const navigate = useNavigate();
    const { sucursales, loadingSucursales } = useGetSucursales();
    const [sucursalOrigen, setSucursalOrigen] = useState(null);
    const [sucursalDestino, setSucursalDestino] = useState(null);
    const [stockValues, setStockValues] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [categoriaActiva, setCategoriaActiva] = useState("Todas");
    const [searchTerm, setSearchTerm] = useState("");
    const [localStock, setLocalStock] = useState({ general: [], dia: [] });
    const [loadingStock, setLoadingStock] = useState(false);
    const userData = getUserData();

    /* Popups */
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
    const [errorPopupMessage, setErrorPopupMessage] = useState("");

    // Fetch stock data when sucursalOrigen changes
    useEffect(() => {
        const fetchStockData = async () => {
            if (!sucursalOrigen) return;

            setLoadingStock(true);
            try {
                const fechaDelDia = format(new Date(), "yyyy-MM-dd");

                const [stockGeneral, stockDia] = await Promise.all([
                    consultarStockProductosService(sucursalOrigen.idSucursal),
                    consultarStockProductosDelDiaService(sucursalOrigen.idSucursal, fechaDelDia)
                ]);

                setLocalStock({
                    general: stockGeneral?.stockProductos || [],
                    dia: stockDia?.stockDiario?.idStockDiario !== 0 ? [stockDia.stockDiario] : []
                });
            } catch (error) {
                console.error("Error fetching stock data:", error);
                setErrorPopupMessage("Error al cargar el stock de la sucursal");
                setIsPopupErrorOpen(true);
            } finally {
                setLoadingStock(false);
            }
        };

        fetchStockData();
    }, [sucursalOrigen]);

    const calcularStockMostrado = (producto) => {
        if (producto.nombreProducto === "Frances") {
            return producto.cantidadExistente / 6;
        }
        return producto.cantidadExistente;
    };

    const convertirValorAUnidades = (valor, esFrances) => {
        if (!esFrances) return Math.floor(valor);

        const partes = valor.toString().split('.');
        const filas = partes.length > 0 ? parseInt(partes[0]) : 0;
        const unidadesExtra = partes.length > 1 ? parseInt(partes[1].substring(0, 1)) : 0;

        return (filas * 6) + unidadesExtra;
    };

    const combinedStock = useMemo(() => {
        const productosDia = Array.isArray(localStock.dia)
            ? localStock.dia
                .filter(item => item?.idStockDiario && item.cantidadExistente > 0)
                .map(item => ({
                    ...item,
                    esStockDiario: true,
                    cantidadMostrada: calcularStockMostrado(item)
                }))
            : [];

        const productosGenerales = Array.isArray(localStock.general)
            ? localStock.general
                .filter(genItem => genItem.cantidadExistente > 0)
                .map(item => ({
                    ...item,
                    esStockDiario: false,
                    cantidadMostrada: calcularStockMostrado(item)
                }))
            : [];

        const combined = [...productosDia];
        const diaProductIds = new Set(productosDia.map(p => p.idProducto));

        for (const genProduct of productosGenerales) {
            if (!diaProductIds.has(genProduct.idProducto)) {
                combined.push(genProduct);
            }
        }

        return combined;
    }, [localStock]);

    const categorias = useMemo(() => {
        try {
            if (combinedStock.length === 0) return ['Todas'];

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

    const productosFiltrados = useMemo(() => {
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

        if (esFrances && value.includes('.') && value.split('.')[1]?.length > 1) {
            value = parseFloat(value).toFixed(1);
        }

        const nuevoValor = value === "" ? "" : parseFloat(value);

        if (!producto) return;

        const maxPermitido = producto.cantidadMostrada;

        if (nuevoValor > maxPermitido) {
            setErrorPopupMessage(`No puedes trasladar más de ${maxPermitido} ${esFrances ? "filas" : "unidades"} de ${producto.nombreProducto}`);
            setIsPopupErrorOpen(true);
            return;
        }

        setStockValues(prev => ({
            ...prev,
            [idProducto]: value
        }));
    };

    const actualizarStockLocal = (productosTrasladados) => {
        setLocalStock(prev => {
            const newStock = { ...prev };

            productosTrasladados.forEach(({ idProducto, stockATrasladar, esStockDiario }) => {
                if (esStockDiario) {
                    newStock.dia = newStock.dia.map(item =>
                        item.idProducto === idProducto
                            ? { ...item, cantidadExistente: item.cantidadExistente - stockATrasladar }
                            : item
                    );
                } else {
                    newStock.general = newStock.general.map(item =>
                        item.idProducto === idProducto
                            ? { ...item, cantidadExistente: item.cantidadExistente - stockATrasladar }
                            : item
                    );
                }
            });

            return newStock;
        });
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            if (!sucursalOrigen || !sucursalDestino) {
                setErrorPopupMessage("Debe seleccionar sucursal de origen y destino");
                setIsPopupErrorOpen(true);
                setIsLoading(false);
                return;
            }

            if (sucursalOrigen.idSucursal === sucursalDestino.idSucursal) {
                setErrorPopupMessage("No puedes trasladar a la misma sucursal");
                setIsPopupErrorOpen(true);
                setIsLoading(false);
                return;
            }

            const productosConStock = Object.entries(stockValues)
                .filter(([_, value]) => value > 0)
                .map(([idProducto, value]) => ({
                    idProducto: Number(idProducto),
                    value: value
                }));

            if (productosConStock.length === 0) {
                setErrorPopupMessage("Debe ingresar al menos un producto con cantidad a trasladar");
                setIsPopupErrorOpen(true);
                setIsLoading(false);
                return;
            }

            const productosCompletos = productosConStock.map(item => {
                const producto = combinedStock.find(p => p.idProducto === item.idProducto);
                const esFrances = producto.nombreProducto === "Frances";
                const cantidadATrasladar = convertirValorAUnidades(item.value, esFrances);

                return {
                    ...producto,
                    cantidadATrasladar: cantidadATrasladar
                };
            });

            const now = new Date();
            const fechaTraslado = format(now, "yyyy-MM-dd HH:mm:ss");

            const payload = {
                traladoHeader: {
                    idSucursalOrigen: sucursalOrigen.idSucursal,
                    idSucursalDestino: sucursalDestino.idSucursal,
                    idUsuario: userData.idUsuario,
                    fechaTraslado: fechaTraslado
                },
                trasladoDetalle: productosCompletos.map(producto => ({
                    idProducto: producto.idProducto,
                    tipoProduccion: producto.tipoProduccion || "bandejas",
                    controlarStock: producto.controlarStock ? 1 : 0,
                    controlarStockDiario: producto.esStockDiario ? 1 : 0,
                    cantidadATrasladar: producto.cantidadATrasladar,
                    fechaTraslado: fechaTraslado
                }))
            };

            const response = await ingresarTrasladoService(payload);

            if (response) {
                actualizarStockLocal(productosCompletos.map(p => ({
                    idProducto: p.idProducto,
                    stockATrasladar: p.cantidadATrasladar,
                    esStockDiario: p.esStockDiario
                })));

                setIsPopupOpen(true);
                setStockValues({});
            } else {
                throw new Error("No se recibió respuesta del servidor");
            }

        } catch (error) {
            console.error("Error al trasladar stock:", error);
            setErrorPopupMessage(
                error.response?.data?.message ||
                error.message ||
                "Ocurrió un error al trasladar el stock"
            );
            setIsPopupErrorOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (loadingSucursales || loadingStock) {
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
        <Container className="py-4">
            {/* Alerta de error */}
            {productosFiltrados?.length === 0 && sucursalOrigen && (
                <Alert variant="primary" className="text-center my-3">
                    <BsExclamationTriangleFill className="me-2" />
                    No hay productos disponibles para trasladar
                </Alert>
            )}
            <div className="text-center">
                <div className="row">
                    <div className="col-2">
                        <button
                            className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
                            style={{ width: "40px", height: "40px" }}
                            onClick={() => navigate("/traslados-productos")}
                        >
                            <BsArrowLeft size={20} />
                        </button>
                    </div>
                    <div className="col-8">
                        <Title
                            title={`Nuevo Traslado`}
                        />
                    </div>
                </div>
            </div>

            {/* Nuevo encabezado moderno */}
            <div className="traslado-header mb-4 p-4 rounded-4 shadow-sm">
                <p className="text-muted">
                    {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </p>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    {/* Título con icono */}
                    <div className="d-flex align-items-center gap-3">
                        <div className="header-icon">
                            <BsTruck />
                        </div>
                    </div>

                    {/* Selectores en fila para desktop */}
                    <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto">
                        {/* Sucursal Origen */}
                        <div className="flex-grow-1">
                            <div className="form-floating">
                                <Form.Select
                                    id="sucursalOrigen"
                                    value={sucursalOrigen?.idSucursal || ""}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedSucursal = sucursales.find(s => s.idSucursal === Number(selectedId));
                                        setSucursalOrigen(selectedSucursal);
                                        setSucursalDestino(null);
                                        setStockValues({});
                                    }}
                                    className="border-0 shadow-sm"
                                >
                                    <option value="">Seleccione origen</option>
                                    {sucursales.map(sucursal => (
                                        <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                                            {sucursal.nombreSucursal}
                                        </option>
                                    ))}
                                </Form.Select>
                                <label htmlFor="sucursalOrigen" className="d-flex align-items-center gap-2">
                                    <BsGeoAlt className="text-primary" />
                                    <span>Sucursal Origen</span>
                                </label>
                            </div>
                        </div>

                        {/* Flecha de traslado */}
                        <div className="d-none d-md-flex align-items-center justify-content-center px-2">
                            <div className="arrow-circle">
                                <BsArrowRight />
                            </div>
                        </div>

                        {/* Sucursal Destino */}
                        <div className="flex-grow-1">
                            <div className="form-floating">
                                <Form.Select
                                    id="sucursalDestino"
                                    value={sucursalDestino?.idSucursal || ""}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedSucursal = sucursales.find(s => s.idSucursal === Number(selectedId));
                                        setSucursalDestino(selectedSucursal);
                                    }}
                                    disabled={!sucursalOrigen}
                                    className="border-0 shadow-sm"
                                >
                                    <option value="">Seleccione destino</option>
                                    {sucursales
                                        .filter(s => s.idSucursal !== sucursalOrigen?.idSucursal)
                                        .map(sucursal => (
                                            <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                                                {sucursal.nombreSucursal}
                                            </option>
                                        ))}
                                </Form.Select>
                                <label htmlFor="sucursalDestino" className="d-flex align-items-center gap-2">
                                    <BsGeo className="text-info" />
                                    <span>Sucursal Destino</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicador de estado */}
                {sucursalOrigen && (
                    <div className="mt-3 d-flex align-items-center gap-2">
                        <div className="status-indicator"></div>
                        <small className="text-muted">
                            Listo para seleccionar productos de <strong>{sucursalOrigen.nombreSucursal}</strong>
                        </small>
                    </div>
                )}
            </div>

            {/* Filtros */}
            {sucursalOrigen && (
                <>
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

                    {/* Tabla de productos */}
                    <div className="table-responsive excel-table-container mb-4">
                        <Table striped bordered hover className="excel-table">
                            <thead>
                                <tr>
                                    <th className="dark-header text-center" style={{ width: "50%" }}>
                                        Producto
                                    </th>
                                    <th className="dark-header text-center" style={{ width: "20%" }}>
                                        Stock Actual
                                    </th>
                                    <th className="dark-header text-center" style={{ width: "30%" }}>
                                        Cantidad a Trasladar
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
                                                <td className="text-center align-middle" style={{ fontWeight: "bold" }}>
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
                                            {sucursalOrigen ? "No hay productos disponibles en esta categoría" : "Seleccione una sucursal de origen"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Botón de guardar */}
                    {sucursalDestino && (
                        <div className="text-center">
                            <Button
                                className="btn-descontar-stock"
                                variant="primary"
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
                                    "Trasladar Stock"
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Popups */}
            <SuccessPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                title="¡Éxito!"
                message="Se trasladó el stock correctamente"
                nombreBotonVolver="Ver Traslados"
                nombreBotonNuevo="Nuevo Traslado"
                onView={() => navigate("/traslados-productos")}
                onNew={() => {
                    setIsPopupOpen(false);
                    setStockValues({});
                }}
            />

            <ErrorPopup
                isOpen={isPopupErrorOpen}
                onClose={() => setIsPopupErrorOpen(false)}
                title="¡Error!"
                message={errorPopupMessage}
            />
        </Container>
    );
};

export default IngresarTraslado;