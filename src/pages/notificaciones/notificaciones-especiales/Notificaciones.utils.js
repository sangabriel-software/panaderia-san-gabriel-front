// src/utils/notificaciones/notificacionesEspeciales.utils.js

export const TIPO_EVENTO_ORDEN_ESPECIAL = "orden_especial";

export const FILTROS = {
  TODOS: "todos",
  ACTIVOS: "activos",
  INACTIVOS: "inactivos",
};

export const getInitials = (nombre, apellido) =>
  ((nombre?.[0] ?? "") + (apellido?.[0] ?? "")).toUpperCase();

// Normaliza texto para búsquedas (sin tildes, minúsculas)
const normalizarTexto = (texto = "") =>
  texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const isActivo = (usuario) => usuario?.activo === 1;

export const contarActivos = (usuarios = []) =>
  usuarios.filter(isActivo).length;

// activo === null en original significa que nunca se insertó; para comparar se trata como 0.
// Así, si el usuario activa y vuelve a desactivar, no cuenta como cambio (evita un INSERT innecesario).
export const getCambios = (usuarios = [], originales = []) =>
  usuarios.filter((u) => {
    const original = originales.find((o) => o.idUsuario === u.idUsuario);
    return (original?.activo ?? 0) !== (u.activo ?? 0);
  });

export const isUsuarioCambiado = (usuario, originales = []) => {
  const original = originales.find((o) => o.idUsuario === usuario.idUsuario);
  return (original?.activo ?? 0) !== (usuario.activo ?? 0);
};

export const separarCambios = (cambios = [], originales = []) => {
  // activo === null en original → nunca se insertó → INSERT
  const aInsertar = cambios.filter((u) => {
    const original = originales.find((o) => o.idUsuario === u.idUsuario);
    return original?.activo === null;
  });

  // activo !== null en original → ya existe registro → UPDATE
  const aActualizar = cambios.filter((u) => {
    const original = originales.find((o) => o.idUsuario === u.idUsuario);
    return original?.activo !== null;
  });

  return { aInsertar, aActualizar };
};

export const buildPayloadInsertar = (usuarios, fechaConHora) =>
  usuarios.map((u) => ({
    idUsuario: u.idUsuario,
    tipoEvento: TIPO_EVENTO_ORDEN_ESPECIAL,
    activo: 1,
    fechaCreacion: fechaConHora,
  }));

export const buildPayloadActualizar = (usuarios, fechaConHora) =>
  usuarios.map((u) => ({
    idUsuario: u.idUsuario,
    tipoEvento: TIPO_EVENTO_ORDEN_ESPECIAL,
    activo: u.activo,
    fechaActualizacion: fechaConHora,
  }));

export const filtrarUsuarios = (usuarios = [], busqueda = "", filtro = FILTROS.TODOS) => {
  const termino = normalizarTexto(busqueda);

  return usuarios.filter((u) => {
    if (filtro === FILTROS.ACTIVOS && !isActivo(u)) return false;
    if (filtro === FILTROS.INACTIVOS && isActivo(u)) return false;

    if (!termino) return true;

    const textoUsuario = normalizarTexto(
      `${u.nombreUsuario ?? ""} ${u.apellidoUsuario ?? ""} ${u.correoUsuario ?? ""}`
    );
    return textoUsuario.includes(termino);
  });
};