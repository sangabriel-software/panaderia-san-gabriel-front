// GestionDeSucursales.utils.js

import dayjs from "dayjs";
import { actualizarSucursalService, elminarSUcursalService, ingresarSucursalService } from "../../../services/sucursales/sucursales.service";

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

export const handleDeleteSucursal = async (sucursalToDelete, setSucursales, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setIsloaing) => {
  setIsloaing(true);
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
        setIsPopupOpen(false);
        setErrorPopupMessage(`No se pudo realizar la elminacion. Intente mas tarde`);
        setIsPopupErrorOpen(true);

    }finally{
      setIsloaing(false);
    }
  }
};

export const handleIngresarSucursalSubmit = async (data, setIsSaving, editingSucursal, setSucursales, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setShowModal, reset  ) => {
  
  try {
    setIsSaving(true); // Activar el estado de carga

    // Agregar la fecha actual al payload
    const fechaActual = dayjs().format('YYYY-MM-DD'); // Formato de fecha: Año-Mes-Día
    const payload = { ...data, fechaCreacion: fechaActual, departamentoSucursal: "" };

    if (editingSucursal) {
        // Lógica para editar la sucursal
        const actualizacionPayload = { ...payload, idSucursal: editingSucursal.idSucursal };

        const updatedSucursal = await actualizarSucursalService({ ...payload, idSucursal: editingSucursal.idSucursal });
        if(updatedSucursal.status === 200) {
          setShowModal(false);
          setIsPopupOpen(true);
          reset();
        // Actualizar la lista de sucursales
        setSucursales((prevSucursales) =>
          prevSucursales.map((sucursal) =>
              sucursal.idSucursal === actualizacionPayload.idSucursal ? actualizacionPayload : sucursal
          )
      );
        }
    } else {
        // Lógica para agregar una nueva sucursal
        const nuevaSucursal = await ingresarSucursalService(payload);
        if(nuevaSucursal.status === 201) {
          setShowModal(false);
          setSucursales((prevSucursales) => [...prevSucursales, nuevaSucursal.sucursal]); // Agregar la nueva sucursal al estado
          reset()
          setIsPopupOpen(true);
        }
    }
} catch (error) {
    setShowModal(false);
    editingSucursal ? 
    setErrorPopupMessage("Hubo un error al actualizar la informacion. Inténtelo de nuevo.") :
    setErrorPopupMessage("Hubo un error al ingresar la sucursal. Inténtelo de nuevo.") ;
    setIsPopupErrorOpen(true);
} finally {
    setIsSaving(false); // Desactivar el estado de carga
}
}