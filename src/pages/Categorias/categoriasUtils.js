import { ingresarCategoriaService } from "../../services/categorias/categorias.service";
import { currentDate } from "../../utils/dateUtils";

export const crearPayloadCategoria = (data) => {
    
    const categoria = {
        ...data,
        fechaCreacion: currentDate()
    }

    return categoria;
}

export const categoriaRespuesta = (data, idCategoria) => {
    
    const categoria = {
        idCategoria,
        nombreCategoria: data.nombreCategoria,
        descripcionCategoria: data.descripcionCategoria,
        estado:'A'
    }

    return categoria;
}

  // Función para guardar la nueva categoría usando los datos del formulario del modal
export const saveCategory = async (data, setIsCategorySaving, resetCategory, setShowCategoryModal, setShowErrorCategorySave, categorias ) => {

    setIsCategorySaving(true);

    try {
      const categoria = crearPayloadCategoria(data)
      const response = await ingresarCategoriaService(categoria);
      const categoriaNueva = categoriaRespuesta(data, response.categoriaId);
      if(response.status === 201){

        categorias.push(categoriaNueva)
        resetCategory()
        setShowCategoryModal(false);
        setShowErrorCategorySave(false);

      }
    } catch (error) {
      setShowErrorCategorySave(true);
    } finally {
      setIsCategorySaving(false);
    }
  };