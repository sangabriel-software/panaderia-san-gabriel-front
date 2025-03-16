// GestionDeSucursales.utils.js

export const handleShowModal = (sucursal, setEditingSucursal, setValue, reset, setShowModal) => {
    if (sucursal) {
        // Si se está editando, setear los valores en el formulario
        setEditingSucursal(sucursal);
        setValue("nombreSucursal", sucursal.nombreSucursal);
        setValue("direccionSucursal", sucursal.direccionSucursal);
        setValue("municipioSucursal", sucursal.municipioSucursal);
        setValue("telefonoSucursal", sucursal.telefonoSucursal);
        setValue("correoSucursal", sucursal.correoSucursal);
    } else {
        // Si se está agregando, resetear el formulario
        setEditingSucursal(null);
        reset();
    }
    setShowModal(true);
};