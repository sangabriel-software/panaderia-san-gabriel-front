import dayjs from "dayjs";

export const currentDate = () => {
    return dayjs().format("YYYY-MM-DD");
}

export const formatDateToDisplay = (date) => {
    return dayjs(date).format("DD/MM/YYYY");
};