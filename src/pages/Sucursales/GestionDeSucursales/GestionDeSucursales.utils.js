// GestionDeSucursales.utils.js

import { elminarSUcursalService } from "../../../services/sucursales/sucursales.service";

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

export const handleConfirmDeleteSucursal = (idSucursal, setSucursalToDelete, setIsPopupOpen) => {
    setSucursalToDelete(idSucursal);
  setIsPopupOpen(true);
};

export const handleDeleteSucursal = async (sucursalToDelete, setSucursales, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen) => {
  if (sucursalToDelete) {
    try {
      const resDelete = await elminarSUcursalService(sucursalToDelete);
      if (resDelete.status === 200) {

        setSucursales((prevSucursales) =>
            prevSucursales.filter((sucursal) => sucursal.idSucursal !== sucursalToDelete)
        );
        
        setIsPopupOpen(false);
      }
    } catch (error) {
      if (error.status === 409 && error.data.error.code === 402) {
        setIsPopupOpen(false);
        setErrorPopupMessage(`Para eliminar el rol debe eliminar los usuarios al que está relacionado`);
        setIsPopupErrorOpen(true);
      }
    }
  }
};