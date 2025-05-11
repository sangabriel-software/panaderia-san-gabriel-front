const getEndpoints = {
    ALL_ROLES: "/consultarRoles",
    ALL_PERMISOS: "/consultarPermisos",
    ROL_PERMISOS: "/consultarRolesPermisosId",
    ALL_USERS: "/consultarUsuarios",
    ALL_PRODUCTOSYPRECIOS: "/consultarPrecios",
    CONSULTAR_CATEGORIAS: "/consultarcategorias",
    CONSULTAR_ORDENES_PRODUCCION: "/consultar-ordenes-produccion",
    CONSULTAR_DETALLES_ORDENES_PRODUCCION: "/consultar-detalle-ordenes-produccion",
    CONSULTAR_SUCURSALES: "/getSucursales",
    CONSULTAR_CONSUMO_INGREDIENTES: "/consultar-consumo-ingredientes",
    CONSULTAR_VENTAS_USUARIO: "/consultar-venta-por-usuario",
    CONSULTAR_ORDEN_POR_CRITERIOS: "consultar-detalle-por-criterios",
    CONSULTAR_DETALLE_VENTA: "consultar-detalle-venta",
    CONSULTAR_RECETAS: "consultar-recetas",
    STOCK_DEL_DIA: "consultar-stock-sucursal",
    STOCK_DE_PRODUCTOS_GENERALES: "consultar-stock-productos",
    CONSULTAR_ORDENES_ESPECIALES: "consultar-ordenes-especiales",
    CONSULTAR_ORDENES_ESPECIALES_POR_ID: "consultar-orden-especial-id",
    DESCUENTO_DE_STOCK: "consultar-descuento-stock-por-sucursal",
    DETALLE_DESCUENTOS: "consultar-detalle-descuento",
};

const postEndpoints = {
    INGRESAR_ROL: "/ingresarRol",
    INGRESAR_PERMISOSROLES: "/ingresarPermisosBatch",
    CREAR_USUARIO: "/crearUsuario",
    INICIAR_SESION: "/login",
    INGRESAR_PRODUCTO: "/ingresarProducto",
    INGRESAR_PRECIOPRODUCTO: "/ingresarPrecio",
    INGRESAR_IMAGEN_PRODUCTO: "/ingresar-img-producto",
    INGRESAR_CATEGORIA: "/ingresarcategoria",
    INGRESAR_ORDEN_PRODUCCION: "/ingresar-orden",
    INGRESAR_VENTA: "/ingresar-venta",
    INGRESAR_SUCURSAL: "/ingresarSucursal",
    INGRESAR_RECETA: "/ingresar-receta",
    INGRESAR_STOCK: "ingresar-stock-productos",
    INGRESAR_ORDEN_ESPECIAL: "/ingresar-orden-especial",
    DESCONTAR_STOCK: "descontar-stock",
};

const putEndpoints = {

    ACTUALIZAR_ROL: "/actualizarRol",
    DESBLOQUEAR_USAURIO: "/desbloquearUsuario",
    BLOQUEAR_USUARIO: "/bloquearUsuario",
    ACTUALIZAR_DATOS_USUARIO: "/actualizarUsuario",
    ACTUALIZAR_PRODUCTO: "/actualizarProducto",
    ACTUALIZAR_PRECIO: "/actualizarPrecio",
    ACTUALIZAR_SUCURSALES: "/actualizar-sucursal",
    ACTUALIZAR_RECETA: "/actualizar-receta",
    CAMBIAR_PASS: "/actualizar-pass",
    ACTUALIZAR_ORDEN_ESPECIAL: "/actualizar-orden-especial",
    ACTUALIZAR_USUARIO: "/actualizar-datos-usuario"
};

const deleteEndpoints = {
    ELIMINAR_ROL: "/eliminarRol",
    ELINAR_PERMISOS: "eliminarRolPermisosBatch",
    ELMINAR_USUARIOS: "eliminarUsuario",
    DESACTIVAR_PRODUCTOS: "desactivarProducto",
    ELIMINAR_ORDEN_PRODUCCION: "/eliminar-ordenes-produccion",
    ELMINAR_VENTA: "/eliminar-venta",
    ELMINAR_SUCURSAL: "/eliminarSucursal",
    ELIMINAR_RECETA: "elminar-receta",
    ELIMINAR_ORDEN_ESPECIAL: "eliminar-orden-especial",
    CANCELAR_DESCUENTO_STOCK: "cancelar-descuento-stock",
};

export { getEndpoints, postEndpoints, putEndpoints, deleteEndpoints};
export default getEndpoints; // Exportación por defecto

