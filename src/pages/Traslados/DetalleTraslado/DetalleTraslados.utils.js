import dayjs from "dayjs";

export const formatFechaCompleta = (fecha) => {
    return dayjs(fecha).format('dddd, D [de] MMMM [de] YYYY [a las] HH:mm');
};


