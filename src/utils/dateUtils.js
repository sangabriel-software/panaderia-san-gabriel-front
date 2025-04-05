import dayjs from "dayjs";
import 'dayjs/locale/es';

export const currentDate = () => {
    return dayjs().format("YYYY-MM-DD");
}

export const formatDateToDisplay = (date) => {
    return dayjs(date).format("DD/MM/YYYY");
};


export const getFormattedDateLetras = (fecha) => {
  return dayjs(fecha).locale('es').format('dddd, DD [de] MMMM [de] YYYY').toUpperCase();
};

export const getCurrentDateTimeWithSeconds = () => {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
};

