import { setLocalStorage } from "../../../utils/Auth/localstorage";
import {actualizarDatosUsuario, cambiarPassService } from "../../../services/userServices/usersservices/users.service";

export const guardarCambiosCredenciales = (key, data) => {
    try {
        setLocalStorage(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error al actualizar el localStorage:", error);
    }
  };

export const handleEdit = (field, setEditField, setIsEditing) => {
    setEditField(field);
    setIsEditing(true); 
};

export const handleSave = async (field, setEditField, setIsChanged) => {
    setEditField(null);
    setIsChanged(true);
};

// Función para manejar cambios en los campos del formulario
export const handleChange = (e, field, formData, setFormData, setIsChanged) => {
  const { value } = e.target;
  setFormData({
    ...formData,
    [field]: value,
  });
  setIsChanged(true);
};

// Función para validar que las contraseñas coincidan
export const validatePasswords = (formData, setPasswordError) => {
  if (formData.confirmarContrasena.trim() !== "") {
    if (formData.contrasena !== formData.confirmarContrasena) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  } else {
    setPasswordError("");
    return false;
  }
};

// Función para cambiar la contraseña
export const handleChangePassword = async ( formData, userData, setIsSaving, setChangePasswordError, setChangePasswordSuccess, setShowSuccess, setFormData, setPasswordError ) => {
  if (!validatePasswords(formData, setPasswordError)) {
    return;
  }

  setIsSaving(true);
  setChangePasswordError("");
  setChangePasswordSuccess("");

  try {
    const payload = {
      contrasena: formData.contrasena,
      usuario: userData.usuario,
    };

    const response = await cambiarPassService(payload);
    
    setChangePasswordSuccess("Contraseña cambiada exitosamente");
    setShowSuccess(true);

    setFormData({
      ...formData,
      contrasena: "",
      confirmarContrasena: "",
    });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    setChangePasswordError("Error al cambiar la contraseña. Inténtalo de nuevo.");
  } finally {
    setIsSaving(false);
    setTimeout(() => {
      setShowSuccess(false);
    }, 1650);
  }
};

// Función para guardar los datos personales
export const handleSavePersonalData = async ( formData, userData, setIsSaving, setShowSuccess, setIsChanged, ) => {
  setIsSaving(true);
  try {
    const payload = {
      nombreUsuario: formData.nombreUsuario,
      apellidoUsuario: formData.apellidoUsuario,
      correoUsuario: formData.correoUsuario,
      usuario: userData.usuario,
      idUsuario: formData.idUsuario,
    };

    const response = await actualizarDatosUsuario(payload);
    
    setShowSuccess(true);
    setIsChanged(false);
    guardarCambiosCredenciales("userData", { ...userData, ...payload });
  } catch (error) {
    console.error("Error al actualizar los datos:", error);
  } finally {
    setIsSaving(false);
    setTimeout(() => {
      setShowSuccess(false);
    }, 1650);
  }
};