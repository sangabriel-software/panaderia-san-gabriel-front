import dayjs from "dayjs";
import { eliminarRectaService, ingresarRecetaService } from "../../services/recetasServices/recetas.service";

/* Funcion para abrir modal de ingreso de nueva receta */
export const handleAddReceta = (setShowAddModal) => {
  setShowAddModal(true);
};

/* Funcion para abrir modal de modificacion de recetas y de seteo de datos */
export const handleEditReceta = ( receta, setSelectedReceta, setShowEditModal, setEditValue ) => {
  setSelectedReceta(receta);
  setShowEditModal(true);
  // Prellenar los valores del formulario de edición
  setEditValue("nombreProducto", receta.nombreProducto);
  setEditValue("nombreIngrediente", receta.nombreIngrediente);
  setEditValue("cantidadNecesaria", receta.cantidadNecesaria);
};

/* Funcion para setar los valords id y nombre del producto */
export const getProductOptions = (productos) => {
  return productos.map((producto) => ({
    value: producto.idProducto,
    label: producto.nombreProducto,
  }));
};


/* Abrir popup de confirmacion de elminacion */
export const handleConfirmDeleteReceta = (idReceta, setRecetaToDelete, setIsPopupOpen) => {
    setRecetaToDelete(idReceta);
  setIsPopupOpen(true);
};

export const handleDeleteReceta = async (recetaToDelte, setRecetas, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setIsloaing) => {
  setIsloaing(true);
  if (recetaToDelte) {
    try {
      const resDelete = await eliminarRectaService(recetaToDelte);
        setRecetas((prevRecetas) =>
            prevRecetas.filter((receta) => receta.idProducto !== recetaToDelte)
        );

    } catch (error) {
        setIsPopupOpen(false);
        setErrorPopupMessage(`No se pudo realizar la elminacion. Intente mas tarde`);
        setIsPopupErrorOpen(true);

    }finally{
      setIsPopupOpen(false);
      setIsloaing(false);
    }
  }
};

// Función para manejar el envío del formulario de agregar receta
export const handleIngresarReceta = async ( data, selectedProduct, setEditingReceta, setShowAddModal, resetAdd, setRecetas,
                                       setSelectedProduct, setSearchableSelectError, setErrorMessage, setIsPopupOpenSuccess, setIsPopupErrorOpen,
                                       setErrorPopupMessage ) => {
  if (!selectedProduct) {
    setSearchableSelectError("Por favor, selecciona un producto.");
    return;
  }

  // Payload para ingreso de receta
  const newReceta = {
    idProducto: selectedProduct.value,
    detallesReceta: [
      {
        idIngrediente: 1,
        cantidadNecesaria: data.cantidadNecesaria,
        unidadMedida: data.unidadMedida,
        fechaCreacion: dayjs().format("YYYY-MM-DD"),
      },
    ],
  };

  try {
    const response = await ingresarRecetaService(newReceta);
    if (response.status === 201) {
      const recetaRetun = {
        idReceta: response.receta,
        idProducto: newReceta.idProducto,
        nombreProducto: selectedProduct.label,
        idIngrediente: newReceta.detallesReceta[0].idIngrediente,
        nombreIngrediente: data.nombreIngrediente,
        cantidadNecesaria: newReceta.detallesReceta[0].cantidadNecesaria,
        unidadMedida: "Lb",
      };
      setEditingReceta(false);
      setShowAddModal(false);
      resetAdd();
      setRecetas((prevRecetas) => [recetaRetun, ...prevRecetas]);
      setSelectedProduct(null);
      setSearchableSelectError("");
      setErrorMessage("");
      setIsPopupOpenSuccess(true);
    }
  } catch (error) {
    setErrorPopupMessage(
      "Hubo un error al ingresar la receta. Inténtelo de nuevo."
    );
    setIsPopupErrorOpen(true);
  }
};

// Función para manejar el envío del formulario de editar receta
export const handleModificarReceta = async ( data, selectedReceta, setRecetas, setEditingReceta, setShowEditModal, resetEdit,
                                        setErrorMessage, setIsPopupOpenSuccess, setIsPopupErrorOpen, setErrorPopupMessage ) => {
  const updatedReceta = {
    idProducto: selectedReceta.idProducto,
    detallesReceta: [
      {
        idIngrediente: selectedReceta.idIngrediente,
        cantidadNecesaria: data.cantidadNecesaria,
        unidadMedida: selectedReceta.unidadMedida,
        fechaCreacion: selectedReceta.fechaCreacion,
      },
    ],
  };

  try {
    const response = await actualizarRecetaService(updatedReceta);
    if (response) {
      const recetaRetun = {
        idReceta: selectedReceta.idReceta,
        idProducto: selectedReceta.idProducto,
        nombreProducto: selectedReceta.nombreProducto,
        idIngrediente: selectedReceta.idIngrediente,
        nombreIngrediente: selectedReceta.nombreIngrediente,
        cantidadNecesaria: data.cantidadNecesaria,
        unidadMedida: selectedReceta.unidadMedida,
      };

      const updatedRecetas = recetas.map((receta) =>
        receta.idReceta === selectedReceta.idReceta ? recetaRetun : receta
      );
      setIsPopupOpenSuccess(true);
      setRecetas(updatedRecetas);
      setEditingReceta(true);
      setShowEditModal(false);
      resetEdit();
      setErrorMessage("");
    }
  } catch (error) {
    setErrorPopupMessage(
      "Hubo un error al actualizar la información. Inténtelo de nuevo."
    );
    setIsPopupErrorOpen(true);
  }
};
