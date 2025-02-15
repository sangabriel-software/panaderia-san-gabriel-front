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
    INGRESAR_ORDEN_PRODUCCION: "/ingresar-orden"
};

const putEndpoints = {
    ACTUALIZAR_ROL: "/actualizarRol",
    DESBLOQUEAR_USAURIO: "/desbloquearUsuario",
    BLOQUEAR_USUARIO: "/bloquearUsuario",
    ACTUALIZAR_PRODUCTO: "/actualizarProducto",
    ACTUALIZAR_PRECIO: "/actualizarPrecio"
};

const deleteEndpoints = {
    ELIMINAR_ROL: "/eliminarRol",
    ELINAR_PERMISOS: "eliminarRolPermisosBatch",
    ELMINAR_USUARIOS: "eliminarUsuario",
    DESACTIVAR_PRODUCTOS: "desactivarProducto",
    ELIMINAR_ORDEN_PRODUCCION: "/eliminar-ordenes-produccion"
};


export { getEndpoints, postEndpoints, putEndpoints, deleteEndpoints};
export default getEndpoints; // Exportación por defecto

